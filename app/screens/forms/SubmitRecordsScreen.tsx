import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, Divider, List } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { HealthRecordStorage, HEALTH_RECORD_KEYS } from '../../../services/HealthRecordStorage';
import { HealthRecordSMSService } from '../../../services/HealthRecordSMSService';
import { voiceService } from '../../../services/VoiceService';
import { ComplianceModal } from '../../../components/ComplianceModal';

export default function SubmitRecordsScreen() {
    const router = useRouter();
    const [summary, setSummary] = useState<any>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [consentVisible, setConsentVisible] = useState(false);

    useEffect(() => {
        loadAllData();
        voiceService.speak("مراجعة وإرسال السجلات. يرجى مراجعة ملخص بياناتك قبل الإرسال.");
    }, []);

    const loadAllData = async () => {
        const id = await HealthRecordStorage.getData(HEALTH_RECORD_KEYS.IDENTIFICATION);
        const preg = await HealthRecordStorage.getData(HEALTH_RECORD_KEYS.PREGNANCY);
        const ant = await HealthRecordStorage.getData(HEALTH_RECORD_KEYS.ANTENATAL);
        const liv = await HealthRecordStorage.getData(HEALTH_RECORD_KEYS.LIVING);
        const ment = await HealthRecordStorage.getData(HEALTH_RECORD_KEYS.MENTAL);
        const con = await HealthRecordStorage.getData(HEALTH_RECORD_KEYS.CONSENT);
        const notes = await HealthRecordStorage.getData(HEALTH_RECORD_KEYS.NOTES);

        setSummary({ id, preg, ant, liv, ment, con, notes });
    };

    const handleSubmit = () => {
        setConsentVisible(true);
    };

    const performSubmit = async () => {
        setIsLoading(true);
        try {
            // Ministry of Health Emergency Number (Placeholder or as configured)
            const result = await HealthRecordSMSService.sendRecord(['+1234567890']);
            if (result === 'sent' || result === 'unknown') {
                setIsSubmitted(true);
            }
        } catch (error: any) {
            Alert.alert('خطأ في الإرسال', error.message || 'تعذر إرسال الرسالة النصية');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <ScreenContainer>
                <View style={styles.successContainer}>
                    <List.Icon icon="check-circle" color="#94E394" style={styles.successIcon} />
                    <Text variant="headlineMedium" style={styles.successTitle}>تم الإرسال بنجاح</Text>
                    <Text variant="bodyLarge" style={styles.successText}>
                        شكراً لكِ. تم إرسال معلوماتكِ إلى وزارة الصحة.
                        {"\n"}يمكنكِ تحديث معلوماتكِ في أي وقت من شاشة "سجل الحمل".
                    </Text>

                    <Button
                        mode="contained"
                        onPress={() => router.replace('/')}
                        style={[styles.actionButton, { backgroundColor: '#45AC8B' }]}
                    >
                        العودة للرئيسية
                    </Button>

                    <Button
                        mode="outlined"
                        onPress={() => router.push('/assessment')}
                        style={styles.actionButton}
                    >
                        عرض دليل الولادة الطارئة
                    </Button>
                </View>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text variant="headlineSmall" style={styles.title}>مراجعة وإرسال السجلات</Text>
                    <Text variant="bodyMedium" style={styles.subtitle}>يرجى مراجعة ملخص بياناتك قبل الإرسال</Text>
                </View>

                {summary && (
                    <Card style={styles.summaryCard}>
                        <Card.Content>
                            <SectionSummary title="الهوية والتواصل" data={[
                                { label: 'العمر', value: summary.id?.ageGroup },
                                { label: 'المحافظة', value: summary.id?.governorate },
                                { label: 'نازحة', value: summary.id?.displaced === 'Yes' ? 'نعم' : 'لا' }
                            ]} />

                            <Divider style={styles.divider} />

                            <SectionSummary title="حالة الحمل" data={[
                                { label: 'حامل حالياً', value: summary.preg?.currentlyPregnant === 'Yes, currently pregnant' ? 'نعم' : 'لا' },
                                { label: 'مدة الحمل', value: summary.preg?.monthsPregnant },
                                { label: 'حمل أول', value: summary.preg?.firstPregnancy === 'Yes' ? 'نعم' : 'لا' }
                            ]} />

                            <Divider style={styles.divider} />

                            <SectionSummary title="رعاية قبل الولادة" data={[
                                { label: 'زيارة منشأة', value: summary.ant?.visitedFacility === 'Yes' ? 'نعم' : 'لا' },
                                { label: 'مكان الولادة المخطط', value: summary.ant?.plannedPlace }
                            ]} />

                            <Divider style={styles.divider} />

                            <SectionSummary title="ملاحظات إضافية" data={[
                                { label: 'الملاحظات', value: summary.notes || 'لا يوجد' }
                            ]} />
                        </Card.Content>
                    </Card>
                )}

                <View style={styles.warningBox}>
                    <Text style={styles.warningBoxText}>
                        سيتم إرسال هذه البيانات عبر رسالة نصية قصيرة (SMS). قد يتم تطبيق رسوم الرسائل العادية.
                    </Text>
                </View>

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={isLoading}
                    disabled={isLoading}
                    style={styles.submitButton}
                >
                    إرسال السجلات عبر SMS
                </Button>

                <Button mode="text" onPress={() => router.back()} style={styles.cancelButton}>
                    تعديل البيانات
                </Button>
            </ScrollView>

            <ComplianceModal
                visible={consentVisible}
                type="health_consent"
                onDismiss={() => setConsentVisible(false)}
                onAgree={performSubmit}
            />
        </ScreenContainer>
    );
}

const SectionSummary = ({ title, data }: { title: string, data: { label: string, value: string }[] }) => (
    <View style={styles.sectionSummary}>
        <Text variant="titleSmall" style={styles.sectionTitle}>{title}</Text>
        {data.map((item, index) => (
            <View key={index} style={styles.summaryRow}>
                <Text style={styles.summaryValue}>{item.value || '-'}</Text>
                <Text style={styles.summaryLabel}>{item.label}:</Text>
            </View>
        ))}
    </View>
);

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 40,
        paddingHorizontal: 12,
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
        marginTop: 4,
    },
    summaryCard: {
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    sectionSummary: {
        marginVertical: 8,
    },
    sectionTitle: {
        color: '#45AC8B',
        fontWeight: 'bold',
        textAlign: 'right',
        marginBottom: 4,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 2,
    },
    summaryLabel: {
        color: '#666',
        marginLeft: 8,
        width: 120,
        textAlign: 'right',
    },
    summaryValue: {
        color: '#333',
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    divider: {
        marginVertical: 8,
    },
    warningBox: {
        backgroundColor: '#FFF9C4',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    warningBoxText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#F57F17',
    },
    submitButton: {
        backgroundColor: '#94E394',
        height: 50,
        justifyContent: 'center',
        marginBottom: 12,
    },
    cancelButton: {
        marginBottom: 20,
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    successIcon: {
        alignSelf: 'center',
        marginBottom: 20,
    },
    successTitle: {
        color: '#45AC8B',
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    successText: {
        textAlign: 'center',
        color: '#666',
        lineHeight: 24,
        marginBottom: 40,
    },
    actionButton: {
        width: '100%',
        marginBottom: 12,
    },
});
