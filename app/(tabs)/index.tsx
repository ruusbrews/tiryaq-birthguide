/**
 * Welcome / Start Screen
 * 
 * App entry point with disclaimer and labor guidance start
 * 
 * CONSTRAINTS:
 * - Large "Start" button (60px min)
 * - Clear disclaimer visible
 * - Voice capability check (background, non-blocking)
 * - Safe, reassuring design
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import voiceService from '../../services/voice';

const WelcomeScreen: React.FC = () => {
    const router = useRouter();

    // Voice capability state
    const [voiceAvailable, setVoiceAvailable] = useState(false);
    const [checkingVoice, setCheckingVoice] = useState(true);

    // Disclaimer acceptance
    const [disclaimerRead, setDisclaimerRead] = useState(false);

    /**
     * Initialize: Check voice capabilities
     * Non-blocking - continue even if voice fails
     */
    useEffect(() => {
        checkVoiceCapabilities();
    }, []);

    /**
     * Check voice capabilities in background
     */
    const checkVoiceCapabilities = async () => {
        try {
            const capabilities = await voiceService.getCapabilities();
            setVoiceAvailable(capabilities.ttsAvailable);

            if (!capabilities.ttsAvailable) {
                console.log('[Welcome] Voice unavailable - app will use visual guidance only');
            }
        } catch (error) {
            console.error('[Welcome] Voice check failed:', error);
            setVoiceAvailable(false);
        } finally {
            setCheckingVoice(false);
        }
    };

    /**
     * Start labor guidance
     * Navigate to assessment screen
     */
    const handleStartGuidance = () => {
        // Ensure disclaimer has been scrolled through
        if (!disclaimerRead) {
            Alert.alert(
                'تنبيه',
                'يرجى قراءة إخلاء المسؤولية أدناه قبل البدء',
                [{ text: 'حسناً' }]
            );
            return;
        }

        // Navigate to assessment
        router.push('/assessment');
    };

    /**
     * Handle scroll to detect if user has read disclaimer
     */
    const handleScroll = (event: any) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

        // Check if scrolled near bottom (within 20px)
        const isNearBottom =
            contentOffset.y + layoutMeasurement.height >= contentSize.height - 20;

        if (isNearBottom && !disclaimerRead) {
            setDisclaimerRead(true);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                onScroll={handleScroll}
                scrollEventThrottle={400}
            >
                {/* App Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>دليل الولادة المنزلية</Text>
                    <Text style={styles.subtitle}>BirthGuide</Text>
                </View>

                {/* Welcome Message */}
                <View style={styles.welcomeContainer}>
                    <Text style={styles.welcomeText}>
                        مرحباً بك في دليل الولادة المنزلية الطارئة
                    </Text>
                    <Text style={styles.descriptionText}>
                        هذا التطبيق يوفر إرشادات صوتية ومرئية خطوة بخطوة لمساعدتك خلال الولادة غير المخطط لها في المنزل
                    </Text>
                </View>

                {/* Voice Status */}
                {checkingVoice ? (
                    <View style={styles.voiceCheckContainer}>
                        <ActivityIndicator size="small" color="#007AFF" />
                        <Text style={styles.voiceCheckText}>فحص الصوت...</Text>
                    </View>
                ) : (
                    <View style={styles.voiceStatusContainer}>
                        <Text style={styles.voiceStatusText}>
                            {voiceAvailable
                                ? '🔊 الإرشادات الصوتية متاحة'
                                : 'ℹ️ الإرشادات النصية فقط (الصوت غير متاح)'}
                        </Text>
                    </View>
                )}

                {/* Disclaimer */}
                <View style={styles.disclaimerContainer}>
                    <Text style={styles.disclaimerTitle}>⚠️ تنويه مهم</Text>

                    <Text style={styles.disclaimerText}>
                        <Text style={styles.disclaimerBold}>هذا التطبيق للطوارئ فقط</Text>
                        {'\n\n'}
                        يُستخدم هذا التطبيق فقط في حالات الطوارئ عندما لا يكون الوصول إلى الرعاية الطبية ممكناً.
                        {'\n\n'}
                        <Text style={styles.disclaimerBold}>ليس بديلاً عن الرعاية الطبية:</Text>
                        {'\n'}
                        • اتصلي بالطوارئ (911) فوراً إذا أمكن
                        {'\n'}
                        • هذا التطبيق لا يحل محل القابلة أو الطبيب
                        {'\n'}
                        • الولادة في المستشفى هي الخيار الأكثر أماناً دائماً
                        {'\n\n'}
                        <Text style={styles.disclaimerBold}>المسؤولية:</Text>
                        {'\n'}
                        • استخدام هذا التطبيق على مسؤوليتك الخاصة
                        {'\n'}
                        • تم تصميمه لتوفير إرشادات عامة فقط
                        {'\n'}
                        • لا يشكل نصيحة طبية مخصصة
                        {'\n\n'}
                        <Text style={styles.disclaimerBold}>متى تتصلين بالطوارئ:</Text>
                        {'\n'}
                        • نزيف شديد
                        {'\n'}
                        • صعوبة في التنفس
                        {'\n'}
                        • ألم شديد غير طبيعي
                        {'\n'}
                        • أي علامات خطر أخرى
                        {'\n\n'}
                        <Text style={styles.disclaimerHighlight}>
                            بالمتابعة، أنتِ تقرين بأنك فهمت هذا التنويه وتوافقين على الشروط.
                        </Text>
                    </Text>
                </View>

                {/* Emergency Call Button */}
                <TouchableOpacity
                    style={styles.emergencyButton}
                    onPress={() => {
                        Alert.alert(
                            'الاتصال بالطوارئ',
                            'هل تريدين الاتصال بخدمات الطوارئ؟',
                            [
                                { text: 'إلغاء', style: 'cancel' },
                                {
                                    text: 'اتصل 911',
                                    style: 'destructive',
                                    onPress: () => {
                                        // TODO: Implement phone call
                                        // Linking.openURL('tel:911');
                                        Alert.alert('اتصلي بـ 911 من هاتفك');
                                    },
                                },
                            ]
                        );
                    }}
                >
                    <Text style={styles.emergencyButtonText}>📞 اتصلي بالطوارئ (911)</Text>
                </TouchableOpacity>

                {/* Scroll indicator */}
                {!disclaimerRead && (
                    <View style={styles.scrollIndicator}>
                        <Text style={styles.scrollIndicatorText}>
                            ↓ مرري للأسفل لقراءة جميع الشروط
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Start Button (Fixed at bottom) */}
            <View style={styles.startButtonContainer}>
                <TouchableOpacity
                    style={[
                        styles.startButton,
                        !disclaimerRead && styles.startButtonDisabled,
                    ]}
                    onPress={handleStartGuidance}
                    disabled={!!!disclaimerRead} // Ensure boolean
                >
                    <Text
                        style={[
                            styles.startButtonText,
                            !disclaimerRead && styles.startButtonTextDisabled,
                        ]}
                    >
                        {disclaimerRead ? 'ابدأ إرشادات الولادة →' : 'اقرأي الشروط أولاً'}
                    </Text>
                </TouchableOpacity>

                {disclaimerRead && (
                    <Text style={styles.startHintText}>
                        سيتم طرح 3 أسئلة لتقييم وضعك
                    </Text>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120, // Space for fixed button
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 24,
        paddingTop: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#007AFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
    },
    welcomeContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
        textAlign: 'right',
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'right',
        lineHeight: 24,
    },
    voiceCheckContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
        marginBottom: 16,
    },
    voiceCheckText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#007AFF',
    },
    voiceStatusContainer: {
        padding: 12,
        backgroundColor: '#E8F5E9',
        borderRadius: 8,
        marginBottom: 16,
    },
    voiceStatusText: {
        fontSize: 14,
        color: '#2E7D32',
        textAlign: 'center',
    },
    disclaimerContainer: {
        backgroundColor: '#FFF3E0',
        padding: 20,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FF9800',
        marginBottom: 16,
    },
    disclaimerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#E65100',
        textAlign: 'center',
        marginBottom: 16,
    },
    disclaimerText: {
        fontSize: 15,
        color: '#333',
        textAlign: 'right',
        lineHeight: 24,
    },
    disclaimerBold: {
        fontWeight: 'bold',
        color: '#000',
    },
    disclaimerHighlight: {
        fontWeight: 'bold',
        color: '#E65100',
        fontSize: 16,
    },
    emergencyButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    emergencyButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    scrollIndicator: {
        padding: 12,
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
        marginTop: 8,
    },
    scrollIndicatorText: {
        fontSize: 14,
        color: '#007AFF',
        textAlign: 'center',
        fontWeight: '500',
    },
    startButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    startButton: {
        minHeight: 60,
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    startButtonDisabled: {
        backgroundColor: '#E0E0E0',
        shadowOpacity: 0,
    },
    startButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    startButtonTextDisabled: {
        color: '#999',
    },
    startHintText: {
        marginTop: 8,
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
    },
});

export default WelcomeScreen;
