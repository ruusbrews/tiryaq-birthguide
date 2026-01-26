import * as SMS from 'expo-sms';
import * as Location from 'expo-location';
import { voiceService } from './VoiceService';

class EmergencyService {
    async sendSOS() {
        try {
            voiceService.speak("جاري تحديد الموقع وإرسال رسالة الاستغاثة.");

            // 1. Get Location
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                voiceService.speak("نحتاج إذن الموقع للمساعدة.");
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            const mapLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

            // 2. Prepare Message
            const message = `SOS! I need emergency childbirth help!\nLocation: ${mapLink}\n(Sent from BirthGuide App)`;

            // 3. Send SMS
            const isAvailable = await SMS.isAvailableAsync();
            if (isAvailable) {
                const { result } = await SMS.sendSMSAsync(
                    [], // Empty recipients list so user can choose contact
                    message
                );

                if (result === 'sent') {
                    voiceService.speak("تم إرسال الرسالة.");
                } else {
                    voiceService.speak("لم يتم إرسال الرسالة.");
                }
            } else {
                voiceService.speak("خدمة الرسائل غير متوفرة.");
            }

        } catch (error) {
            console.error('SOS Error:', error);
            voiceService.speak("حدث خطأ في الإرسال.");
        }
    }
}

export const emergencyService = new EmergencyService();
