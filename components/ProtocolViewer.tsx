import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Card, ProgressBar, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenContainer } from './ScreenContainer';
import { VoiceButton } from './VoiceButton';
import { voiceService } from '../services/VoiceService';
import { voiceInputService } from '../services/VoiceInputService';
import { Protocol } from '../data/protocols';
import { BREECH_IMAGES } from '../data/breechImages';

interface ProtocolViewerProps {
    protocol: Protocol;
}

export const ProtocolViewer: React.FC<ProtocolViewerProps> = ({ protocol }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const router = useRouter();
    const step = protocol.steps[currentStepIndex];
    const progress = (currentStepIndex + 1) / protocol.steps.length;

    useEffect(() => {
        voiceService.speak(step.voice, () => {
            voiceInputService.startListening(handleVoiceTranscript);
        });

        return () => {
            voiceInputService.stopListening();
        };
    }, [step]);

    const handleVoiceTranscript = (text: string) => {
        console.log('Protocol Voice Transcript:', text);

        const nextKeywords = [
            'تم', 'خلصت', 'انتهيت', 'نعم', 'أيوه', 'التالي', 'بعده',
            'موافق', 'حاضر', 'تمام', 'ماشي', 'خلاص', 'done', 'finished', 'next'
        ];

        if (nextKeywords.some(keyword => text.includes(keyword))) {
            handleNext();
        } else {
            console.log('No match for protocol action:', text);
        }
    };

    const handleNext = () => {
        voiceInputService.stopListening();
        if (currentStepIndex < protocol.steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            voiceService.speak("تم الانتهاء من البروتوكول. هل تحتاجين مساعدة أخرى؟");
            router.back();
        }
    };

    const handlePrevious = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const handleRepeat = () => {
        voiceService.speak(step.voice);
    };

    // Only load images for breech protocol
    const imageSource = protocol.id === 'breech' && step.id 
        ? BREECH_IMAGES[step.id] 
        : null;

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <Text variant="headlineSmall" style={styles.title}>{protocol.title}</Text>
                <ProgressBar progress={progress} color="#D32F2F" style={styles.progress} />
            </View>

            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.stepHeader}>
                        <Text variant="titleLarge" style={styles.stepNumber}>
                            خطوة {currentStepIndex + 1}
                        </Text>
                        <IconButton icon="volume-high" onPress={handleRepeat} />
                    </View>

                    <Text variant="headlineMedium" style={styles.instruction}>
                        {step.text}
                    </Text>

                    {step.warning && (
                        <View style={styles.warningContainer}>
                            <Text style={styles.warningText}>⚠️ {step.warning}</Text>
                        </View>
                    )}
                </Card.Content>
            </Card>

            {/* Image Display - In the central empty space between card and buttons */}
            {imageSource && (
                <View style={styles.imageContainer}>
                    <Image 
                        source={imageSource} 
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>
            )}

            <View style={styles.spacer} />

            <View style={styles.controls}>
                {currentStepIndex > 0 && (
                    <VoiceButton
                        text="السابق"
                        onPress={handlePrevious}
                        mode="outlined"
                        style={styles.navButton}
                    />
                )}

                <VoiceButton
                    text={currentStepIndex === protocol.steps.length - 1 ? "إنهاء" : "التالي"}
                    onPress={handleNext}
                    mode="contained"
                    style={[styles.navButton, styles.nextButton]}
                    speakText={currentStepIndex === protocol.steps.length - 1 ? "إنهاء البروتوكول" : "الخطوة التالية"}
                />
            </View>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    header: {
        marginBottom: 20,
    },
    title: {
        fontWeight: 'bold',
        color: '#D32F2F',
        marginBottom: 10,
        textAlign: 'center',
    },
    progress: {
        height: 8,
        borderRadius: 4,
    },
    card: {
        marginBottom: 20,
        backgroundColor: '#FFF',
        elevation: 4,
    },
    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    stepNumber: {
        color: '#666',
    },
    instruction: {
        fontWeight: 'bold',
        lineHeight: 32,
        textAlign: 'right',
        marginBottom: 16,
    },
    warningContainer: {
        backgroundColor: '#FFEBEE',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    warningText: {
        color: '#D32F2F',
        fontWeight: 'bold',
        textAlign: 'right',
    },
    imageContainer: {
        flex: 1,  // Takes available space
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 16,
    },
    image: {
        width: '90%',
        height: '100%',
        maxHeight: 300,
    },
    spacer: {
        height: 20,  // Small fixed spacer instead of flex
    },
    controls: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    navButton: {
        flex: 1,
    },
    nextButton: {
        backgroundColor: '#D32F2F',
    },
});