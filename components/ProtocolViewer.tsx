/**
 * Protocol Viewer Component
 * 
 * CRITICAL CONSTRAINTS:
 * - NO conditional medical logic (just renders provided protocol data)
 * - Only step-by-step rendering
 * - Voice + visual MUST stay in sync
 * - User can NEVER skip steps
 * - Emergency mode overrides navigation
 * - Accidental dismissal MUST be prevented
 * 
 * DISMISSAL PREVENTION STRATEGY:
 * 1. Modal requires explicit "Exit" button tap (no swipe dismiss)
 * 2. Back button shows confirmation dialog in emergency mode
 * 3. Completion requires tapping through ALL steps
 * 4. No gestures that close the protocol
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    BackHandler,
    Alert,
    ActivityIndicator,
} from 'react-native';
import voiceService, { SpeechResult } from '../services/voice';

/**
 * Protocol step data structure
 * Each step is a discrete instruction to be followed
 */
export interface ProtocolStep {
    id: string;              // Unique step identifier
    instruction: string;     // Arabic instruction text
    critical?: boolean;      // Is this a critical safety step?
    requiresConfirmation?: boolean; // Does user need to confirm before proceeding?
}

/**
 * Protocol data structure
 * Represents a complete emergency or guidance protocol
 */
export interface Protocol {
    id: string;              // Protocol identifier (e.g., 'hemorrhage', 'breech')
    title: string;           // Protocol title (Arabic)
    isEmergency: boolean;    // Is this an emergency protocol?
    steps: ProtocolStep[];   // Ordered list of steps
    warningMessage?: string; // Optional warning shown before starting
}

/**
 * ProtocolViewer Props
 */
interface ProtocolViewerProps {
    protocol: Protocol | null;    // Protocol to display (null = hidden)
    onComplete: () => void;       // Called when user completes all steps
    onExit: () => void;          // Called when user explicitly exits
    visible: boolean;            // Controls modal visibility
}

/**
 * ProtocolViewer Component
 * 
 * Renders emergency and guidance protocols step-by-step
 * Ensures user cannot skip steps or accidentally dismiss
 */
