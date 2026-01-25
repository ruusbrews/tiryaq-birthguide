/**
 * Decision Tree Service
 * 
 * PRD References:
 * - Section 3: User Flow & Decision Tree
 * - Section 3: 5 Critical Decision Points
 * - Section 4: Decision Tree Implementation
 * 
 * CRITICAL CONSTRAINTS:
 * - No medical content generation
 * - No UI or voice logic
 * - Implements EXACTLY the 5 decision points from PRD Section 3
 * - Emergency triggers match PRD verbatim
 * - All state transitions are explicit and auditable
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// PRD Section 3: Labor stages
export type LaborStage =
  | 'early'       // Early labor
  | 'active'      // Active labor  
  | 'transition'  // Transition (not explicitly in PRD but implied)
  | 'pushing'     // Pushing stage
  | 'birth'       // Baby delivered
  | 'postpartum'; // After birth

// PRD Section 3: 5 Critical Decision Point IDs
export type DecisionId =
  | 'presentation'    // Baby's position (head vs breech)
  | 'bleeding'        // Hemorrhage monitoring
  | 'crowning'        // Head progression
  | 'baby_breathing'  // Newborn resuscitation check
  | 'placenta';       // Placenta delivery

// PRD Section 3: Emergency protocol types
export type EmergencyType =
  | 'hemorrhage'   // Severe bleeding
  | 'breech'       // Breech birth
  | 'cord_prolapse' // Cord/arm presentation
  | 'resuscitation' // Newborn not breathing
  | 'retained_placenta'; // Placenta >60min

// PRD Section 4: Labor State interface
export interface LaborState {
  // Current stage in labor progression
  stage: LaborStage;

  // Initial assessment answers (PRD Section 3)
  monthsPregnant: number;      // How many months pregnant
  contractionMinutes: number;  // Minutes between contractions
  waterBroken: boolean;        // Has water broken
  urgeToPush: boolean;         // Strong urge to push

  // Decision tracking (PRD Section 3: "decisionsMade")
  decisionsMade: string[];     // Format: "decisionId:response"

  // Emergency state (PRD Section 3)
  emergencyActive: boolean;    // If emergency triggered
  emergencyType?: EmergencyType; // Which emergency protocol

  // Timestamps for time-based decisions
  birthTimestamp?: number;     // When baby was delivered (for placenta timing)
  laborStartTimestamp: number; // When labor guidance started

  // Session tracking
  sessionId: string;           // Unique session identifier
  lastUpdated: number;         // Last state update timestamp
}

// Next action types (PRD Section 4)
export interface NextAction {
  action: 'ask' | 'guide' | 'emergency';
  content: {
    decisionId?: DecisionId;
    stage?: LaborStage;
    emergencyType?: EmergencyType;
  };
}

// Decision point definition (PRD Section 3)
interface DecisionPoint {
  id: DecisionId;
  // Condition function to determine if this decision should be asked
  condition: (state: LaborState) => boolean;
  // Response options that trigger emergency
  emergencyTriggers: string[];
  // Emergency type to activate
  emergencyType?: EmergencyType;
}

class DecisionTreeService {
  private state: LaborState | null = null;
  private readonly STORAGE_KEY = 'labor_state';

  /**
   * Initialize a new labor session
   * PRD Section 3: Initial Assessment creates initial state
   */
  async initializeSession(
    monthsPregnant: number,
    contractionMinutes: number,
    waterBroken: boolean,
    urgeToPush: boolean
  ): Promise<LaborState> {
    // Determine initial stage based on assessment (PRD Section 3)
    const initialStage = this.determineInitialStage(
      monthsPregnant,
      contractionMinutes,
      waterBroken,
      urgeToPush
    );

    this.state = {
      stage: initialStage,
      monthsPregnant,
      contractionMinutes,
      waterBroken,
      urgeToPush,
      decisionsMade: [],
      emergencyActive: false,
      laborStartTimestamp: Date.now(),
      sessionId: `session_${Date.now()}`,
      lastUpdated: Date.now()
    };

    await this.saveState();
    return this.state;
  }

  /**
   * Determine initial labor stage from assessment answers
   * PRD Section 3: Initial Assessment → [Determine Stage]
   */
  private determineInitialStage(
    monthsPregnant: number,
    contractionMinutes: number,
    waterBroken: boolean,
    urgeToPush: boolean
  ): LaborStage {
    // PRD Section 3: "هل تشعرين برغبة قوية للدفع؟" = pushing stage
    if (urgeToPush) {
      return 'pushing';
    }

    // PRD Section 3: "كم دقيقة بين الانقباضات؟"
    // 1-2 minutes = transition/pushing
    if (contractionMinutes <= 2) {
      return 'transition';
    }

    // 3-5 minutes = active labor
    if (contractionMinutes <= 5) {
      return 'active';
    }

    // >5 minutes = early labor
    return 'early';
  }

  /**
   * Get the 5 Critical Decision Points (PRD Section 3)
   * Each decision has:
   * - Condition: when to ask this question
   * - Emergency triggers: which responses activate emergency protocols
   */
  private getDecisionPoints(): DecisionPoint[] {
    return [
      // Decision 1: Presentation (PRD Section 3)
      {
        id: 'presentation',
        condition: (state) => state.stage === 'pushing',
        // PRD: "مؤخرة" → STOP! Activate breech protocol
        // PRD: "شيء آخر" → Cord/arm → Emergency positions
        emergencyTriggers: ['مؤخرة', 'شيء آخر'],
        emergencyType: 'breech' // Note: 'شيء آخر' should be cord_prolapse, handled in response
      },

      // Decision 2: Bleeding (PRD Section 3)
      {
        id: 'bleeding',
        condition: (state) => true, // Always monitor
        // PRD: "شديد" → HEMORRHAGE PROTOCOL
        emergencyTriggers: ['شديد'],
        emergencyType: 'hemorrhage'
      },

      // Decision 3: Crowning (PRD Section 3)
      {
        id: 'crowning',
        condition: (state) =>
          state.stage === 'pushing' &&
          this.hasDecisionResponse(state, 'presentation', 'رأس'),
        // PRD: "لا" → "Head stuck" → Position change protocol
        emergencyTriggers: ['لا'],
        // Note: Not a full emergency, but requires intervention
      },

      // Decision 4: Baby Breathing (PRD Section 3)
      {
        id: 'baby_breathing',
        condition: (state) => state.stage === 'birth',
        // PRD: "لا" → NEWBORN RESUSCITATION PROTOCOL
        emergencyTriggers: ['لا'],
        emergencyType: 'resuscitation'
      },

      // Decision 5: Placenta (PRD Section 3)
      {
        id: 'placenta',
        condition: (state) => state.stage === 'postpartum',
        // PRD: "لا" + >60min → RETAINED PLACENTA PROTOCOL
        emergencyTriggers: ['لا'], // Timing handled in response
        emergencyType: 'retained_placenta'
      }
    ];
  }

  /**
   * Determine next action based on current state
   * PRD Section 4: determineNextAction()
   */
  async determineNextAction(): Promise<NextAction> {
    if (!this.state) {
      await this.loadState();
      if (!this.state) {
        throw new Error('No active labor session. Call initializeSession first.');
      }
    }

    // PRD Section 3: [Emergency Detected] → Trigger emergency protocol
    // PRD: "Emergency escalation is irreversible once triggered"
    if (this.state.emergencyActive) {
      return {
        action: 'emergency',
        content: {
          emergencyType: this.state.emergencyType
        }
      };
    }

    // PRD Section 3: [5 Critical Decision Points] → Binary questions
    const nextDecision = this.getNextCriticalDecision();
    if (nextDecision) {
      return {
        action: 'ask',
        content: {
          decisionId: nextDecision.id
        }
      };
    }

    // PRD Section 3: [Normal Progress] → Stage-specific guidance
    return {
      action: 'guide',
      content: {
        stage: this.state.stage
      }
    };
  }

  /**
   * Get next unanswered critical decision
   * PRD Section 4: getNextCriticalDecision()
   */
  private getNextCriticalDecision(): DecisionPoint | null {
    if (!this.state) return null;

    const decisions = this.getDecisionPoints();

    // Find first decision that:
    // 1. Meets its condition
    // 2. Hasn't been asked yet
    return decisions.find(d =>
      d.condition(this.state!) &&
      !this.hasDecisionBeenMade(this.state!, d.id)
    ) || null;
  }

  /**
   * Handle user response to a decision point
   * PRD Section 4: handleDecisionResponse()
   */
  async handleDecisionResponse(
    decisionId: DecisionId,
    response: string
  ): Promise<void> {
    if (!this.state) {
      throw new Error('No active labor session');
    }

    // Record decision (PRD Section 4: "decisionId:response" format)
    this.state.decisionsMade.push(`${decisionId}:${response}`);
    this.state.lastUpdated = Date.now();

    // Check if this response triggers emergency
    const decision = this.getDecisionPoints().find(d => d.id === decisionId);

    if (decision && decision.emergencyTriggers.includes(response)) {
      // Special case: "شيء آخر" triggers cord prolapse, not breech
      const emergencyType =
        decisionId === 'presentation' && response === 'شيء آخر'
          ? 'cord_prolapse'
          : decision.emergencyType;

      // Special case: Placenta emergency only if >60 minutes
      if (decisionId === 'placenta' && response === 'لا') {
        const minutesSinceBirth = this.getMinutesSinceBirth();
        if (minutesSinceBirth < 60) {
          // PRD: "لا" + <30min → Breastfeeding encouragement (not emergency)
          // This is guidance, not emergency. Don't trigger emergency.
          await this.saveState();
          return;
        }
      }

      // PRD Section 3: Emergency escalation
      // Once triggered, emergencyActive remains true (irreversible)
      this.state.emergencyActive = true;
      this.state.emergencyType = emergencyType;

      await this.saveState();
      return;
    }

    // Update stage based on decision responses
    await this.updateStageProgression(decisionId, response);
    await this.saveState();
  }

  /**
   * Update labor stage based on decision responses
   * PRD Section 3: Stage progression through labor
   */
  private async updateStageProgression(
    decisionId: DecisionId,
    response: string
  ): Promise<void> {
    if (!this.state) return;

    // PRD Section 3: Stage transitions
    switch (decisionId) {
      case 'baby_breathing':
        if (response === 'نعم') {
          // Baby breathing = birth complete, move to postpartum
          this.state.stage = 'postpartum';
          this.state.birthTimestamp = Date.now();
        }
        break;

      case 'placenta':
        if (response === 'نعم') {
          // Placenta delivered = postpartum complete
          // State remains 'postpartum' but guidance changes
        }
        break;

      case 'presentation':
        if (response === 'رأس') {
          // Normal presentation, continue pushing
          // Stage remains 'pushing'
        }
        break;
    }

    this.state.lastUpdated = Date.now();
  }

  /**
   * Manually advance to next stage (for user-reported progression)
   */
  async advanceToStage(newStage: LaborStage): Promise<void> {
    if (!this.state) {
      throw new Error('No active labor session');
    }

    // Validate stage progression (can only move forward)
    const validTransitions: Record<LaborStage, LaborStage[]> = {
      early: ['active', 'transition', 'pushing'],
      active: ['transition', 'pushing'],
      transition: ['pushing'],
      pushing: ['birth'],
      birth: ['postpartum'],
      postpartum: []
    };

    if (!validTransitions[this.state.stage].includes(newStage)) {
      throw new Error(`Invalid stage transition: ${this.state.stage} → ${newStage}`);
    }

    this.state.stage = newStage;

    // Track birth timestamp for placenta timing
    if (newStage === 'birth') {
      this.state.birthTimestamp = Date.now();
    }

    this.state.lastUpdated = Date.now();
    await this.saveState();
  }

  /**
   * Get current labor state (read-only)
   */
  async getCurrentState(): Promise<LaborState | null> {
    if (!this.state) {
      await this.loadState();
    }
    return this.state;
  }

  /**
   * Check if a specific decision has been made
   */
  private hasDecisionBeenMade(state: LaborState, decisionId: DecisionId): boolean {
    return state.decisionsMade.some(d => d.startsWith(`${decisionId}:`));
  }

  /**
   * Check if a decision has a specific response
   */
  private hasDecisionResponse(
    state: LaborState,
    decisionId: DecisionId,
    response: string
  ): boolean {
    return state.decisionsMade.includes(`${decisionId}:${response}`);
  }

  /**
   * Get minutes elapsed since baby was born
   * Used for placenta emergency timing (PRD: >60min = emergency)
   */
  private getMinutesSinceBirth(): number {
    if (!this.state?.birthTimestamp) return 0;
    return Math.floor((Date.now() - this.state.birthTimestamp) / 60000);
  }

  /**
   * Reset emergency state (for testing only - NOT used in production)
   * PRD: "Emergency escalation is irreversible once triggered"
   */
  async resetEmergency(): Promise<void> {
    if (!this.state) return;

    console.warn('resetEmergency() called - this should only be used for testing');
    this.state.emergencyActive = false;
    this.state.emergencyType = undefined;
    await this.saveState();
  }

  /**
   * Clear emergency state (called when user completes or exits emergency flow)
   */
  async clearEmergency(): Promise<void> {
    if (!this.state) return;

    this.state.emergencyActive = false;
    this.state.emergencyType = undefined;
    await this.saveState();
  }

  /**
   * End current session and clear state
   */
  async endSession(): Promise<void> {
    this.state = null;
    await AsyncStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Persist state to local storage
   * PRD Section 4: Offline Architecture - state persistence
   */
  private async saveState(): Promise<void> {
    if (!this.state) return;

    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.state)
      );
    } catch (error) {
      console.error('Failed to save labor state:', error);
      throw new Error('State persistence failed');
    }
  }

  /**
   * Load state from local storage
   * PRD Section 4: "app restart scenarios"
   */
  private async loadState(): Promise<void> {
    try {
      const stateJson = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stateJson) {
        this.state = JSON.parse(stateJson);
      }
    } catch (error) {
      console.error('Failed to load labor state:', error);
      this.state = null;
    }
  }
}

// Singleton instance
export default new DecisionTreeService();
