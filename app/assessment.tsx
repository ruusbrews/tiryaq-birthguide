/**
 * Initial Assessment Screen
 * 
 * PRD Section 3: Initial Assessment
 * 
 * CRITICAL CONSTRAINTS:
 * - Large touch targets (minimum 60px height)
 * - Voice + button parity (both must work equally)
 * - Clear fallback when voice fails (always show buttons)
 * - No navigation shortcuts (must answer all questions sequentially)
 * - State persistence after every response (save immediately)
 * 
 * PRD QUESTIONS (VERBATIM):
 * 1. "كم دقيقة بين الانقباضات؟" - How many minutes between contractions?
 * 2. "هل انفجر الكيس المائي؟" - Has the water broken?
 * 3. "هل تشعرين برغبة قوية للدفع؟" - Do you feel a strong urge to push?
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import voiceService from '../services/voice';
import demoVoiceService from '../services/demoVoice';
import decisionTreeService from '../services/decisionTree';

// Assessment state storage key
const ASSESSMENT_STATE_KEY = 'assessment_state';

// Assessment question step
interface AssessmentQuestion {
    id: number;
    questionText: string;
    options: AssessmentOption[];
    type: 'single' | 'number';
}

// Answer option
interface AssessmentOption {
    label: string;
    value: string | number | boolean;
}

// Saved assessment state
interface AssessmentState {
    currentQuestionIndex: number;
    answers: {
        monthsPregnant?: number;
        contractionMinutes?: number;
        waterBroken?: boolean;
        urgeToPush?: boolean;
    };
    lastUpdated: number;
}

/**
 * Assessment Screen Component
 * 
 * Guides user through initial assessment questions
 * Persists state after each answer
 */