const ProtocolViewer: React.FC<ProtocolViewerProps> = ({
    protocol,
    onComplete,
    onExit,
    visible,
}) => {
    // Current step index (0-based)
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    // Whether TTS is currently speaking
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Whether waiting for user confirmation on critical step
    const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);

    // Track if protocol has been started (for dismissal prevention)
    const [protocolStarted, setProtocolStarted] = useState(false);

    // Reference to track component mount state
    const isMounted = useRef(true);

    /**
     * DISMISSAL PREVENTION #1: Hardware back button handler
     * 
     * On Android, prevents accidental back button dismissal
     * Shows confirmation dialog for emergency protocols
     */
    useEffect(() => {
        if (!visible || !protocol) return;

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            // EMERGENCY MODE: Require confirmation to exit
            if (protocol.isEmergency && protocolStarted) {
                Alert.alert(
                    'تحذير', // Warning
                    'هل أنت متأكدة من الخروج من بروتوكول الطوارئ؟', // Are you sure you want to exit emergency protocol?
                    [
                        {
                            text: 'لا، ابقي هنا', // No, stay here
                            style: 'cancel',
                        },
                        {
                            text: 'نعم، اخرج', // Yes, exit
                            style: 'destructive',
                            onPress: handleExit,
                        },
                    ],
                    { cancelable: false } // CRITICAL: Cannot dismiss by tapping outside
                );
                return true; // Prevent default back behavior
            }

            // NON-EMERGENCY: Allow exit with confirmation
            Alert.alert(
                'خروج', // Exit
                'هل تريدين الخروج؟', // Do you want to exit?
                [
                    { text: 'لا', style: 'cancel' },
                    { text: 'نعم', onPress: handleExit },
                ]
            );
            return true; // Prevent default back behavior
        });

        return () => backHandler.remove();
    }, [visible, protocol, protocolStarted]);

    /**
     * Auto-speak current step when it changes
     * Ensures voice + visual stay in sync
     */
    useEffect(() => {
        if (!visible || !protocol) return;

        const currentStep = protocol.steps[currentStepIndex];
        if (!currentStep) return;

        speakCurrentStep();

        return () => {
            // Cleanup: Stop speaking when component unmounts or step changes
            voiceService.stopSpeaking();
        };
    }, [currentStepIndex, visible, protocol]);

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            isMounted.current = false;
            voiceService.stopSpeaking();
        };
    }, []);

    /**
     * Speak the current step using TTS
     * SYNC GUARANTEE: Voice matches displayed text
     */
    const speakCurrentStep = async () => {
        if (!protocol) return;

        const currentStep = protocol.steps[currentStepIndex];
        if (!currentStep) return;

        setIsSpeaking(true);

        const result: SpeechResult = await voiceService.speak(currentStep.instruction);

        if (isMounted.current) {
            setIsSpeaking(false);
        }

        // If TTS failed, user still sees text on screen
        if (result.fallbackToText) {
            console.log('[ProtocolViewer] TTS unavailable, showing text only');
        }
    };

    /**
     * Advance to next step
     * CONSTRAINT: Cannot skip - must go sequentially
     */
    const handleNextStep = () => {
        if (!protocol) return;

        const currentStep = protocol.steps[currentStepIndex];

        // CRITICAL STEP: Require confirmation before advancing
        if (currentStep.requiresConfirmation && !waitingForConfirmation) {
            setWaitingForConfirmation(true);

            Alert.alert(
                'تأكيد', // Confirmation
                'هل أكملت هذه الخطوة؟', // Have you completed this step?
                [
                    {
                        text: 'لا، لم أكمل', // No, not yet
                        style: 'cancel',
                        onPress: () => setWaitingForConfirmation(false),
                    },
                    {
                        text: 'نعم، أكملت', // Yes, completed
                        onPress: () => {
                            setWaitingForConfirmation(false);
                            proceedToNext();
                        },
                    },
                ],
                { cancelable: false } // DISMISSAL PREVENTION: Must choose option
            );

            return;
        }

        proceedToNext();
    };

    /**
     * Actually proceed to next step or complete protocol
     */
    const proceedToNext = () => {
        if (!protocol) return;

        // Mark protocol as started (for dismissal prevention)
        if (!protocolStarted) {
            setProtocolStarted(true);
        }

        // Check if this was the last step
        if (currentStepIndex >= protocol.steps.length - 1) {
            handleComplete();
        } else {
            // Advance to next step (NO SKIPPING ALLOWED)
            setCurrentStepIndex(currentStepIndex + 1);
        }
    };

    /**
     * Go back to previous step
     * Only allowed in non-emergency protocols
     */
    const handlePreviousStep = () => {
        if (!protocol) return;

        // EMERGENCY MODE: Cannot go backwards
        if (protocol.isEmergency) {
            Alert.alert(
                'تحذير', // Warning
                'لا يمكن العودة للخلف في بروتوكول الطوارئ', // Cannot go back in emergency protocol
                [{ text: 'حسناً' }] // OK
            );
            return;
        }

        // NON-EMERGENCY: Allow going back
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    /**
     * Complete the protocol
     * User has gone through ALL steps sequentially
     */
    const handleComplete = () => {
        voiceService.stopSpeaking();
        setCurrentStepIndex(0);
        setProtocolStarted(false);
        onComplete();
    };

    /**
     * Exit the protocol (with confirmation already shown)
     */
    const handleExit = () => {
        voiceService.stopSpeaking();
        setCurrentStepIndex(0);
        setProtocolStarted(false);
        onExit();
    };

    /**
     * Restart current step (replay voice)
     */
    const handleRepeatStep = () => {
        speakCurrentStep();
    };

    // Don't render if no protocol provided
    if (!protocol) {
        return null;
    }

    const currentStep = protocol.steps[currentStepIndex];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === protocol.steps.length - 1;

    return (
        <Modal
            visible={!!visible}
            transparent={false}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={() => {
                // DISMISSAL PREVENTION #2: onRequestClose (Android back, iOS swipe)
                // This is called when user tries to dismiss
                // We handle it the same way as back button
                if (protocol.isEmergency && protocolStarted) {
                    Alert.alert(
                        'تحذير',
                        'هل أنت متأكدة من الخروج من بروتوكول الطوارئ؟',
                        [
                            { text: 'لا، ابقي هنا', style: 'cancel' },
                            { text: 'نعم، اخرج', style: 'destructive', onPress: handleExit },
                        ],
                        { cancelable: false }
                    );
                } else {
                    Alert.alert(
                        'خروج',
                        'هل تريدين الخروج؟',
                        [
                            { text: 'لا', style: 'cancel' },
                            { text: 'نعم', onPress: handleExit },
                        ]
                    );
                }
            }}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={[
                    styles.header,
                    protocol.isEmergency && styles.emergencyHeader
                ]}>
                    <Text style={styles.headerTitle}>{protocol.title}</Text>
                    <Text style={styles.stepCounter}>
                        {currentStepIndex + 1} / {protocol.steps.length}
                    </Text>
                </View>

                {/* Emergency Warning Badge */}
                {protocol.isEmergency && (
                    <View style={styles.emergencyBanner}>
                        <Text style={styles.emergencyText}>⚠️ بروتوكول طوارئ</Text>
                    </View>
                )}

                {/* Step Content */}
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                >
                    {/* Step Number Indicator */}
                    <View style={styles.stepIndicator}>
                        <Text style={styles.stepNumber}>خطوة {currentStepIndex + 1}</Text>
                        {currentStep.critical && (
                            <View style={styles.criticalBadge}>
                                <Text style={styles.criticalText}>حرجة</Text>
                            </View>
                        )}
                    </View>

                    {/* Instruction Text (Large, readable) */}
                    <Text style={styles.instructionText}>
                        {currentStep.instruction}
                    </Text>

                    {/* Speaking Indicator */}
                    {isSpeaking && (
                        <View style={styles.speakingIndicator}>
                            <ActivityIndicator size="small" color="#007AFF" />
                            <Text style={styles.speakingText}>جاري القراءة...</Text>
                        </View>
                    )}

                    {/* Repeat Button */}
                    <TouchableOpacity
                        style={styles.repeatButton}
                        onPress={handleRepeatStep}
                        disabled={isSpeaking}
                    >
                        <Text style={styles.repeatButtonText}>
                            🔊 إعادة قراءة الخطوة
                        </Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Navigation Controls */}
                <View style={styles.navigationContainer}>
                    {/* Previous Button (hidden in emergency mode or first step) */}
                    {!protocol.isEmergency && !isFirstStep && (
                        <TouchableOpacity
                            style={[styles.navButton, styles.previousButton]}
                            onPress={handlePreviousStep}
                        >
                            <Text style={styles.navButtonText}>← السابق</Text>
                        </TouchableOpacity>
                    )}

                    {/* Next/Complete Button */}
                    <TouchableOpacity
                        style={[
                            styles.navButton,
                            styles.nextButton,
                            protocol.isEmergency && styles.emergencyButton,
                            (!protocol.isEmergency && !isFirstStep) && styles.flexButton
                        ]}
                        onPress={handleNextStep}
                        disabled={isSpeaking}
                    >
                        <Text style={styles.navButtonTextPrimary}>
                            {isLastStep ? '✓ إكمال' : 'التالي →'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Exit Button (bottom, subtle) */}
                {!protocol.isEmergency && (
                    <TouchableOpacity
                        style={styles.exitButton}
                        onPress={() => {
                            Alert.alert(
                                'خروج',
                                'هل تريدين الخروج؟',
                                [
                                    { text: 'لا', style: 'cancel' },
                                    { text: 'نعم', onPress: handleExit },
                                ]
                            );
                        }}
                    >
                        <Text style={styles.exitButtonText}>خروج</Text>
                    </TouchableOpacity>
                )}

                {/* Emergency Exit (requires confirmation) */}
                {protocol.isEmergency && (
                    <TouchableOpacity
                        style={styles.emergencyExitButton}
                        onPress={() => {
                            Alert.alert(
                                'تحذير',
                                'هل أنت متأكدة من الخروج من بروتوكول الطوارئ؟',
                                [
                                    { text: 'لا، ابقي هنا', style: 'cancel' },
                                    { text: 'نعم، اخرج', style: 'destructive', onPress: handleExit },
                                ],
                                { cancelable: false }
                            );
                        }}
                    >
                        <Text style={styles.emergencyExitText}>خروج من الطوارئ</Text>
                    </TouchableOpacity>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#007AFF',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    emergencyHeader: {
        backgroundColor: '#FF3B30', // Red for emergency
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 8,
    },
    stepCounter: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
    },
    emergencyBanner: {
        backgroundColor: '#FFD60A',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#FF9500',
    },
    emergencyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    stepNumber: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    criticalBadge: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 10,
    },
    criticalText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    instructionText: {
        fontSize: 22,
        lineHeight: 34,
        color: '#000',
        textAlign: 'right', // Arabic RTL
        marginBottom: 30,
        fontWeight: '500',
    },
    speakingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
        marginBottom: 20,
    },
    speakingText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#007AFF',
    },
    repeatButton: {
        backgroundColor: 'white',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#007AFF',
        alignItems: 'center',
    },
    repeatButtonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    navigationContainer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    navButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previousButton: {
        backgroundColor: '#E0E0E0',
        flex: 1,
    },
    nextButton: {
        backgroundColor: '#007AFF',
        flex: 2,
    },
    flexButton: {
        flex: 1,
    },
    emergencyButton: {
        backgroundColor: '#FF3B30',
    },
    navButtonText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    navButtonTextPrimary: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
    },
    exitButton: {
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    exitButtonText: {
        fontSize: 14,
        color: '#666',
    },
    emergencyExitButton: {
        paddingVertical: 16,
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        borderTopWidth: 1,
        borderTopColor: '#FFB74D',
    },
    emergencyExitText: {
        fontSize: 14,
        color: '#E65100',
        fontWeight: '600',
    },
});

export default ProtocolViewer;
