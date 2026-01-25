/**
 * Demo Voice Service
 * 
 * Manages the "listening" simulation for hands-free demo mode.
 */

import { SIMULATED_VOICE_RESPONSES } from '../data/simulatedVoiceResponses';
import IntentMatcher from './intentMatcher';

export interface SimulatedResult {
    transcript: string;
    value: any;
}

class DemoVoiceService {
    private isSimulating = false;

    /**
     * Simulate "listening" after TTS ends
     * Returns a promise that resolves with the simulated answer
     */
    async listenForAnswer(questionId: string | number): Promise<SimulatedResult | null> {
        if (this.isSimulating) return null;

        this.isSimulating = true;

        try {
            // 1. Wait 500ms before starting to "listen"
            await new Promise(resolve => setTimeout(resolve, 500));

            // 2. Simulate listening duration (1.5 - 2s)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 3. Select a simulated response
            const possibleResponses = SIMULATED_VOICE_RESPONSES[questionId];
            if (!possibleResponses || possibleResponses.length === 0) {
                this.isSimulating = false;
                return null;
            }

            const transcript = possibleResponses[Math.floor(Math.random() * possibleResponses.length)];

            // 4. Match intent
            const value = IntentMatcher.match(questionId, transcript);

            this.isSimulating = false;

            if (value !== null) {
                return { transcript, value };
            }

            return null;
        } catch (error) {
            console.error('[DemoVoice] Simulation failed:', error);
            this.isSimulating = false;
            return null;
        }
    }

    isListening(): boolean {
        return this.isSimulating;
    }
}

export default new DemoVoiceService();
