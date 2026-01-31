// index.tsx - Welcome screen with green theme

import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../components/ScreenContainer';
import { VoiceButton } from '../components/VoiceButton';
import { DangerButton } from '../components/DangerButton';
import { voiceService } from '../services/VoiceService';
import { voiceInputService } from '../services/VoiceInputService';
import { ListeningIndicator } from '../components/ListeningIndicator';
import { ComplianceModal } from '../components/ComplianceModal';
import { useLanguage } from '../context/LanguageContext';
import { Animated } from 'react-native';

const TRANSLATIONS = {
    ar: {
        tagline: "دعم الأمهات الحوامل، دائماً",
        disclaimer_link: "إخلاء المسؤولية",
        health_btn: "تسجيل الصحة",
        emergency_btn: "ولادة طارئة الآن",
        bottom_disclaimer: "هذه ليست نصيحة طبية. هذه معلومات طارئة. إذا أمكن، اتصل أو اذهب إلى أقرب مرفق صحي في أقرب وقت ممكن."
    },
    en: {
        tagline: "Supporting Pregnant Mothers, Always",
        disclaimer_link: "Legal Disclaimer",
        health_btn: "Health Records",
        emergency_btn: "Emergency Birth Now",
        bottom_disclaimer: "This is not medical advice. This is emergency information. If possible, call or go to the nearest health facility as soon as possible."
    }
};

export default function WelcomeScreen() {
    const router = useRouter();
    const { language } = useLanguage();
    const t = TRANSLATIONS[language];

    const [disclaimerVisible, setDisclaimerVisible] = React.useState(false);
    const [emergencyNoticeVisible, setEmergencyNoticeVisible] = React.useState(false);
    const fadeAnim = React.useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Smooth transition when language changes
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0.5, duration: 150, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]).start();
    }, [language]);

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
        setEmergencyNoticeVisible(true);
    };

    const confirmEmergencyAlert = () => {
        router.push('/assessment');
    };

    return (
        <ScreenContainer style={styles.container}>
            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                {/* a) App Title */}
                <View style={styles.header}>
                    <Text variant="displayMedium" style={styles.title}>BirthGuide</Text>

                    {/* b) Tagline */}
                    <Text variant="bodyMedium" style={styles.tagline}>{t.tagline}</Text>

                    <TouchableOpacity onPress={() => setDisclaimerVisible(true)} style={styles.disclaimerLink}>
                        <Text style={styles.disclaimerLinkText}>{t.disclaimer_link}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.buttonContainer}>
                    {/* c) Button 1 - Health Tracking */}
                    <Button
                        mode="contained"
                        icon="clipboard-edit-outline"
                        onPress={handleHealthTracking}
                        style={[styles.actionButton, styles.healthButton]}
                        contentStyle={[styles.buttonContent, language === 'en' && { flexDirection: 'row' }]}
                        labelStyle={styles.buttonLabel}
                    >
                        {t.health_btn}
                    </Button>

                    {/* c) Button 2 - Emergency Birth */}
                    <Button
                        mode="contained"
                        icon="alert-outline"
                        onPress={handleEmergencyAlert}
                        style={[styles.actionButton, styles.emergencyButton]}
                        contentStyle={[styles.buttonContent, language === 'en' && { flexDirection: 'row' }]}
                        labelStyle={styles.buttonLabel}
                    >
                        {t.emergency_btn}
                    </Button>
                </View>

                {/* d) Disclaimer */}
                <View style={styles.disclaimerContainer}>
                    <Text style={styles.disclaimerText}>
                        {t.bottom_disclaimer}
                    </Text>
                </View>
            </Animated.View>

            <ComplianceModal
                visible={disclaimerVisible}
                type="home"
                onDismiss={() => setDisclaimerVisible(false)}
            />

            <ComplianceModal
                visible={emergencyNoticeVisible}
                type="emergency_birth_info"
                onDismiss={() => setEmergencyNoticeVisible(false)}
                onAgree={confirmEmergencyAlert}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 50, // 2) Spacing: Increased top margin
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
    disclaimerLink: {
        marginTop: 8,
    },
    disclaimerLinkText: {
        fontSize: 12,
        color: '#999999',
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
    disclaimerText: {
        fontSize: 11.5, // 1d) 11-12px
        color: '#999999', // 1d) Gray color
        textAlign: 'center',
        lineHeight: 18,
    },
});
