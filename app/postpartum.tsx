import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, List, Checkbox } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../components/ScreenContainer';
import { VoiceButton } from '../components/VoiceButton';
import { voiceService } from '../services/VoiceService';

export default function PostpartumScreen() {
    const router = useRouter();

    useEffect(() => {
        voiceService.speak("دليل ما بعد الولادة. الساعة الأولى مهمة جداً.");
    }, []);

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <Text variant="headlineSmall" style={styles.title}>ما بعد الولادة</Text>
                <Text variant="titleMedium" style={styles.subtitle}>الساعة الذهبية (First Hour)</Text>
            </View>

            <Card style={styles.card}>
                <Card.Title title="للأم (For Mother)" left={(props) => <List.Icon {...props} icon="face-woman" />} />
                <Card.Content>
                    <View style={styles.checkItem}>
                        <Checkbox status="unchecked" />
                        <Text style={styles.checkText}>تأكدي من توقف النزيف الشديد</Text>
                    </View>
                    <View style={styles.checkItem}>
                        <Checkbox status="unchecked" />
                        <Text style={styles.checkText}>دلكي الرحم كل 15 دقيقة</Text>
                    </View>
                    <View style={styles.checkItem}>
                        <Checkbox status="unchecked" />
                        <Text style={styles.checkText}>اشربي الماء وتناولي طعاماً خفيفاً</Text>
                    </View>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Title title="للطفل (For Baby)" left={(props) => <List.Icon {...props} icon="baby-face" />} />
                <Card.Content>
                    <View style={styles.checkItem}>
                        <Checkbox status="unchecked" />
                        <Text style={styles.checkText}>التلامس الجسدي (Skin-to-skin)</Text>
                    </View>
                    <View style={styles.checkItem}>
                        <Checkbox status="unchecked" />
                        <Text style={styles.checkText}>تغطية الرأس (Keep warm)</Text>
                    </View>
                    <View style={styles.checkItem}>
                        <Checkbox status="unchecked" />
                        <Text style={styles.checkText}>بدء الرضاعة الطبيعية فوراً</Text>
                    </View>
                </Card.Content>
            </Card>

            <View style={styles.spacer} />

            <VoiceButton
                text="عودة للصفحة الرئيسية"
                onPress={() => router.dismissAll()}
                mode="contained"
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontWeight: 'bold',
        color: '#E57373',
        marginBottom: 4,
    },
    subtitle: {
        color: '#666',
    },
    card: {
        marginBottom: 16,
        backgroundColor: '#FFF',
    },
    checkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    checkText: {
        fontSize: 16,
        marginLeft: 8,
        textAlign: 'right',
        flex: 1,
    },
    spacer: {
        flex: 1,
    },
});
