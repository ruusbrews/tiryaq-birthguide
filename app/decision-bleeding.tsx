/**
 * Critical Decision Screen: Bleeding
 * 
 * Monitors hemorrhage risk.
 * 
 * PRD Reference: Section 3, Decision Point 2
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
import voiceService from '../services/voice';
import demoVoiceService from '../services/demoVoice';
import decisionTreeService from '../services/decisionTree';

const BleedingDecisionScreen: React.FC = () => {
    const router = useRouter();

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [voiceAvailable, setVoiceAvailable] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [simulatedTranscript, setSimulatedTranscript] = useState<string | null>(null);

    const QUESTION_TEXT = 'كيف حالة النزيف؟';

    const OPTIONS = [
        { label: 'طبيعي', value: 'طبيعي', isEmergency: false },
        { label: 'شديد (يملأ فوطة في أقل من ساعة)', value: 'شديد', isEmergency: true },
    ];

    useEffect(() => {
        checkVoice();
    }, []);

    const checkVoice = async () => {
        const caps = await voiceService.getCapabilities();
        setVoiceAvailable(caps.ttsAvailable);
        if (caps.ttsAvailable) {
            speakQuestion();
        }
    };

    const speakQuestion = async () => {
        setIsSpeaking(true);
        const result = await voiceService.speak(QUESTION_TEXT);
        setIsSpeaking(false);

        // DEMO MODE: Start simulation after speech
        if (voiceService.DEMO_VOICE_MODE && result.success) {
            handleVoiceSimulation();
        }
    };

    /**
     * Handle simulated voice input (Demo Mode)
     */
    const handleVoiceSimulation = async () => {
        setIsListening(true);
        const result = await demoVoiceService.listenForAnswer('bleeding');
        setIsListening(false);

        if (result && result.value !== null) {
            setSimulatedTranscript(result.transcript);

            // Wait a moment to show the transcript before proceeding
            setTimeout(() => {
                handleResponse(result.value);
                setSimulatedTranscript(null);
            }, 1000);
        }
    };

    const handleResponse = async (value: string) => {
        try {
            setProcessing(true);
            await voiceService.stopSpeaking();

            await decisionTreeService.handleDecisionResponse('bleeding', value);

            const state = await decisionTreeService.getCurrentState();

            if (state?.emergencyActive && state.emergencyType) {
                router.replace({
                    pathname: '/emergency',
                    params: { type: state.emergencyType }
                });
            } else {
                router.replace('/guide');
            }
        } catch (error) {
            console.error('Decision failed:', error);
            Alert.alert('خطأ', 'حدث خطأ في حفظ الاستجابة');
            setProcessing(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.questionText}>{QUESTION_TEXT}</Text>
                    {isSpeaking && (
                        <View style={styles.speakingIndicator}>
                            <ActivityIndicator size="small" color="#007AFF" />
                            <Text style={styles.speakingText}>جاري القراءة...</Text>
                        </View>
                    )}
                    {voiceAvailable && (
                        <TouchableOpacity
                            style={styles.repeatButton}
                            onPress={speakQuestion}
                            disabled={isSpeaking}
                        >
                            <Text style={styles.repeatButtonText}>🔊 إعادة السؤال</Text>
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

                <View style={styles.optionsContainer}>
                    {OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.optionButton,
                                option.isEmergency && styles.emergencyOptionWarning
                            ]}
                            onPress={() => handleResponse(option.value)}
                            disabled={processing}
                        >
                            <Text style={styles.optionText}>{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {processing && (
                    <View style={styles.processingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.processingText}>جاري المعالجة...</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    content: { padding: 20, flexGrow: 1, justifyContent: 'center' },
    header: {
        backgroundColor: 'white', padding: 24, borderRadius: 16, marginBottom: 32, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    },
    questionText: { fontSize: 28, fontWeight: 'bold', color: '#000', textAlign: 'center', marginBottom: 16 },
    speakingIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#E3F2FD', padding: 8, borderRadius: 8 },
    speakingText: { marginLeft: 8, color: '#007AFF' },
    repeatButton: { padding: 8 },
    repeatButtonText: { color: '#007AFF', fontWeight: '600', fontSize: 16 },
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
    optionsContainer: { gap: 16 },
    optionButton: {
        minHeight: 80, backgroundColor: 'white', borderRadius: 12, justifyContent: 'center', alignItems: 'center',
        padding: 20, borderWidth: 2, borderColor: '#E0E0E0',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
    },
    emergencyOptionWarning: {
        // Neutral style
        borderColor: '#E0E0E0'
    },
    optionText: { fontSize: 24, fontWeight: '600', color: '#333', textAlign: 'center' },
    processingContainer: { marginTop: 32, alignItems: 'center' },
    processingText: { marginTop: 16, fontSize: 18, color: '#007AFF' },
});

export default BleedingDecisionScreen;
