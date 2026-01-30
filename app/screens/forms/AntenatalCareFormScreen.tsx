import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, RadioButton, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { HealthRecordStorage, HEALTH_RECORD_KEYS } from '../../../services/HealthRecordStorage';

export default function AntenatalCareFormScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState<any>({
        visitedFacility: '',
        numVisits: '',
        careLocation: '',
        bpMeasured: '',
        bloodTest: '',
        anaemiaDiagnosis: '',
        plannedPlace: '',
        facilityReachable: '',
        transportArranged: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const savedData = await HealthRecordStorage.getData(HEALTH_RECORD_KEYS.ANTENATAL);
        if (savedData) setFormData(savedData);
    };

    const handleSave = async () => {
        await HealthRecordStorage.saveData(HEALTH_RECORD_KEYS.ANTENATAL, formData);
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
                    <Text variant="headlineSmall" style={styles.title}>رعاية ما قبل الولادة</Text>
                </View>

                {renderRadioGroup('هل زرتِ منشأة صحية؟', formData.visitedFacility, (v) => setFormData({ ...formData, visitedFacility: v }), [
                    { label: 'نعم', value: 'Yes' },
                    { label: 'لا', value: 'No' },
                ])}

                {formData.visitedFacility === 'Yes' && renderRadioGroup('عدد الزيارات', formData.numVisits, (v) => setFormData({ ...formData, numVisits: v }), [
                    { label: '1', value: '1' },
                    { label: '2', value: '2' },
                    { label: '3', value: '3' },
                    { label: '4 فأكثر', value: '4 or more' },
                ])}

                {renderRadioGroup('مكان تلقي الرعاية', formData.careLocation, (v) => setFormData({ ...formData, careLocation: v }), [
                    { label: 'مستشفى', value: 'Hospital' },
                    { label: 'عيادة أولية', value: 'Primary clinic' },
                    { label: 'عيادة متنقلة', value: 'Mobile clinic' },
                    { label: 'قابلة في المنزل/الخيمة', value: 'Midwife at home/tent' },
                    { label: 'لا توجد رعاية', value: 'No care' },
                ])}

                {renderRadioGroup('هل تم قياس ضغط الدم؟', formData.bpMeasured, (v) => setFormData({ ...formData, bpMeasured: v }), [
                    { label: 'نعم', value: 'Yes' },
                    { label: 'لا', value: 'No' },
                ])}

                {renderRadioGroup('هل تم إجراء فحص دم؟', formData.bloodTest, (v) => setFormData({ ...formData, bloodTest: v }), [
                    { label: 'نعم', value: 'Yes' },
                    { label: 'لا', value: 'No' },
                ])}

                {formData.bloodTest === 'Yes' && renderRadioGroup('هل تم تشخيص فقر دم (أنيميا)؟', formData.anaemiaDiagnosis, (v) => setFormData({ ...formData, anaemiaDiagnosis: v }), [
                    { label: 'نعم', value: 'Yes' },
                    { label: 'لا', value: 'No' },
                    { label: 'لست متأكدة', value: 'Not sure' },
                ])}

                {renderRadioGroup('المكان المخطط للولادة', formData.plannedPlace, (v) => setFormData({ ...formData, plannedPlace: v }), [
                    { label: 'مستشفى', value: 'Hospital' },
                    { label: 'مركز صحي', value: 'Health center' },
                    { label: 'المنزل/الخيمة', value: 'Home/tent' },
                    { label: 'غير محدد بعد', value: 'Not decided yet' },
                ])}

                {renderRadioGroup('هل يمكن الوصول للمنشأة خلال 60 دقيقة؟', formData.facilityReachable, (v) => setFormData({ ...formData, facilityReachable: v }), [
                    { label: 'نعم', value: 'Yes' },
                    { label: 'لا', value: 'No' },
                    { label: 'لست متأكدة', value: 'Not sure' },
                ])}

                {renderRadioGroup('هل تم ترتيب وسيلة نقل؟', formData.transportArranged, (v) => setFormData({ ...formData, transportArranged: v }), [
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
