// emergency-csection.tsx - C-section emergency with emotional support and consent

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, IconButton } from 'react-native-paper';
import { ScreenContainer } from '../components/ScreenContainer';
import { voiceService } from '../services/VoiceService';
import { ComplianceModal } from '../components/ComplianceModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SMS from 'expo-sms';
import * as Location from 'expo-location';

const EMOTIONAL_SUPPORT_MESSAGES = [
    'أنت قوية. نحن معك.',
    'تنفسي ببطء. كل شيء سيكون بخير.',
    'المساعدة في الطريق. ابقي قوية.',
    'أنت تقومين بعمل رائع. استمري في التنفس.',
    'لست وحدك. نحن هنا لدعمك.',
];

const SAFETY_INSTRUCTIONS = [
    { id: 'position', title: 'الوضعية الآمنة', text: 'استلقي على جانبك الأيسر مع وسادة بين ركبتيك', voice: 'استلقي على جانبك الأيسر', icon: 'bed' },
    { id: 'breathing', title: 'التنفس', text: 'تنفسي ببطء: شهيق لمدة 4 ثوان، زفير لمدة 6 ثوان', voice: 'تنفسي ببطء وبعمق', icon: 'air' },
    { id: 'no_pushing', title: 'لا تدفعي', text: 'مهم جداً: لا تدفعي أبداً. هذا قد يكون خطيراً', voice: 'لا تدفعي أبداً. هذا مهم جداً لسلامتك', icon: 'hand-back-left' },
    { id: 'hydration', title: 'الماء', text: 'اشربي رشفات صغيرة من الماء إذا استطعت', voice: 'اشربي رشفات صغيرة من الماء', icon: 'water' },
];

