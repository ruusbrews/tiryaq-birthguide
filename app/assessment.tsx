// assessment.tsx - Enhanced professional assessment with triage logic

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../components/ScreenContainer';
import { VoiceButton } from '../components/VoiceButton';
import { HomeButton } from '../components/HomeButton';
import { ListeningIndicator } from '../components/ListeningIndicator';
import { voiceService } from '../services/VoiceService';
import { voiceInputService } from '../services/VoiceInputService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Question {
    id: string;
    domain: 'triage' | 'pain' | 'bleeding' | 'water' | 'baby' | 'history';
    text: string;
    voice: string;
    image?: any;
    options: {
        label: string;
        value: any;
        keywords: string[];
        emergency?: 'c_section' | 'hemorrhage' | 'immediate';
        risk_level?: 'safe' | 'monitor' | 'danger';
    }[];
    critical?: boolean;
}

const TRIAGE_QUESTIONS: Question[] = [
    {
        id: 'severe_bleeding_now',
        domain: 'triage',
        text: 'هل يوجد نزيف شديد جداً الآن؟ (دم غزير يملأ فوطة كاملة في أقل من 5 دقائق)',
        voice: 'هل يوجد نزيف شديد جداً الآن؟',
        image: require('../assets/decision-tree-images/heaviness_of_bleeding.jpeg'),
        critical: true,
        options: [
            {
                label: 'نعم، نزيف شديد جداً',
                value: true,
                keywords: ['نعم', 'شديد', 'كثير', 'غزير'],
                emergency: 'hemorrhage',
                risk_level: 'danger'
            },
            {
                label: 'لا، النزيف قليل أو متوسط',
                value: false,
                keywords: ['لا', 'قليل', 'متوسط', 'عادي'],
                risk_level: 'safe'
            },
        ],
    },
    {
        id: 'baby_part_visible',
        domain: 'triage',
        text: 'هل ترين أي جزء من الطفل (يد، قدم، حبل السرة)؟',
        voice: 'انظري للأسفل. هل ترين أي جزء من الطفل؟',
        critical: true,
        options: [
            {
                label: 'أرى رأس الطفل',
                value: 'head',
                keywords: ['رأس', 'رأس الطفل'],
                risk_level: 'safe'
            },
            {
                label: 'أرى قدم أو مؤخرة',
                value: 'breech',
                keywords: ['قدم', 'مؤخرة', 'رجل'],
                emergency: 'c_section',
                risk_level: 'danger'
            },
            {
                label: 'أرى حبل السرة',
                value: 'cord',
                keywords: ['حبل', 'سرة'],
                emergency: 'immediate',
                risk_level: 'danger'
            },
            {
                label: 'لا أرى شيئاً',
                value: 'nothing',
                keywords: ['لا', 'ما', 'شيء'],
                risk_level: 'safe'
            },
        ],
    },
];

