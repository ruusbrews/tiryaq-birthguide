// index.tsx - Welcome screen with green theme

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../components/ScreenContainer';
import { VoiceButton } from '../components/VoiceButton';
import { DangerButton } from '../components/DangerButton';
import { voiceService } from '../services/VoiceService';
import { voiceInputService } from '../services/VoiceInputService';
import { ListeningIndicator } from '../components/ListeningIndicator';

export default function WelcomeScreen() {
    const router = useRouter();

    useEffect(() => {
        const initVoice = async () => {
            await voiceService.init();
            setTimeout(() => {
                voiceService.speak("مرحباً بك في BirthGuide. دعم الأمهات الحوامل، دائماً.");
            }, 1000);
        };

        initVoice();

        return () => {
            voiceService.stop();
        };
    }, []);

    const handleHealthTracking = () => {
        voiceService.stop();
        router.push('/screens/HealthTrackingScreen');
    };

    const handleEmergencyAlert = () => {
        voiceService.stop();
        router.push('/assessment');
    };

    return (
        <ScreenContainer style={styles.container}>
            {/* a) App Title */}
            <View style={styles.header}>
                <Text variant="displayMedium" style={styles.title}>BirthGuide</Text>

                {/* b) Tagline */}
                <Text variant="bodyMedium" style={styles.tagline}>دعم الأمهات الحوامل، دائماً</Text>
            </View>

            <View style={styles.buttonContainer}>
                {/* c) Button 1 - Health Tracking */}
                <Button
                    mode="contained"
                    icon="clipboard-edit-outline"
                    onPress={handleHealthTracking}
                    style={[styles.actionButton, styles.healthButton]}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                >
                    تسجيل الصحة
                </Button>

                {/* c) Button 2 - Emergency Birth */}
                <Button
                    mode="contained"
                    icon="alert-outline"
                    onPress={handleEmergencyAlert}
                    style={[styles.actionButton, styles.emergencyButton]}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                >
                    ولادة طارئة الآن
                </Button>
            </View>

            {/* d) Disclaimer */}
            <View style={styles.disclaimerContainer}>
                <Text style={styles.disclaimerText}>
                    هذه ليست نصيحة طبية. هذه معلومات طارئة. إذا أمكن، اتصل أو اذهب إلى أقرب مرفق صحي في أقرب وقت ممكن.
                </Text>
            </View>

            {/* Keep existing secondary links if needed, or remove as per design.
                The instruction says layout: Title -> Tagline -> Buttons -> Disclaimer.
                I'll remove the extra buttons to keep the layout clean as requested.
            */}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 30, // 2) Spacing: Generous top margin (20-30px)
        marginBottom: 40, // 2) Spacing: Medium gap tagline -> buttons (30-40px)
    },
    title: {
        fontWeight: 'bold',
        color: '#45AC8B', // Brand color
        textAlign: 'center',
        marginBottom: 10, // 2) Spacing: Small gap title -> tagline (8-10px)
    },
    tagline: {
        fontSize: 15, // 1b) Font size 14-16px
        color: '#666666', // 1b) Subtle gray
        textAlign: 'center',
    },
    buttonContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    actionButton: {
        height: 60, // 6) Accessibility: min 60px
        borderRadius: 30, // 1c) Large, rounded corners
        justifyContent: 'center',
        marginBottom: 20, // 2) Spacing: Medium gap between buttons (15-20px)
    },
    buttonContent: {
        height: 60,
        flexDirection: 'row-reverse', // RTL icon support
    },
    buttonLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    healthButton: {
        backgroundColor: '#94E394', // 1c) Calming green
    },
    emergencyButton: {
        backgroundColor: '#FFCDD2', // 1c) Pale red
        marginBottom: 50, // 2) Spacing: Large gap buttons -> disclaimer (40-50px)
    },
    disclaimerContainer: {
        backgroundColor: '#FFF9C4', // 1d) Light yellow
        padding: 15,
        borderRadius: 8,
        marginHorizontal: 10,
    },
    disclaimerText: {
        fontSize: 11.5, // 1d) 11-12px
        color: '#999999', // 1d) Gray color
        textAlign: 'center',
        lineHeight: 18,
    },
});