export default function EmergencyCsectionScreen() {
    const [smsSent, setSmsSent] = useState(false);
    const [location, setLocation] = useState<string | null>(null);
    const [supportMessageIndex, setSupportMessageIndex] = useState(0);
    const [consentVisible, setConsentVisible] = useState(false);

    useEffect(() => {
        voiceService.speak(
            'أنت بحاجة لعملية قيصرية. هذا وضع خطير ولكن يمكن التعامل معه. سنحاول إرسال رسالة طوارئ الآن. ابقي هادئة وتنفسي ببطء.',
            () => { setConsentVisible(true); }
        );

        const supportInterval = setInterval(() => {
            setSupportMessageIndex(prev => {
                const next = (prev + 1) % EMOTIONAL_SUPPORT_MESSAGES.length;
                voiceService.speak(EMOTIONAL_SUPPORT_MESSAGES[next]);
                return next;
            });
        }, 90000);

        const instructionInterval = setInterval(() => {
            voiceService.speak('تذكير: استلقي على جانبك الأيسر ولا تدفعي. تنفسي ببطء.');
        }, 300000);

        return () => {
            clearInterval(supportInterval);
            clearInterval(instructionInterval);
        };
    }, []);

    const performEmergencySMS = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const currentLocation = await Location.getCurrentPositionAsync({});
                setLocation(`${currentLocation.coords.latitude}, ${currentLocation.coords.longitude}`);
            }

            const emergencyContact = await AsyncStorage.getItem('emergency_contact');
            const assessmentData = await AsyncStorage.getItem('assessment_data');

            if (!emergencyContact) {
                Alert.alert('رقم الطوارئ مفقود', 'يرجى إعطاء هاتفك لشخص قريب لطلب المساعدة.');
                return;
            }

            if (!(await SMS.isAvailableAsync())) {
                Alert.alert('الرسائل غير متوفرة', 'يرجى الاتصال بالطوارئ يدوياً.');
                return;
            }

            const message = `🚨 طوارئ ولادة - عملية قيصرية مطلوبة\n\nالمريضة بحاجة فورية لعملية قيصرية.\n\n${location ? `الموقع: https://maps.google.com/?q=${location}` : 'الموقع غير متوفر'}\n\nتفاصيل الحالة:\n${assessmentData ? formatAssessmentData(JSON.parse(assessmentData)) : 'غير متوفر'}\n\nيرجى الاستجابة فوراً.`;

            const { result } = await SMS.sendSMSAsync([emergencyContact], message);
            if (result === 'sent') {
                setSmsSent(true);
                voiceService.speak('تم إرسال رسالة الطوارئ. المساعدة في الطريق.');
            }
        } catch (error) {
            console.error('Error sending SMS:', error);
            Alert.alert('خطأ في الإرسال', 'يرجى الاتصال بالطوارئ يدوياً.');
        }
    };

    const formatAssessmentData = (data: any): string => {
        const indicators = [];
        const entries = Object.values(data);
        if (entries.some((e: any) => e.value === true && e.domain === 'bleeding')) indicators.push('نزيف شديد');
        if (entries.some((e: any) => e.value === 'breech')) indicators.push('ولادة مقعدية');
        if (entries.some((e: any) => e.value === 'cord')) indicators.push('هبوط الحبل السري');
        if (entries.some((e: any) => e.value === 'continuous' && e.domain === 'pain')) indicators.push('ألم مستمر (مؤشر انفصال المشيمة)');
        if (entries.some((e: any) => e.value === false && e.domain === 'baby')) indicators.push('عدم حركة الجنين');

        return indicators.length > 0 ? indicators.join('، ') : 'مؤشرات قيصرية طارئة';
    };

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <Text variant="headlineLarge" style={styles.emergencyTitle}>⚠️ حالة طوارئ</Text>
                <Text variant="titleMedium" style={styles.subtitle}>عملية قيصرية مطلوبة</Text>
            </View>

            <ScrollView style={styles.content}>
                <Card style={[styles.card, smsSent ? styles.successCard : styles.warningCard]}>
                    <Card.Content>
                        <View style={styles.statusRow}>
                            <IconButton icon={smsSent ? 'check-circle' : 'clock-alert'} size={32} iconColor={smsSent ? '#2e7d32' : '#f57c00'} />
                            <View style={styles.statusText}>
                                <Text variant="titleMedium" style={styles.statusTitle}>{smsSent ? '✅ تم إرسال رسالة الطوارئ' : '⏳ بانتظار إرسال الرسالة'}</Text>
                                {location && <Text variant="bodySmall" style={styles.locationText}>📍 تم تحديد الموقع</Text>}
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="headlineSmall" style={styles.supportTitle}>💚 أنت قوية</Text>
                        <Text variant="bodyLarge" style={styles.supportMessage}>{EMOTIONAL_SUPPORT_MESSAGES[supportMessageIndex]}</Text>
                    </Card.Content>
                </Card>

                <Text variant="titleLarge" style={styles.sectionTitle}>ما يجب فعله الآن:</Text>

                {SAFETY_INSTRUCTIONS.map((instr) => (
                    <Card key={instr.id} style={styles.instructionCard}>
                        <Card.Content>
                            <View style={styles.instructionRow}>
                                <IconButton icon={instr.icon} size={28} iconColor="#45AC8B" />
                                <View style={styles.instructionText}>
                                    <Text variant="titleMedium" style={styles.instructionTitle}>{instr.title}</Text>
                                    <Text variant="bodyMedium" style={styles.instructionBody}>{instr.text}</Text>
                                </View>
                                <IconButton icon="volume-high" size={24} onPress={() => voiceService.speak(instr.voice)} />
                            </View>
                        </Card.Content>
                    </Card>
                ))}

                <Button mode="contained" onPress={() => setConsentVisible(true)} style={styles.resendButton} icon="refresh">
                    إعادة إرسال رسالة الطوارئ
                </Button>
                <View style={styles.bottomSpace} />
            </ScrollView>

            <ComplianceModal
                visible={consentVisible}
                type="emergency_notice"
                onDismiss={() => setConsentVisible(false)}
                onAgree={performEmergencySMS}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: { alignItems: 'center', paddingVertical: 24, backgroundColor: '#ffebee', borderBottomWidth: 3, borderBottomColor: '#d32f2f' },
    emergencyTitle: { color: '#d32f2f', fontWeight: 'bold' },
    subtitle: { color: '#666', marginTop: 8 },
    content: { flex: 1, padding: 16 },
    card: { marginBottom: 16, elevation: 2 },
    successCard: { backgroundColor: '#e8f5e9' },
    warningCard: { backgroundColor: '#fff3e0' },
    statusRow: { flexDirection: 'row', alignItems: 'center' },
    statusText: { flex: 1, marginLeft: 8 },
    statusTitle: { fontWeight: 'bold' },
    locationText: { color: '#666', marginTop: 4 },
    supportTitle: { textAlign: 'center', color: '#45AC8B', marginBottom: 12 },
    supportMessage: { textAlign: 'center', fontSize: 18, lineHeight: 28, color: '#333' },
    sectionTitle: { fontWeight: 'bold', marginTop: 8, marginBottom: 16, color: '#333' },
    instructionCard: { marginBottom: 12 },
    instructionRow: { flexDirection: 'row', alignItems: 'center' },
    instructionText: { flex: 1, marginLeft: 8 },
    instructionTitle: { fontWeight: 'bold', marginBottom: 4 },
    instructionBody: { color: '#666', lineHeight: 22 },
    resendButton: { marginTop: 24, paddingVertical: 8 },
    bottomSpace: { height: 40 },
});
