import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, RadioButton, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { HealthRecordStorage, HEALTH_RECORD_KEYS } from '../../../services/HealthRecordStorage';

export default function LivingConditionsFormScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState<any>({
        foodAccess: '',
        waterAccess: '',
        sleepingArrangement: '',
        physicalSafety: '',
        disability: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const savedData = await HealthRecordStorage.getData(HEALTH_RECORD_KEYS.LIVING);
        if (savedData) setFormData(savedData);
    };

    const handleSave = async () => {
        await HealthRecordStorage.saveData(HEALTH_RECORD_KEYS.LIVING, formData);
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
                    <Text variant="headlineSmall" style={styles.title}>الظروف المعيشية</Text>
                </View>

                {renderRadioGroup('الحصول على الغذاء', formData.foodAccess, (v) => setFormData({ ...formData, foodAccess: v }), [
                    { label: 'كافٍ ومنتظم', value: 'Sufficient and regular' },
                    { label: 'أحياناً غير كافٍ', value: 'Sometimes insufficient' },
                    { label: 'غالباً غير كافٍ', value: 'Often insufficient' },
                ])}

                {renderRadioGroup('الحصول على المياه المأمونة', formData.waterAccess, (v) => setFormData({ ...formData, waterAccess: v }), [
                    { label: 'كافٍ ومنتظم', value: 'Sufficient and regular' },
                    { label: 'أحياناً غير كافٍ', value: 'Sometimes insufficient' },
                    { label: 'غالباً غير كافٍ', value: 'Often insufficient' },
                ])}

                {renderRadioGroup('مكان النوم الحالي', formData.sleepingArrangement, (v) => setFormData({ ...formData, sleepingArrangement: v }), [
                    { label: 'سرير/فرشة على الأرض', value: 'Bed/Mattress on floor' },
                    { label: 'مساحة مشتركة مزدحمة', value: 'Crowded shared space' },
                    { label: 'لا يوجد مكان ثابت', value: 'No fixed place' },
                ])}

                {renderRadioGroup('هل تشعرين بالأمان الجسدي في موقعك؟', formData.physicalSafety, (v) => setFormData({ ...formData, physicalSafety: v }), [
                    { label: 'نعم', value: 'Yes' },
                    { label: 'لا', value: 'No' },
                    { label: 'لست متأكدة', value: 'Not sure' },
                ])}

                {renderRadioGroup('هل تعانين من إعاقة أو صعوبة في الحركة؟', formData.disability, (v) => setFormData({ ...formData, disability: v }), [
                    { label: 'نعم', value: 'Yes' },
                    { label: 'لا', value: 'No' },
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
