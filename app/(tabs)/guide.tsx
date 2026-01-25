/**
 * Main Guidance Screen
 * 
 * Displays stage-based labor guidance and integrates with decision tree
 * for critical monitoring.
 * 
 * CONSTRAINTS:
 * - Stage-based rendering (Early/Active/Pushing/etc)
 * - Voice + visual sync
 * - Large touch targets
 * - Integration with decision decisionTree for next actions
 * - Emergency button always visible
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import voiceService, { SpeechResult } from '../../services/voice';
import decisionTreeService, { LaborState, LaborStage, NextAction } from '../../services/decisionTree';
import { getProtocolByStage } from '../../data/protocols';
import { Protocol, ProtocolStep } from '../../components/ProtocolViewer';

const GuideScreen: React.FC = () => {
    const router = useRouter();

    // State
    const [loading, setLoading] = useState(true);
    const [laborState, setLaborState] = useState<LaborState | null>(null);
    const [currentProtocol, setCurrentProtocol] = useState<Protocol | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [checkingProgress, setCheckingProgress] = useState(false);

    // Refs
    const isMounted = useRef(true);

    // Load state on focus
    useFocusEffect(
        useCallback(() => {
            isMounted.current = true;
            loadData();

            // Hardware back button handler (prevent accidental exit if needed, though this is a tab)
            const onBackPress = () => {
                // In tabs, back might not be relevant, but good to handle
                return false;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => {
                isMounted.current = false;
                voiceService.stopSpeaking();
                subscription.remove();
            };
        }, [])
    );

    // Auto-speak when step changes
    useEffect(() => {
        if (currentProtocol && !loading) {
            speakCurrentStep();
        }
    }, [currentStepIndex, currentProtocol]);

    /**
     * Load labor state and correct protocol
     */
    const loadData = async () => {
        try {
            setLoading(true);

            // Get current state
            const state = await decisionTreeService.getCurrentState();

            if (!state) {
                // No session, redirect to assessment or welcome
                // For now, assume assessment acts as gatekeeper, but handle null
                Alert.alert(
                    'لا يوجد جلسة نشطة',
                    'يرجى البدء من الشاشة الرئيسية',
                    [{ text: 'حسناً', onPress: () => router.replace('/') }]
                );
                return;
            }

            setLaborState(state);

            // Check for active emergency
            if (state.emergencyActive && state.emergencyType) {
                router.replace({
                    pathname: '/emergency',
                    params: { type: state.emergencyType }
                });
                return;
            }

            // Get protocol for stage
            const protocol = getProtocolByStage(state.stage);
            setCurrentProtocol(protocol);

            // Reset step index if stage changed? 
            // For now, we simple reset on load or keep 0. 
            // Ideally we persist step index per stage, but starting fresh on reload is safer for context.
            setCurrentStepIndex(0);

            setLoading(false);

            // Check if we need to trigger a decision immediately
            checkNextAction();

        } catch (error) {
            console.error('[Guide] Failed to load data:', error);
            setLoading(false);
        }
    };

    /**
     * Check decision tree for next action (Ask decision, Emergency, or Guide)
     */
    const checkNextAction = async () => {
        try {
            setCheckingProgress(true);
            const nextAction: NextAction = await decisionTreeService.determineNextAction();

            if (nextAction.action === 'emergency' && nextAction.content.emergencyType) {
                router.replace({
                    pathname: '/emergency',
                    params: { type: nextAction.content.emergencyType }
                });
            } else if (nextAction.action === 'ask' && nextAction.content.decisionId) {
                // Navigate to decision screen
                // Mapping decisionId to route
                const route = `/decision-${nextAction.content.decisionId}` as any;
                router.push(route);
            } else {
                // 'guide' action - we are already here.
                // Update stage if it changed in state (though determineNextAction relies on state)
                if (laborState && nextAction.content.stage && nextAction.content.stage !== laborState.stage) {
                    // Reload triggered by stage mismatch
                    loadData();
                }
            }
            setCheckingProgress(false);
        } catch (error) {
            console.error('[Guide] Next action check failed:', error);
            setCheckingProgress(false);
        }
    };

    /**
     * Speak current step
     */
    const speakCurrentStep = async () => {
        if (!currentProtocol) return;

        const step = currentProtocol.steps[currentStepIndex];
        if (!step) return;

        setIsSpeaking(true);
        await voiceService.stopSpeaking();
        const result: SpeechResult = await voiceService.speak(step.instruction);

        if (isMounted.current) {
            setIsSpeaking(false);
        }
    };

    /**
     * Navigation Handlers
     */
    const handleNextStep = () => {
        if (!currentProtocol) return;

        if (currentStepIndex < currentProtocol.steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            // End of steps - Check progress
            Alert.alert(
                'اكتملت الإرشادات',
                'هل تريدين فحص التطورات الجديدة؟',
                [
                    { text: 'البقاء هنا', style: 'cancel' },
                    { text: 'فحص التطور', onPress: checkNextAction }
                ]
            );
        }
    };

    const handlePreviousStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const handleRepeatStep = () => {
        speakCurrentStep();
    };

    /**
     * Emergency Trigger
     */
    const handleEmergencyPress = () => {
        Alert.alert(
            'طوارئ',
            'هل هناك حالة طوارئ طبية؟',
            [
                { text: 'إلغاء', style: 'cancel' },
                {
                    text: 'نزيف حاد',
                    style: 'destructive',
                    onPress: () => router.push({ pathname: '/emergency', params: { type: 'hemorrhage' } })
                },
                {
                    text: 'الطفل لا يتنفس',
                    style: 'destructive',
                    onPress: () => router.push({ pathname: '/emergency', params: { type: 'resuscitation' } })
                },
                // Add more manual triggers if needed
                {
                    text: 'حالة أخرى (101)',
                    style: 'destructive',
                    onPress: () => Alert.alert('اتصلي بـ 101 فوراً')
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>جاري تحميل الإرشادات...</Text>
            </View>
        );
    }

    if (!currentProtocol || !laborState) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>لا توجد إرشادات متاحة لهذه المرحلة</Text>
                <TouchableOpacity style={styles.button} onPress={loadData}>
                    <Text style={styles.buttonText}>إعادة المحاولة</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const currentStep = currentProtocol.steps[currentStepIndex];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === currentProtocol.steps.length - 1;

    // Translation map for stages
    const stageNames: Record<LaborStage, string> = {
        early: 'المرحلة المبكرة',
        active: 'المخاض النشط',
        transition: 'المرحلة الانتقالية',
        pushing: 'مرحلة الدفع',
        birth: 'ولادة الطفل',
        postpartum: 'ما بعد الولادة'
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.stageLabel}>المرحلة الحالية</Text>
                <Text style={styles.stageTitle}>
                    {stageNames[laborState.stage] || laborState.stage}
                </Text>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
            >
                <View style={styles.card}>
                    <View style={styles.stepHeader}>
                        <Text style={styles.stepCounter}>
                            خطوة {currentStepIndex + 1} من {currentProtocol.steps.length}
                        </Text>
                        {currentStep.critical && (
                            <View style={styles.criticalBadge}>
                                <Text style={styles.criticalText}>مهم</Text>
                            </View>
                        )}
                    </View>

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
                        <Text style={styles.repeatButtonText}>🔊 إعادة</Text>
                    </TouchableOpacity>
                </View>

                {/* Check Progress Button (Manual Trigger) */}
                {!checkingProgress ? (
                    <TouchableOpacity
                        style={styles.checkButton}
                        onPress={checkNextAction}
                    >
                        <Text style={styles.checkButtonText}>فحص التطور / تحديث الحالة</Text>
                    </TouchableOpacity>
                ) : (
                    <ActivityIndicator style={{ marginTop: 20 }} color="#007AFF" />
                )}

            </ScrollView>

            {/* Navigation Controls */}
            <View style={styles.navigationContainer}>
                {/* Previous */}
                <TouchableOpacity
                    style={[
                        styles.navButton,
                        styles.prevButton,
                        isFirstStep && styles.disabledButton
                    ]}
                    onPress={handlePreviousStep}
                    disabled={isFirstStep}
                >
                    <Text style={[styles.navButtonText, isFirstStep && styles.disabledText]}>
                        ← السابق
                    </Text>
                </TouchableOpacity>

                {/* Next */}
                <TouchableOpacity
                    style={[styles.navButton, styles.nextButton]}
                    onPress={handleNextStep}
                >
                    <Text style={styles.navButtonTextPrimary}>
                        {isLastStep ? 'خيارات أخرى' : 'التالي →'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Emergency Button (Floating or Fixed) */}
            <TouchableOpacity
                style={styles.emergencyButton}
                onPress={handleEmergencyPress}
            >
                <Text style={styles.emergencyButtonText}>⚠️ طوارئ / مساعدة</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 18,
        color: '#E65100',
        textAlign: 'center',
        marginTop: 50,
    },
    header: {
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        alignItems: 'center',
    },
    stageLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    stageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 24,
    },
    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    stepCounter: {
        fontSize: 16,
        color: '#666',
    },
    criticalBadge: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    criticalText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    instructionText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#000',
        textAlign: 'right',
        lineHeight: 36,
        marginBottom: 24,
    },
    speakingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
        marginBottom: 16,
    },
    speakingText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#007AFF',
    },
    repeatButton: {
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
    },
    repeatButtonText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
    },
    checkButton: {
        backgroundColor: '#E3F2FD',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#007AFF',
        alignItems: 'center',
    },
    checkButtonText: {
        fontSize: 18,
        color: '#007AFF',
        fontWeight: 'bold',
    },
    navigationContainer: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        gap: 12,
    },
    navButton: {
        flex: 1,
        minHeight: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    prevButton: {
        backgroundColor: '#E0E0E0',
    },
    nextButton: {
        backgroundColor: '#007AFF',
        flex: 2,
    },
    disabledButton: {
        opacity: 0.5,
    },
    navButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    navButtonTextPrimary: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    disabledText: {
        color: '#999',
    },
    emergencyButton: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#FF3B30',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    emergencyButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    button: {
        padding: 16,
        backgroundColor: '#007AFF',
        borderRadius: 8,
        marginTop: 20
    },
    buttonText: {
        color: 'white',
        fontSize: 16
    },
});

export default GuideScreen;
