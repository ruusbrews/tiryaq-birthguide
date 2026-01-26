import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { DangerButton } from '../../components/DangerButton';
import { VoiceButton } from '../../components/VoiceButton';
import { SOSButton } from '../../components/SOSButton';
import { HomeButton } from '../../components/HomeButton';
import { voiceService } from '../../services/VoiceService';

export default function EmergencyMenuScreen() {
    const router = useRouter();

    useEffect(() => {
        voiceService.speak("قائمة الطوارئ. اختاري الحالة.");
    }, []);

    return (
        <ScreenContainer>
            <HomeButton />

            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.title}>🚨 الطوارئ</Text>
                <Text variant="titleMedium" style={styles.subtitle}>اختاري الحالة فوراً</Text>
            </View>

            <SOSButton style={styles.sosButton} />

            <Button
                mode="contained"
                icon="camera"
                onPress={() => router.push('/camera')}
                style={styles.cameraButton}
                buttonColor="#5D4037"
            >
                فحص النزيف (كاميرا)
            </Button>

            <DangerButton
                text="نزيف شديد"
                onPress={() => router.push('/emergency/hemorrhage')}
                style={styles.button}
            />

            <DangerButton
                text="ولادة مقعدية (الطفل بالمقعدة)"
                onPress={() => router.push('/emergency/breech')}
                style={styles.button}
            />

            <DangerButton
                text="الطفل لا يتنفس (إنعاش)"
                onPress={() => router.push('/emergency/resuscitation')}
                style={styles.button}
            />

            <View style={styles.spacer} />

            <VoiceButton
                text="عودة"
                onPress={() => router.back()}
                mode="outlined"
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 40,
    },
    title: {
        fontWeight: 'bold',
        color: '#D32F2F',
        marginBottom: 8,
    },
    subtitle: {
        color: '#666',
    },
    button: {
        marginBottom: 16,
    },
    sosButton: {
        marginBottom: 16,
    },
    cameraButton: {
        marginBottom: 24,
        borderColor: '#8D6E63',
        borderWidth: 1,
    },
    spacer: {
        flex: 1,
    },
});
