import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Card, ProgressBar, IconButton } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { HealthRecordStorage, HEALTH_RECORD_KEYS } from '../../services/HealthRecordStorage';
import { voiceService } from '../../services/VoiceService';

export default function HealthTrackingScreen() {
    const router = useRouter();
    const [progress, setProgress] = useState<{
        completedCount: number;
        totalCount: number;
        completedSections: string[];
    }>({ completedCount: 0, totalCount: 6, completedSections: [] });

    const loadProgress = useCallback(async () => {
        const data = await HealthRecordStorage.getProgress();
        setProgress(data);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadProgress();
            voiceService.speak("سجل الحمل. أكمل النموذج لمساعدة وزارة الصحة في تخصيص الموارد.");
        }, [])
    );

    const sections = [
        { id: 1, title: 'الهوية والتواصل', key: HEALTH_RECORD_KEYS.IDENTIFICATION, route: '/screens/forms/IdentificationFormScreen' },
        { id: 2, title: 'حالة الحمل والمخاطر', key: HEALTH_RECORD_KEYS.PREGNANCY, route: '/screens/forms/PregnancyStatusFormScreen' },
        { id: 3, title: 'رعاية ما قبل الولادة', key: HEALTH_RECORD_KEYS.ANTENATAL, route: '/screens/forms/AntenatalCareFormScreen' },
        { id: 4, title: 'الظروف المعيشية', key: HEALTH_RECORD_KEYS.LIVING, route: '/screens/forms/LivingConditionsFormScreen' },
        { id: 5, title: 'الصحة النفسية والدعم', key: HEALTH_RECORD_KEYS.MENTAL, route: '/screens/forms/MentalHealthFormScreen' },
        { id: 6, title: 'الموافقة والتفضيلات', key: HEALTH_RECORD_KEYS.CONSENT, route: '/screens/forms/ConsentFormScreen' },
    ];

    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text variant="headlineMedium" style={styles.title}>سجل الحمل</Text>
                    <Text variant="bodyMedium" style={styles.subtitle}>
                        أكمل النموذج لمساعدة وزارة الصحة في تخصيص الموارد
                    </Text>
                </View>

                <View style={styles.progressContainer}>
                    <View style={styles.progressLabels}>
                        <Text variant="labelLarge">تقدم الإنجاز</Text>
                        <Text variant="labelLarge">{progress.completedCount} من {progress.totalCount} أقسام مكتملة</Text>
                    </View>
                    <ProgressBar progress={progress.completedCount / progress.totalCount} color="#94E394" style={styles.progressBar} />
                </View>

                {sections.map((section) => {
                    const isCompleted = progress.completedSections.includes(section.key);
                    return (
                        <Card
                            key={section.id}
                            style={styles.card}
                            onPress={() => router.push(section.route)}
                        >
                            <Card.Content style={styles.cardContent}>
                                <View style={styles.cardTextContainer}>
                                    <Text variant="titleMedium" style={styles.cardTitle}>{section.title}</Text>
                                </View>
                                {isCompleted ? (
                                    <IconButton icon="check-circle" iconColor="#94E394" size={24} />
                                ) : (
                                    <IconButton icon="chevron-left" size={24} />
                                )}
                            </Card.Content>
                        </Card>
                    );
                })}

                <Button
                    mode="contained"
                    disabled={progress.completedCount < progress.totalCount}
                    onPress={() => router.push('/screens/forms/SubmitRecordsScreen')}
                    style={[
                        styles.submitButton,
                        progress.completedCount === progress.totalCount && { backgroundColor: '#94E394' }
                    ]}
                    contentStyle={styles.submitButtonContent}
                >
                    إرسال السجلات
                </Button>

                <Button
                    mode="outlined"
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    العودة للرئيسية
                </Button>
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginVertical: 24,
    },
    title: {
        fontWeight: 'bold',
        color: '#45AC8B',
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        color: '#666',
        marginTop: 8,
        paddingHorizontal: 20,
    },
    progressContainer: {
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    progressLabels: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressBar: {
        height: 10,
        borderRadius: 5,
    },
    card: {
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    cardContent: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    cardTextContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    cardTitle: {
        textAlign: 'right',
    },
    submitButton: {
        marginTop: 24,
        marginBottom: 12,
    },
    submitButtonContent: {
        height: 50,
    },
    backButton: {
        marginBottom: 20,
    },
});