const ASSESSMENT_QUESTIONS: Question[] = [
    {
        id: 'pain_type',
        domain: 'pain',
        text: 'ما نوع الألم الذي تشعرين به؟',
        voice: 'ما نوع الألم؟ هل هو مستمر طوال الوقت أم يأتي ويذهب؟',
        options: [
            {
                label: 'يأتي ويذهب (انقباضات)',
                value: 'contractions',
                keywords: ['يأتي', 'يذهب', 'ينقبض', 'طلق'],
                risk_level: 'safe'
            },
            {
                label: 'ألم مستمر لا يتوقف',
                value: 'continuous',
                keywords: ['مستمر', 'دائم', 'ما يوقف'],
                emergency: 'c_section',
                risk_level: 'danger'
            },
        ],
    },
    {
        id: 'contraction_frequency',
        domain: 'pain',
        text: 'كم دقيقة بين كل انقباضة والتي تليها؟',
        voice: 'كم دقيقة بين الانقباضات؟',
        options: [
            {
                label: 'أكثر من 5 دقائق',
                value: 'early',
                keywords: ['خمسة', 'أكثر', 'طويل', 'بعيد'],
                risk_level: 'safe'
            },
            {
                label: 'من 2 إلى 5 دقائق',
                value: 'active',
                keywords: ['دقيقتين', 'ثلاث', 'أربع', 'خمس'],
                risk_level: 'monitor'
            },
            {
                label: 'أقل من دقيقتين',
                value: 'transition',
                keywords: ['دقيقة', 'قصير', 'سريع', 'قريب'],
                risk_level: 'monitor'
            },
        ],
    },
    {
        id: 'bleeding_presence',
        domain: 'bleeding',
        text: 'هل يوجد نزيف (دم) الآن؟',
        voice: 'هل يوجد نزيف أو دم؟',
        image: require('../assets/decision-tree-images/bleeding_color.jpeg'),
        options: [
            {
                label: 'نعم',
                value: true,
                keywords: ['نعم', 'أيوه', 'فيه'],
                risk_level: 'monitor'
            },
            {
                label: 'لا',
                value: false,
                keywords: ['لا', 'ما فيه'],
                risk_level: 'safe'
            },
        ],
    },
    {
        id: 'water_broken',
        domain: 'water',
        text: 'هل نزل ماء الولادة (انفجر الكيس المائي)؟',
        voice: 'هل نزل ماء كثير من المهبل؟',
        image: require('../assets/decision-tree-images/color_of_water_broken.jpeg'),
        options: [
            {
                label: 'نعم، نزل ماء كثير',
                value: true,
                keywords: ['نعم', 'نزل', 'انفجر'],
                risk_level: 'monitor'
            },
            {
                label: 'لا',
                value: false,
                keywords: ['لا', 'ما نزل'],
                risk_level: 'safe'
            },
        ],
    },
    {
        id: 'baby_moving',
        domain: 'baby',
        text: 'هل الطفل يتحرك الآن؟',
        voice: 'هل تشعرين بحركة الطفل الآن؟',
        image: require('../assets/decision-tree-images/baby_movement.jpeg'),
        options: [
            {
                label: 'نعم، يتحرك',
                value: true,
                keywords: ['نعم', 'يتحرك', 'أحس'],
                risk_level: 'safe'
            },
            {
                label: 'لا، لا أشعر بحركة',
                value: false,
                keywords: ['لا', 'ما', 'يتحرك'],
                emergency: 'c_section',
                risk_level: 'danger'
            },
        ],
    },
    {
        id: 'push_urge',
        domain: 'baby',
        text: 'هل تشعرين برغبة قوية للدفع (مثل الحاجة للتبرز)؟',
        voice: 'هل تشعرين برغبة قوية للدفع؟',
        image: require('../assets/decision-tree-images/urge_to_push.jpeg'),
        options: [
            {
                label: 'نعم، قوية جداً',
                value: 'strong',
                keywords: ['نعم', 'قوية', 'شديدة'],
                risk_level: 'monitor'
            },
            {
                label: 'لا أهلاً',
                value: 'none',
                keywords: ['لا', 'ما فيه'],
                risk_level: 'safe'
            },
        ],
    },
    {
        id: 'pregnancy_month',
        domain: 'history',
        text: 'في أي شهر من الحمل أنت؟',
        voice: 'في أي شهر من الحمل أنت؟',
        options: [
            {
                label: 'الشهر 7 أو أقل',
                value: 7,
                keywords: ['سبعة', 'سابع', 'ستة'],
                emergency: 'c_section',
                risk_level: 'danger'
            },
            {
                label: 'الشهر 8',
                value: 8,
                keywords: ['ثمانية', 'ثامن'],
                risk_level: 'monitor'
            },
            {
                label: 'الشهر 9',
                value: 9,
                keywords: ['تسعة', 'تاسع'],
                risk_level: 'safe'
            },
        ],
    },
];

const ALL_QUESTIONS = [...TRIAGE_QUESTIONS, ...ASSESSMENT_QUESTIONS];

