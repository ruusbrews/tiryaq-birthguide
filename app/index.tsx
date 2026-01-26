import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../components/ScreenContainer';
import { VoiceButton } from '../components/VoiceButton';
import { DangerButton } from '../components/DangerButton';
import { voiceService } from '../services/VoiceService';

export default function WelcomeScreen() {
    const router = useRouter();

    useEffect(() => {
        voiceService.init();
        const timer = setTimeout(() => {
            voiceService.speak("مرحباً. أنا مساعد الولادة في الظروف الطارئة. سأساعدك خطوة بخطوة.");
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleAgree = () => {
        voiceService.stop();
        router.push('/assessment');
    };

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <Text variant="displayMedium" style={styles.title}>BirthGuide</Text>
                <Text variant="titleMedium" style={styles.subtitle}>دليل الولادة الطارئة</Text>
            </View>

            <Card style={styles.disclaimerCard}>
                <Card.Content>
                    <Text variant="titleLarge" style={styles.warningTitle}>⚠️ تنبيه هام</Text>
                    <Text variant="bodyLarge" style={styles.warningText}>
                        هذا التطبيق للطوارئ فقط عندما لا يوجد طبيب.
                    </Text>
                    <Text variant="bodyMedium" style={styles.warningSubtext}>
                        This app is for emergencies ONLY when no doctor is available.
                    </Text>
                </Card.Content>
            </Card>

            <View style={styles.spacer} />

            <DangerButton
                text="طوارئ (Emergency)"
                onPress={() => router.push('/emergency')}
                style={styles.emergencyButton}
            />

            <VoiceButton
                text="أوافق - ابدأ المساعدة"
                speakText="أوافق. ابدأ المساعدة"
                onPress={handleAgree}
                mode="contained"
                style={styles.startButton}
            />

            <Button
                mode="text"
                onPress={() => router.push('/references')}
                textColor="#999"
                style={styles.refButton}
            >
                المراجع الطبية / Medical References
            </Button>

            <Button
                mode="text"
                onPress={() => router.push('/postpartum')}
                textColor="#E57373"
                style={styles.refButton}
            >
                ما بعد الولادة / Postpartum Care
            </Button>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 20,
    },
    title: {
        fontWeight: 'bold',
        color: '#E57373',
        marginBottom: 8,
    },
    subtitle: {
        color: '#666',
    },
    disclaimerCard: {
        backgroundColor: '#FFF3E0',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#FFB74D',
    },
    warningTitle: {
        color: '#E65100',
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    warningText: {
        textAlign: 'center',
        marginBottom: 8,
        fontSize: 18,
        lineHeight: 28,
    },
    warningSubtext: {
        textAlign: 'center',
        color: '#666',
        fontStyle: 'italic',
    },
    spacer: {
        flex: 1,
    },
    startButton: {
        marginTop: 'auto',
        marginBottom: 12,
    },
    emergencyButton: {
        marginBottom: 16,
    },
    refButton: {
        marginBottom: 8,
    }
});
