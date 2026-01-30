// assessment.tsx - Assessment screen with green theme and helper note

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../components/ScreenContainer';
import { VoiceButton } from '../components/VoiceButton';
import { ListeningIndicator } from '../components/ListeningIndicator';
import { HomeButton } from '../components/HomeButton';
import { voiceService } from '../services/VoiceService';
import { voiceInputService } from '../services/VoiceInputService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Question {
    id: string;
    text: string;
    voice: string;
    options: { label: string; value: any; keywords: string[] }[];
}

const QUESTIONS: Question[] = [
    {
        id: 'pregnancy_month',
        text: 'في أي شهر من الحمل أنت؟',
        voice: 'في أي شهر من الحمل أنت؟',
        options: [
            { label: 'الشهر 7', value: 7, keywords: ['سبعة', 'سابع', '7'] },
            { label: 'الشهر 8', value: 8, keywords: ['ثمانية', 'ثامن', '8'] },
            { label: 'الشهر 9', value: 9, keywords: ['تسعة', 'تاسع', '9'] },
            { label: 'لا أعرف', value: null, keywords: ['لا', 'أعرف', 'ما', 'عارفة'] },
        ],
    },
    {
        id: 'contractions',
        text: 'كم دقيقة بين الانقباضات (الطلق)؟',
        voice: 'كم دقيقة بين الانقباضات؟',
        options: [
            { label: 'أكثر من 5 دقائق', value: 'early', keywords: ['خمسة', 'أكثر', 'كثير', 'بعيد'] },
            { label: '3-5 دقائق', value: 'active', keywords: ['ثلاثة', 'أربعة', 'خمسة', 'متوسط'] },
            { label: 'أقل من دقيقتين', value: 'transition', keywords: ['دقيقة', 'دقيقتين', 'قريب', 'سريع'] },
        ],
    },
    {
        id: 'water',
        text: 'هل انفجر ماء الولادة؟',
        voice: 'هل نزل ماء الولادة؟',
        options: [
            { label: 'نعم', value: true, keywords: ['نعم', 'أيوه', 'آه', 'انفجر', 'نزل'] },
            { label: 'لا', value: false, keywords: ['لا', 'لأ', 'ما'] },
            { label: 'لا أعرف', value: null, keywords: ['أعرف', 'متأكدة', 'مش', 'عارفة'] },
        ],
    },
    {
        id: 'urge',
        text: 'هل تشعرين برغبة قوية للدفع؟',
        voice: 'هل تشعرين برغبة قوية للدفع مثل الحاجة للتبرز؟',
        options: [
            { label: 'نعم قوية', value: true, keywords: ['نعم', 'قوية', 'شديدة', 'كثير'] },
            { label: 'قليلاً', value: false, keywords: ['قليل', 'شوية', 'خفيف'] },
            { label: 'لا', value: false, keywords: ['لا', 'لأ', 'ما'] },
        ],
    },
];

export default function AssessmentScreen() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [voiceState, setVoiceState] = useState({
        isListening: false,
        isTranscribing: false,
        transcription: ''
    });
    const router = useRouter();

    const question = QUESTIONS[currentQuestionIndex];
    const progress = (currentQuestionIndex + 1) / QUESTIONS.length;

    useEffect(() => {
        const unsubscribe = voiceInputService.subscribe((isListening, isTranscribing, transcription) => {
            setVoiceState({ isListening, isTranscribing, transcription });
        });

        voiceService.speak(question.voice, () => {
            voiceInputService.startListening(handleVoiceTranscript);
        });

        return () => {
            unsubscribe();
            voiceInputService.stopListening(false);
        };
    }, [question]);

    const handleVoiceTranscript = (text: string) => {
        console.log('Assessment Voice Transcript:', text);

        const matchedOption = question.options.find(option =>
            option.keywords.some(keyword => text.includes(keyword))
        );

        if (matchedOption) {
            handleAnswer(matchedOption.value);
        } else {
            console.log('No match for:', text);
            voiceInputService.startListening(handleVoiceTranscript);
        }
    };

    const handleAnswer = async (value: any) => {
        voiceInputService.stopListening(false);
        const newAnswers = { ...answers, [question.id]: value };
        setAnswers(newAnswers);

        if (currentQuestionIndex < QUESTIONS.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            await finishAssessment(newAnswers);
        }
    };

    const finishAssessment = async (finalAnswers: Record<string, any>) => {
        let stage = 'early';

        if (finalAnswers.urge === true) {
            stage = 'pushing';
        } else if (finalAnswers.contractions === 'transition') {
            stage = 'active';
        } else if (finalAnswers.contractions === 'active') {
            stage = 'active';
        }

        await AsyncStorage.setItem('labor_stage', stage);
        await AsyncStorage.setItem('assessment_data', JSON.stringify(finalAnswers));

        voiceService.speak("تم التقييم. سنبدأ المساعدة الآن.");
        router.replace(`/guide?stage=${stage}`);
    };

    return (
        <ScreenContainer>
            <HomeButton />

            <View style={styles.header}>
                <Text variant="headlineSmall" style={styles.title}>التقييم الأولي</Text>
                <ProgressBar progress={progress} color="#45AC8B" style={styles.progress} />
            </View>

            <View style={styles.questionContainer}>
                <Text variant="headlineMedium" style={styles.questionText}>
                    {question.text}
                </Text>
            </View>

            <ListeningIndicator
                visible={voiceState.isListening}
                transcribing={voiceState.isTranscribing}
                transcription={voiceState.transcription}
            />

            <View style={styles.options}>
                {question.options.map((option, index) => (
                    <VoiceButton
                        key={index}
                        text={option.label}
                        onPress={() => handleAnswer(option.value)}
                        mode="contained"
                        style={styles.optionButton}
                    />
                ))}
            </View>

            {/* Helper Note */}
            <View style={styles.helperNote}>
                <Text style={styles.helperText}>💡 يمكنك التحدث أو الضغط للإجابة</Text>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: 32,
        marginTop: 40,
    },
    title: {
        textAlign: 'center',
        marginBottom: 16,
        color: '#666',
    },
    progress: {
        height: 8,
        borderRadius: 4,
    },
    questionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    questionText: {
        textAlign: 'center',
        fontWeight: 'bold',
        lineHeight: 40,
        marginBottom: 24,
    },
    options: {
        gap: 16,
        marginBottom: 12,
    },
    optionButton: {
        paddingVertical: 4,
    },
    helperNote: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 8,
    },
    helperText: {
        fontSize: 13,
        color: '#45AC8B',
        fontStyle: 'italic',
    },
});