import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '../components/ScreenContainer';
import { VoiceButton } from '../components/VoiceButton';
import { DangerButton } from '../components/DangerButton';
import { HomeButton } from '../components/HomeButton';
import { voiceService } from '../services/VoiceService';
import { LABOR_STAGES } from '../data/stages';
import { CRITICAL_DECISIONS, DecisionPoint } from '../data/decisions';

export default function GuideScreen() {
    const { stage } = useLocalSearchParams();
    const router = useRouter();
    const [currentStageId, setCurrentStageId] = useState(stage as string || 'early');
    const [activeDecision, setActiveDecision] = useState<DecisionPoint | null>(null);

    const currentStage = LABOR_STAGES[currentStageId];

    useEffect(() => {
        if (currentStage) {
            voiceService.speak(currentStage.voiceInstructions.join('. '));
        }
    }, [currentStageId]);

    const handleNextAction = () => {
        if (currentStageId === 'early') {
            setCurrentStageId('active');
        } else if (currentStageId === 'active') {
            triggerDecision('bleeding');
        } else if (currentStageId === 'pushing') {
            triggerDecision('presentation');
        }
    };

    const triggerDecision = (decisionId: string) => {
        const decision = CRITICAL_DECISIONS.find(d => d.id === decisionId);
        if (decision) {
            setActiveDecision(decision);
            voiceService.speak(decision.voice);
        }
    };

    const handleDecisionAnswer = (value: string, emergency?: string) => {
        if (emergency) {
            voiceService.speak("حالة طارئة! جاري تفعيل البروتوكول.");
            router.push(`/emergency/${emergency}`);
            setActiveDecision(null);
            return;
        }

        setActiveDecision(null);

        if (activeDecision?.id === 'bleeding') {
            setCurrentStageId('pushing');
        } else if (activeDecision?.id === 'presentation') {
            if (value === 'head') {
                voiceService.speak("ممتاز. الرأس يظهر. استمري.");
                triggerDecision('crowning');
            }
        } else if (activeDecision?.id === 'crowning') {
            if (value === 'yes') {
                triggerDecision('baby_breathing');
            }
        } else if (activeDecision?.id === 'baby_breathing') {
            if (value === 'yes') {
                voiceService.speak("مبروك! ضعي الطفل على صدرك لتدفئته.");
                triggerDecision('placenta');
            }
        }
    };

    if (activeDecision) {
        return (
            <ScreenContainer>
                <HomeButton />
                <View style={styles.header}>
                    <Text variant="headlineSmall" style={styles.decisionTitle}>سؤال هام</Text>
                </View>

                <Text variant="headlineMedium" style={styles.decisionQuestion}>
                    {activeDecision.question}
                </Text>

                <View style={styles.options}>
                    {activeDecision.options.map((option, index) => (
                        <VoiceButton
                            key={index}
                            text={option.label}
                            onPress={() => handleDecisionAnswer(option.value, option.emergency)}
                            mode={option.emergency ? "contained" : "outlined"}
                            style={option.emergency ? styles.emergencyOption : styles.optionButton}
                        />
                    ))}
                </View>
            </ScreenContainer>
        );
    }

    if (!currentStage) return <Text>Loading...</Text>;

    return (
        <ScreenContainer>
            <HomeButton />
            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.title}>{currentStage.title}</Text>
            </View>

            <Card style={styles.card}>
                <Card.Content>
                    {currentStage.instructions.map((instruction, index) => (
                        <View key={index} style={styles.instructionRow}>
                            <Text variant="titleMedium" style={styles.instructionText}>• {instruction}</Text>
                        </View>
                    ))}
                </Card.Content>
            </Card>

            <View style={styles.spacer} />

            <DangerButton
                text="طوارئ / نزيف"
                onPress={() => router.push('/emergency')}
                style={styles.emergencyButton}
            />

            <VoiceButton
                text="التالي"
                speakText={currentStage.nextActionVoice}
                onPress={handleNextAction}
                mode="contained"
                style={styles.nextButton}
            />

            <Text style={styles.nextHint}>{currentStage.nextAction}</Text>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 40,
    },
    title: {
        fontWeight: 'bold',
        color: '#E57373',
    },
    card: {
        marginBottom: 20,
        backgroundColor: '#FFF',
    },
    instructionRow: {
        marginBottom: 12,
    },
    instructionText: {
        lineHeight: 24,
        textAlign: 'right',
    },
    spacer: {
        flex: 1,
    },
    emergencyButton: {
        marginBottom: 16,
    },
    nextButton: {
        marginBottom: 8,
    },
    nextHint: {
        textAlign: 'center',
        color: '#666',
        fontSize: 12,
        marginBottom: 20,
    },
    decisionTitle: {
        color: '#D32F2F',
        fontWeight: 'bold',
    },
    decisionQuestion: {
        textAlign: 'center',
        fontWeight: 'bold',
        marginVertical: 32,
        lineHeight: 40,
    },
    options: {
        gap: 16,
    },
    optionButton: {
        paddingVertical: 8,
    },
    emergencyOption: {
        backgroundColor: '#D32F2F',
        paddingVertical: 8,
    },
});
