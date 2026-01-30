import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, RadioButton, Card, Checkbox } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { HealthRecordStorage, HEALTH_RECORD_KEYS } from '../../../services/HealthRecordStorage';
import { voiceService } from '../../../services/VoiceService';

export default function PregnancyStatusFormScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState<any>({
        currentlyPregnant: '',
        monthsPregnant: '',
        firstPregnancy: '',
        previousBirths: '0',
        previousInfantDeath: '',
        previousCSection: '',
        twins: '',
        breech: '',
        bleeding: '',
        medicalConditions: [],
        warningSigns: '',
        previousComplications: [],
    });

    useEffect(() => {
        loadData();
        voiceService.speak("قسم حالة الحمل والمخاطر. يرجى الإجابة بدقة لضمان سلامتك.");
    }, []);

    const loadData = async () => {
        const savedData = await HealthRecordStorage.getData(HEALTH_RECORD_KEYS.PREGNANCY);
        if (savedData) setFormData(savedData);
    };

    const handleSave = async () => {
        await HealthRecordStorage.saveData(HEALTH_RECORD_KEYS.PREGNANCY, formData);
        router.back();
    };

    const toggleCheckbox = (listKey: string, value: string) => {
        const currentList = formData[listKey] || [];
        if (currentList.includes(value)) {
            setFormData({ ...formData, [listKey]: currentList.filter((i: string) => i !== value) });
        } else {
            setFormData({ ...formData, [listKey]: [...currentList, value] });
        }
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

    const renderCheckboxes = (label: string, listKey: string, options: { label: string, value: string }[]) => (
        <Card style={styles.fieldCard}>
            <Card.Content>
                <Text variant="titleMedium" style={styles.fieldLabel}>{label}</Text>
                {options.map(opt => (
                    <View key={opt.value} style={styles.radioItem}>
                        <Text>{opt.label}</Text>
                        <Checkbox
                            status={formData[listKey]?.includes(opt.value) ? 'checked' : 'unchecked'}
                            onPress={() => toggleCheckbox(listKey, opt.value)}
                            color="#45AC8B"
                        />
                    </View>
                ))}
            </Card.Content>
        </Card>
    );

    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text variant="headlineSmall" style={styles.title}>حالة الحمل والمخاطر</Text>
                </View>

                {renderRadioGroup('هل أنت حامل حالياً؟', formData.currentlyPregnant, (v) => setFormData({ ...formData, currentlyPregnant: v }), [
                    { label: 'نعم، حامل حالياً', value: 'Yes, currently pregnant' },
                    { label: 'ولدت مؤخراً (خلال آخر 6 أسابيع)', value: 'Recently gave birth (within last 6 weeks)' },
                    { label: 'لست متأكدة', value: 'Not sure' },
                ])}

                {formData.currentlyPregnant === 'Yes, currently pregnant' && renderRadioGroup('أشهر الحمل', formData.monthsPregnant, (v) => setFormData({ ...formData, monthsPregnant: v }), [
                    { label: 'أقل من 3 أشهر', value: 'Less than 3 months' },
                    { label: '4–6 أشهر', value: '4–6 months' },
                    { label: '7–8 أشهر', value: '7–8 months' },
                    { label: '9 أشهر أو أكثر', value: '9 months or more' },
                    { label: 'لست متأكدة', value: 'Not sure' },
                ])}

                {renderRadioGroup('هل هذا حملك الأول؟', formData.firstPregnancy, (v) => setFormData({ ...formData, firstPregnancy: v }), [
                    { label: 'نعم', value: 'Yes' },
                    { label: 'لا', value: 'No' },
                    { label: 'لست متأكدة', value: 'Not sure' },
                ])}

                {formData.firstPregnancy === 'No' && renderRadioGroup('عدد الولادات السابقة', formData.previousBirths, (v) => setFormData({ ...formData, previousBirths: v }), [
                    { label: '0', value: '0' },
                    { label: '1–2', value: '1–2' },
                    { label: '3–4', value: '3–4' },
                    { label: '5 أو أكثر', value: '5 or more' },
                ])}

                {formData.firstPregnancy === 'No' && renderRadioGroup('هل سبق لك فقدان رضيع؟', formData.previousInfantDeath, (v) => setFormData({ ...formData, previousInfantDeath: v }), [
                    { label: 'نعم', value: 'Yes' },
                    { label: 'لا', value: 'No' },
                    { label: 'لست متأكدة', value: 'Not sure' },
                ])}

                {formData.firstPregnancy === 'No' && renderRadioGroup('هل خضعت لعملية قيصرية سابقة؟', formData.previousCSection, (v) => setFormData({ ...formData, previousCSection: v }), [
                    { label: 'نعم', value: 'Yes' },
                    { label: 'لا', value: 'No' },
                    { label: 'لست متأكدة', value: 'Not sure' },
                ])}

                {renderRadioGroup('هل تحملين بتوأم أو أكثر؟', formData.twins, (v) => setFormData({ ...formData, twins: v }), [
                    { label: 'نعم', value: 'Yes' },
                    { label: 'لا', value: 'No' },
                    { label: 'لست متأكدة', value: 'Not sure' },
                ])}

                {renderRadioGroup('هل وضع الجنين مقعدي أو غير طبيعي؟', formData.breech, (v) => setFormData({ ...formData, breech: v }), [
                    { label: 'نعم', value: 'Yes' },
                    { label: 'لا', value: 'No' },
                    { label: 'لست متأكدة', value: 'Not sure' },
                ])}

                {renderRadioGroup('هل تعانين من نزيف مهبلي؟', formData.bleeding, (v) => setFormData({ ...formData, bleeding: v }), [
                    { label: 'نعم', value: 'Yes' },
                    { label: 'لا', value: 'No' },
                    { label: 'لست متأكدة', value: 'Not sure' },
                ])}

                {renderCheckboxes('الحالات الطبية', 'medicalConditions', [
                    { label: 'ارتفاع ضغط الدم', value: 'High blood pressure' },
                    { label: 'سكري', value: 'Diabetes' },
                    { label: 'أمراض القلب', value: 'Heart disease' },
                    { label: 'أمراض الكلى', value: 'Kidney disease' },
                    { label: 'الصرع', value: 'Epilepsy' },
                    { label: 'لا يوجد / لست متأكدة', value: 'None / Not sure' },
                ])}

                {renderRadioGroup('هل توجد علامات تحذيرية؟', formData.warningSigns, (v) => setFormData({ ...formData, warningSigns: v }), [
                    { label: 'نعم', value: 'Yes' },
                    { label: 'لا', value: 'No' },
                    { label: 'لست متأكدة', value: 'Not sure' },
                ])}

                {renderCheckboxes('مضاعفات سابقة', 'previousComplications', [
                    { label: 'نزيف حاد جداً استدعى المستشفى', value: 'Very heavy bleeding needing hospital' },
                    { label: 'تشنجات', value: 'Seizures' },
                    { label: 'عدوى مع حمى بعد الولادة', value: 'Infection with fever after birth' },
                    { label: 'ولادة صعبة جداً', value: 'Very difficult labour' },
                    { label: 'لا يوجد / لست متأكدة', value: 'None / Not sure' },
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