export default function EnhancedAssessmentScreen() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [voiceState, setVoiceState] = useState({
        isListening: false,
        isTranscribing: false,
        transcription: ''
    });
    const router = useRouter();

    const question = ALL_QUESTIONS[currentQuestionIndex];
    const progress = (currentQuestionIndex + 1) / ALL_QUESTIONS.length;

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
            handleAnswer(matchedOption.value, matchedOption.emergency, matchedOption.risk_level);
        } else {
            console.log('No match for:', text);
            voiceInputService.startListening(handleVoiceTranscript);
        }
    };

    const handleAnswer = async (
        value: any,
        emergency?: 'c_section' | 'hemorrhage' | 'immediate',
        risk_level?: 'safe' | 'monitor' | 'danger'
    ) => {
        voiceInputService.stopListening(false);
        const newAnswers = {
            ...answers,
            [question.id]: {
                value,
                emergency,
                risk_level,
                domain: question.domain
            }
        };
        setAnswers(newAnswers);

        if (question.critical && emergency) {
            await handleEmergency(emergency, newAnswers);
            return;
        }

        if (currentQuestionIndex < ALL_QUESTIONS.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            await finishAssessment(newAnswers);
        }
    };

    const handleEmergency = async (
        emergencyType: 'c_section' | 'hemorrhage' | 'immediate',
        finalAnswers: Record<string, any>
    ) => {
        await AsyncStorage.setItem('emergency_type', emergencyType);
        await AsyncStorage.setItem('assessment_data', JSON.stringify(finalAnswers));

        if (emergencyType === 'c_section') {
            voiceService.speak(
                "هذا وضع خطير. أنت بحاجة لعملية قيصرية. سنرسل رسالة طوارئ ونقدم لك الدعم حتى وصول المساعدة.",
                () => { router.replace('/emergency-csection'); }
            );
        } else if (emergencyType === 'hemorrhage') {
            voiceService.speak("نزيف خطير. اتبعي التعليمات فوراً.", () => {
                router.replace('/emergency-hemorrhage');
            });
        } else {
            voiceService.speak("خطر شديد. اتبعي التعليمات الآن.", () => {
                router.replace('/emergency-immediate');
            });
        }
    };

    const finishAssessment = async (finalAnswers: Record<string, any>) => {
        const dataValues = Object.values(finalAnswers);
        const hasCSection = dataValues.some((a: any) => a.emergency === 'c_section');
        const hasHemorrhage = dataValues.some((a: any) => a.emergency === 'hemorrhage');

        if (hasCSection) {
            await handleEmergency('c_section', finalAnswers);
            return;
        }
        if (hasHemorrhage) {
            await handleEmergency('hemorrhage', finalAnswers);
            return;
        }

        let stage = 'early';
        if (finalAnswers.push_urge?.value === 'strong') stage = 'pushing';
        else if (finalAnswers.contraction_frequency?.value === 'transition') stage = 'active';

        let riskLevel = 'safe';
        if (dataValues.filter((a: any) => a.risk_level === 'danger').length >= 2) riskLevel = 'high_risk';
        else if (dataValues.filter((a: any) => a.risk_level === 'monitor').length >= 3) riskLevel = 'monitor';

        await AsyncStorage.setItem('labor_stage', stage);
        await AsyncStorage.setItem('risk_level', riskLevel);
        await AsyncStorage.setItem('assessment_data', JSON.stringify(finalAnswers));

        voiceService.speak("تم التقييم. سنبدأ المساعدة الآن.");
        router.replace(`/guide?stage=${stage}&risk=${riskLevel}`);
    };

    return (
        <ScreenContainer>
            <HomeButton />
            <View style={styles.header}>
                <Text variant="headlineSmall" style={styles.title}>
                    {question.domain === 'triage' ? '⚠️ فحص الطوارئ' : 'التقييم الأولي'}
                </Text>
                <ProgressBar progress={progress} color="#45AC8B" style={styles.progress} />
            </View>

            <ScrollView style={styles.scrollContainer}>
                <View style={styles.questionContainer}>
                    <Text variant="headlineMedium" style={styles.questionText}>
                        {question.text}
                    </Text>
                    {question.image && (
                        <Image
                            source={question.image}
                            style={styles.questionImage}
                            resizeMode="contain"
                        />
                    )}
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
                            onPress={() => handleAnswer(option.value, option.emergency, option.risk_level)}
                            mode="contained"
                            style={[styles.optionButton, option.emergency && styles.emergencyButton]}
                        />
                    ))}
                </View>
            </ScrollView>

            <View style={styles.helperNote}>
                <Text style={styles.helperText}>💡 يمكنك التحدث أو الضغط للإجابة</Text>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: { marginBottom: 24, marginTop: 60 },
    title: { textAlign: 'center', marginBottom: 16, color: '#666' },
    progress: { height: 8, borderRadius: 4 },
    scrollContainer: { flex: 1 },
    questionContainer: { justifyContent: 'center', alignItems: 'center', marginBottom: 24, paddingHorizontal: 16 },
    questionText: { textAlign: 'center', fontWeight: 'bold', lineHeight: 36 },
    options: { gap: 12, paddingHorizontal: 16, marginBottom: 20 },
    optionButton: { paddingVertical: 4 },
    emergencyButton: { backgroundColor: '#d32f2f' },
    helperNote: { alignItems: 'center', marginBottom: 20, marginTop: 8 },
    helperText: { fontSize: 13, color: '#45AC8B', fontStyle: 'italic' },
    questionImage: {
        width: '100%',
        height: 200,
        marginTop: 16,
        borderRadius: 8,
    },
});