const AssessmentScreen: React.FC = () => {
    const router = useRouter(); // Initialize router
    // Current question index (0-based)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // User's answers
    const [answers, setAnswers] = useState<AssessmentState['answers']>({});

    // Voice capabilities
    const [voiceAvailable, setVoiceAvailable] = useState(false);

    // Loading states
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [simulatedTranscript, setSimulatedTranscript] = useState<string | null>(null);

    /**
     * PRD Assessment Questions (VERBATIM from PRD Section 3)
     */
    const questions: AssessmentQuestion[] = [
        {
            id: 0,
            questionText: 'في أي شهر من الحمل أنتِ؟',
            type: 'single',
            options: [
                { label: 'أقل من 7 أشهر', value: 6 },
                { label: 'الشهر السابع', value: 7 },
                { label: 'الشهر الثامن', value: 8 },
                { label: 'الشهر التاسع', value: 9 },
            ],
        },
        {
            id: 1,
            questionText: 'كم دقيقة بين الانقباضات؟',
            type: 'single',
            options: [
                { label: 'أقل من دقيقة', value: 1 },
                { label: '1-2 دقيقة', value: 2 },
                { label: '3-5 دقائق', value: 4 },
                { label: '5-10 دقائق', value: 7 },
                { label: 'أكثر من 10 دقائق', value: 12 },
            ],
        },
        {
            id: 2,
            questionText: 'هل انفجر الكيس المائي؟',
            type: 'single',
            options: [
                { label: 'نعم', value: true },
                { label: 'لا', value: false },
                { label: 'غير متأكدة', value: false },
            ],
        },
        {
            id: 3,
            questionText: 'هل تشعرين برغبة قوية للدفع؟',
            type: 'single',
            options: [
                { label: 'نعم', value: true },
                { label: 'لا', value: false },
            ],
        },
    ];

    /**
     * Initialize: Load saved state and check voice capabilities
     */
    useEffect(() => {
        initializeAssessment();
    }, []);

    /**
     * Auto-speak current question when it changes
     * VOICE + BUTTON PARITY: Voice is optional, buttons always visible
     */
    useEffect(() => {
        if (!isInitializing) {
            // Always show buttons, but speak if voice available
            if (voiceAvailable) {
                speakCurrentQuestion();
            }
        }
    }, [currentQuestionIndex, isInitializing]);

    /**
     * Initialize assessment: load state and voice capabilities
     */
    const initializeAssessment = async () => {
        try {
            // Load saved assessment state (if any)
            const savedState = await loadAssessmentState();
            if (savedState) {
                setCurrentQuestionIndex(savedState.currentQuestionIndex);
                setAnswers(savedState.answers);
            }

            // Check voice capabilities
            const capabilities = await voiceService.getCapabilities();
            setVoiceAvailable(capabilities.ttsAvailable);

            setIsInitializing(false);
        } catch (error) {
            console.error('[Assessment] Initialization failed:', error);
            setIsInitializing(false);
            // Continue anyway - assessment works without voice
        }
    };

    /**
     * Speak current question using TTS
     * FALLBACK: If voice fails, buttons are already visible
     */
    const speakCurrentQuestion = async () => {
        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion) return;

        setIsSpeaking(true);
        const result = await voiceService.speak(currentQuestion.questionText);
        setIsSpeaking(false);

        // If TTS failed, user still sees text and buttons
        if (result.fallbackToText) {
            console.log('[Assessment] Voice unavailable, using buttons only');
        }

        // DEMO MODE: Start simulation after speech
        if (voiceService.DEMO_VOICE_MODE) {
            handleVoiceSimulation();
        }
    };

    /**
     * Handle simulated voice input (Demo Mode)
     */
    const handleVoiceSimulation = async () => {
        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion) return;

        setIsListening(true);
        const result = await demoVoiceService.listenForAnswer(currentQuestion.id);
        setIsListening(false);

        if (result && result.value !== null) {
            setSimulatedTranscript(result.transcript);

            // Wait a moment to show the transcript before proceeding
            setTimeout(() => {
                handleAnswerSelect(result.value);
                setSimulatedTranscript(null);
            }, 1000);
        }
    };

    /**
     * Handle answer selection
     * STATE PERSISTENCE: Save immediately after each answer
     */
    const handleAnswerSelect = async (value: string | number | boolean) => {
        // Stop any ongoing speech
        await voiceService.stopSpeaking();
        setIsSpeaking(false);

        // Record answer based on question
        const newAnswers = { ...answers };
        const currentQuestion = questions[currentQuestionIndex];

        switch (currentQuestion.id) {
            case 0:
                newAnswers.monthsPregnant = value as number;
                break;
            case 1:
                newAnswers.contractionMinutes = value as number;
                break;
            case 2:
                newAnswers.waterBroken = value as boolean;
                break;
            case 3:
                newAnswers.urgeToPush = value as boolean;
                break;
        }

        setAnswers(newAnswers);

        // STATE PERSISTENCE: Save immediately
        await saveAssessmentState(currentQuestionIndex, newAnswers);

        // Move to next question or complete assessment
        if (currentQuestionIndex < questions.length - 1) {
            // NO NAVIGATION SHORTCUTS: Must go to next question sequentially
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // All questions answered - complete assessment
            await completeAssessment(newAnswers);
        }
    };

    /**
     * Complete assessment and initialize labor session
     */
    const completeAssessment = async (finalAnswers: AssessmentState['answers']) => {
        if (
            finalAnswers.monthsPregnant === undefined ||
            finalAnswers.contractionMinutes === undefined ||
            finalAnswers.waterBroken === undefined ||
            finalAnswers.urgeToPush === undefined
        ) {
            Alert.alert('خطأ', 'يرجى الإجابة على جميع الأسئلة');
            return;
        }

        setIsProcessing(true);

        try {
            // Initialize decision tree session with assessment answers
            await decisionTreeService.initializeSession(
                finalAnswers.monthsPregnant,
                finalAnswers.contractionMinutes,
                finalAnswers.waterBroken,
                finalAnswers.urgeToPush
            );

            // Clear saved assessment state
            await AsyncStorage.removeItem(ASSESSMENT_STATE_KEY);

            // Navigate to main guidance screen
            router.replace('/guide');

            setIsProcessing(false);
        } catch (error) {
            console.error('[Assessment] Failed to complete:', error);
            Alert.alert('خطأ', 'حدث خطأ أثناء حفظ التقييم');
            setIsProcessing(false);
        }
    };

    /**
     * Go back to previous question
     * Only allowed if not on first question
     */
    const handlePreviousQuestion = async () => {
        if (currentQuestionIndex > 0) {
            await voiceService.stopSpeaking();
            setIsSpeaking(false);
            setCurrentQuestionIndex(currentQuestionIndex - 1);

            // Save state with new index
            await saveAssessmentState(currentQuestionIndex - 1, answers);
        }
    };

    /**
     * Repeat current question (voice)
     */
    const handleRepeatQuestion = () => {
        speakCurrentQuestion();
    };

    /**
     * Save assessment state to persistent storage
     * CALLED AFTER EVERY ANSWER
     */
    const saveAssessmentState = async (
        questionIndex: number,
        currentAnswers: AssessmentState['answers']
    ): Promise<void> => {
        try {
            const state: AssessmentState = {
                currentQuestionIndex: questionIndex,
                answers: currentAnswers,
                lastUpdated: Date.now(),
            };

            await AsyncStorage.setItem(ASSESSMENT_STATE_KEY, JSON.stringify(state));
            console.log('[Assessment] State saved:', state);
        } catch (error) {
            console.error('[Assessment] Failed to save state:', error);
            // Don't block user flow if save fails
        }
    };

    /**
     * Load saved assessment state
     */
    const loadAssessmentState = async (): Promise<AssessmentState | null> => {
        try {
            const stateJson = await AsyncStorage.getItem(ASSESSMENT_STATE_KEY);
            if (stateJson) {
                const state: AssessmentState = JSON.parse(stateJson);
                console.log('[Assessment] State loaded:', state);
                return state;
            }
            return null;
        } catch (error) {
            console.error('[Assessment] Failed to load state:', error);
            return null;
        }
    };

    // Show loading screen while initializing
    if (isInitializing) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>جاري التحميل...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>
                        السؤال {currentQuestionIndex + 1} من {questions.length}
                    </Text>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` },
                            ]}
                        />
                    </View>
                </View>

                {/* Question Text */}
                <View style={styles.questionContainer}>
                    <Text style={styles.questionText}>{currentQuestion.questionText}</Text>

                    {/* Speaking Indicator */}
                    {isSpeaking && (
                        <View style={styles.speakingIndicator}>
                            <ActivityIndicator size="small" color="#007AFF" />
                            <Text style={styles.speakingText}>جاري القراءة...</Text>
                        </View>
                    )}

                    {/* Repeat Button (if voice available) */}
                    {voiceAvailable && (
                        <TouchableOpacity
                            style={styles.repeatButton}
                            onPress={handleRepeatQuestion}
                            disabled={isSpeaking}
                        >
                            <Text style={styles.repeatButtonText}>🔊 إعادة قراءة السؤال</Text>
                        </TouchableOpacity>
                    )}

                    {/* Listening Indicator (Demo Mode) */}
                    {isListening && (
                        <View style={styles.listeningIndicator}>
                            <ActivityIndicator size="small" color="#FF3B30" />
                            <Text style={styles.listeningText}>جاري الاستماع... (Demo)</Text>
                        </View>
                    )}

                    {/* Simulated Transcript */}
                    {simulatedTranscript && (
                        <View style={styles.transcriptContainer}>
                            <Text style={styles.transcriptText}>"{simulatedTranscript}"</Text>
                        </View>
                    )}
                </View>

                {/* Answer Options */}
                {/* LARGE TOUCH TARGETS: Minimum 60px height */}
                <View style={styles.optionsContainer}>
                    {currentQuestion.options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.optionButton,
                                // Highlight selected answer
                                answers[
                                currentQuestion.id === 0
                                    ? 'monthsPregnant'
                                    : currentQuestion.id === 1
                                        ? 'contractionMinutes'
                                        : currentQuestion.id === 2
                                            ? 'waterBroken'
                                            : 'urgeToPush'
                                ] === option.value && styles.optionButtonSelected,
                            ]}
                            onPress={() => handleAnswerSelect(option.value)}
                            disabled={isProcessing}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    answers[
                                    currentQuestion.id === 0
                                        ? 'monthsPregnant'
                                        : currentQuestion.id === 1
                                            ? 'contractionMinutes'
                                            : currentQuestion.id === 2
                                                ? 'waterBroken'
                                                : 'urgeToPush'
                                    ] === option.value && styles.optionTextSelected,
                                ]}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Voice Unavailable Message */}
                {!voiceAvailable && (
                    <View style={styles.voiceUnavailableContainer}>
                        <Text style={styles.voiceUnavailableText}>
                            ℹ️ الصوت غير متاح - استخدمي الأزرار للإجابة
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Navigation Buttons */}
            <View style={styles.navigationContainer}>
                {/* Previous Button (hidden on first question) */}
                {!isFirstQuestion && (
                    <TouchableOpacity
                        style={[styles.navButton, styles.previousButton]}
                        onPress={handlePreviousQuestion}
                        disabled={isProcessing}
                    >
                        <Text style={styles.navButtonText}>← السابق</Text>
                    </TouchableOpacity>
                )}

                {/* Processing Indicator */}
                {isProcessing && (
                    <View style={styles.processingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.processingText}>جاري المعالجة...</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 18,
        color: '#666',
    },
    progressContainer: {
        marginBottom: 32,
    },
    progressText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 12,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#007AFF',
        borderRadius: 4,
    },
    questionContainer: {
        marginBottom: 32,
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    questionText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#000',
        textAlign: 'right',
        lineHeight: 36,
        marginBottom: 16,
    },
    speakingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
        marginTop: 12,
    },
    speakingText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#007AFF',
    },
    repeatButton: {
        marginTop: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
        alignItems: 'center',
    },
    repeatButtonText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500',
    },
    listeningIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: '#FFEBEE',
        borderRadius: 8,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    listeningText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#D32F2F',
        fontWeight: 'bold',
    },
    transcriptContainer: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#999',
    },
    transcriptText: {
        fontSize: 18,
        fontStyle: 'italic',
        color: '#333',
    },
    optionsContainer: {
        gap: 16,
    },
    // LARGE TOUCH TARGETS: Minimum 60px height
    optionButton: {
        minHeight: 60,
        backgroundColor: 'white',
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    optionButtonSelected: {
        backgroundColor: '#E3F2FD',
        borderColor: '#007AFF',
        borderWidth: 3,
    },
    optionText: {
        fontSize: 20,
        color: '#333',
        fontWeight: '500',
        textAlign: 'center',
    },
    optionTextSelected: {
        color: '#007AFF',
        fontWeight: '700',
    },
    voiceUnavailableContainer: {
        marginTop: 24,
        padding: 16,
        backgroundColor: '#FFF3E0',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFB74D',
    },
    voiceUnavailableText: {
        fontSize: 14,
        color: '#E65100',
        textAlign: 'center',
    },
    navigationContainer: {
        padding: 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    navButton: {
        minHeight: 56,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previousButton: {
        backgroundColor: '#E0E0E0',
    },
    navButtonText: {
        fontSize: 18,
        color: '#333',
        fontWeight: '600',
    },
    processingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    processingText: {
        marginLeft: 12,
        fontSize: 16,
        color: '#007AFF',
    },
});

export default AssessmentScreen;
