import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, RadioButton, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { HealthRecordStorage, HEALTH_RECORD_KEYS } from '../../../services/HealthRecordStorage';

export default function MentalHealthFormScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState<any>({
        depressionFrequency: '',
        supportAvailable: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const savedData = await HealthRecordStorage.getData(HEALTH_RECORD_KEYS.MENTAL);
        if (savedData) setFormData(savedData);
    };

    const handleSave = async () => {
        await HealthRecordStorage.saveData(HEALTH_RECORD_KEYS.MENTAL, formData);
        router.back();
    };

    const renderRadioGroup = (label: string, value: string, setValue: (v: string) => void, options: { label: string, value: string }[]) => (
        <Card style={styles.fieldCard}>
            <Card.Content>
                <Text variant="titleMedium" style={styles.fieldLabel}>{label}</Text>
                <RadioButton.Group onValueChange={newValue => setValue(newValue)} value={value}>
                    {options.map(opt => (
                        <View key={opt.value} style={styles.radioItem}>
                            <Text>{opt.label}</Text>
                            <RadioButton value={opt.value} color="#45AC8B" />
                        </View>
                    ))}
                </RadioButton.Group>
            </Card.Content>
        </Card>
    );

    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text variant="headlineSmall" style={styles.title}>الصحة النفسية والدعم</Text>
                    <Card style={styles.privacyCard}>
                        <Card.Content>
                            <Text style={styles.privacyText}>
                                ملاحظة الخصوصية: هذه المعلومات سرية وستساعد في تحسين الخدمات المقدمة لكِ.
                            </Text>
                        </Card.Content>
                    </Card>
                </View>

                {renderRadioGroup('كم مرة شعرتِ بالإحباط أو اليأس مؤخراً؟', formData.depressionFrequency, (v) => setFormData({ ...formData, depressionFrequency: v }), [
                    { label: 'أبداً', value: 'Never' },
                    { label: 'بعض الأيام', value: 'Some days' },
                    { label: 'أغلب الأيام', value: 'Most days' },
                    { label: 'كل يوم تقريباً', value: 'Nearly every day' },
                ])}

                {renderRadioGroup('هل يوجد شخص بالغ وموثوق لدعمك أثناء الولادة؟', formData.supportAvailable, (v) => setFormData({ ...formData, supportAvailable: v }), [
                    { label: 'نعم', value: 'Yes' },
                    { label: 'لا', value: 'No' },
                    { label: 'لست متأكدة', value: 'Not sure' },
                ])}

                <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
                    حفظ والعودة
                </Button>
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 40,
        paddingHorizontal: 8,
    },
    header: {
        alignItems: 'center',
        marginVertical: 20,
    },
    title: {
        fontWeight: 'bold',
        color: '#45AC8B',
        marginBottom: 12,
    },
    privacyCard: {
        backgroundColor: '#E8F5E9',
        borderLeftWidth: 4,
        borderLeftColor: '#45AC8B',
    },
    privacyText: {
        textAlign: 'right',
        fontSize: 14,
        color: '#2E7D32',
    },
    fieldCard: {
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    fieldLabel: {
        marginBottom: 12,
        textAlign: 'right',
        color: '#333',
    },
    radioItem: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 4,
    },
    saveButton: {
        marginTop: 20,
        backgroundColor: '#45AC8B',
    },
});
