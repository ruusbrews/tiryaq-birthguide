import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, RadioButton, Card, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { HealthRecordStorage, HEALTH_RECORD_KEYS } from '../../../services/HealthRecordStorage';

export default function ConsentFormScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState<any>({
        shareData: '',
        contactPermission: '',
        mobileTeamInterest: '',
    });
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const savedConsent = await HealthRecordStorage.getData(HEALTH_RECORD_KEYS.CONSENT);
        const savedNotes = await HealthRecordStorage.getData(HEALTH_RECORD_KEYS.NOTES);
        if (savedConsent) setFormData(savedConsent);
        if (savedNotes) setNotes(savedNotes);
    };

    const handleSave = async () => {
        await HealthRecordStorage.saveData(HEALTH_RECORD_KEYS.CONSENT, formData);
        await HealthRecordStorage.saveData(HEALTH_RECORD_KEYS.NOTES, notes);
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
                    <Text variant="headlineSmall" style={styles.title}>الموافقة والتفضيلات</Text>

                    <Card style={styles.warningCard}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.warningTitle}>تنبيه خصوصية هام</Text>
                            <Text style={styles.warningText}>
                                • سيتم إرسال المعلومات عبر رسالة نصية قصيرة (SMS).{"\n"}
                                • الرسائل النصية ليست مشفرة.{"\n"}
                                • لن يتم إرسال الاسم الكامل أو الموقع الدقيق.
                            </Text>
                        </Card.Content>
                    </Card>
                </View>

                {renderRadioGroup('هل توافقين على مشاركة هذه البيانات مع وزارة الصحة؟', formData.shareData, (v) => setFormData({ ...formData, shareData: v }), [
                    { label: 'نعم، أوافق', value: 'Yes' },
                    { label: 'لا أوافق', value: 'No' },
                ])}

                {renderRadioGroup('هل تسمحين بالتواصل معكِ هاتفياً؟', formData.contactPermission, (v) => setFormData({ ...formData, contactPermission: v }), [
                    { label: 'نعم', value: 'Yes' },
                    { label: 'لا', value: 'No' },
                ])}

                {renderRadioGroup('هل أنتِ مهتمة بزيارة فريق طبي متنقل؟', formData.mobileTeamInterest, (v) => setFormData({ ...formData, mobileTeamInterest: v }), [
                    { label: 'نعم', value: 'Yes' },
                    { label: 'لا', value: 'No' },
                ])}

                <Card style={styles.fieldCard}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.fieldLabel}>ملاحظات إضافية (اختياري)</Text>
                        <TextInput
                            mode="outlined"
                            multiline
                            numberOfLines={4}
                            maxLength={160}
                            placeholder="اكتبي أي ملاحظات هنا..."
                            value={notes}
                            onChangeText={setNotes}
                            style={styles.notesInput}
                            outlineColor="#45AC8B"
                        />
                        <Text style={styles.charCount}>{notes.length} / 160</Text>
                    </Card.Content>
                </Card>

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
        marginBottom: 16,
    },
    warningCard: {
        backgroundColor: '#FFF9C4',
        marginBottom: 16,
        padding: 4,
    },
    warningTitle: {
        color: '#F57F17',
        fontWeight: 'bold',
        textAlign: 'right',
        marginBottom: 8,
    },
    warningText: {
        textAlign: 'right',
        fontSize: 13,
        lineHeight: 20,
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
    notesInput: {
        backgroundColor: '#fff',
        textAlign: 'right',
    },
    charCount: {
        textAlign: 'left',
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    saveButton: {
        marginTop: 20,
        backgroundColor: '#45AC8B',
    },
});
