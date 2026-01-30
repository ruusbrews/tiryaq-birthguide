import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, RadioButton, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { HealthRecordStorage, HEALTH_RECORD_KEYS } from '../../../services/HealthRecordStorage';

export default function IdentificationFormScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        ageGroup: '',
        governorate: '',
        locationType: '',
        displaced: '',
        phoneContact: '',
        canReceiveSMS: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const savedData = await HealthRecordStorage.getData(HEALTH_RECORD_KEYS.IDENTIFICATION);
        if (savedData) setFormData(savedData);
    };

    const handleSave = async () => {
        if (!formData.ageGroup || !formData.governorate || !formData.locationType ||
            !formData.displaced || !formData.phoneContact || !formData.canReceiveSMS) {
            alert('يرجى إكمال جميع الحقول المطلوبة');
            return;
        }
        await HealthRecordStorage.saveData(HEALTH_RECORD_KEYS.IDENTIFICATION, formData);
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
                    <Text variant="headlineSmall" style={styles.title}>الهوية والتواصل</Text>
                </View>

                {renderRadioGroup('الفئة العمرية (مطلوب)', formData.ageGroup, (v) => setFormData({ ...formData, ageGroup: v }), [
                    { label: 'أقل من 18', value: 'Under 18' },
                    { label: '18–24', value: '18–24' },
                    { label: '25–34', value: '25–34' },
                    { label: '35–39', value: '35–39' },
                    { label: '40 أو أكثر', value: '40 or above' },
                ])}

                {renderRadioGroup('المحافظة (مطلوب)', formData.governorate, (v) => setFormData({ ...formData, governorate: v }), [
                    { label: 'شمال غزة', value: 'North Gaza' },
                    { label: 'غزة', value: 'Gaza' },
                    { label: 'المنطقة الوسطى', value: 'Middle Area' },
                    { label: 'خانيونس', value: 'Khan Younis' },
                    { label: 'رفح', value: 'Rafah' },
                ])}

                {renderRadioGroup('نوع الموقع الحالي (مطلوب)', formData.locationType, (v) => setFormData({ ...formData, locationType: v }), [
                    { label: 'المنزل الأصلي', value: 'Original home' },
                    { label: 'منزل أقارب/عائلة مستضيفة', value: 'Relative/host family home' },
                    { label: 'مدرسة أو مركز إيواء عام', value: 'School or public shelter' },
                    { label: 'خيمة/مخيم', value: 'Tent/camp' },
                    { label: 'مكان مؤقت آخر', value: 'Other temporary place' },
                ])}

                {renderRadioGroup('نازحة من المنزل الأصلي (مطلوب)', formData.displaced, (v) => setFormData({ ...formData, displaced: v }), [
                    { label: 'نعم', value: 'Yes' },
                    { label: 'لا', value: 'No' },
                ])}

                {renderRadioGroup('وسيلة التواصل الهاتفي المفضلة (مطلوب)', formData.phoneContact, (v) => setFormData({ ...formData, phoneContact: v }), [
                    { label: 'هاتفي الخاص', value: 'Own phone' },
                    { label: 'هاتف الشريك/قريب', value: 'Partner/relative phone' },
                    { label: 'جار/جهة اتصال مجتمعية', value: 'Neighbour/community contact' },
                    { label: 'لا يوجد هاتف متاح', value: 'No phone available' },
                ])}

                {renderRadioGroup('هل يمكنك استقبال الرسائل القصيرة (SMS)؟ (مطلوب)', formData.canReceiveSMS, (v) => setFormData({ ...formData, canReceiveSMS: v }), [
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
