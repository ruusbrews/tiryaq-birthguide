import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

class VoiceService {
    private isSpeaking = false;
    private isMuted = false;
    private defaultLanguage = 'ar-SA';
    private fallbackLanguage = 'ar-EG';

    async init() {
        const savedMute = await AsyncStorage.getItem('voice_muted');
        this.isMuted = savedMute === 'true';
    }

    async setMuted(muted: boolean) {
        this.isMuted = muted;
        await AsyncStorage.setItem('voice_muted', muted.toString());
        if (muted) {
            await this.stop();
        }
    }

    getIsMuted() {
        return this.isMuted;
    }

    async speak(text: string, onDone?: () => void) {
        if (this.isMuted) return;
        if (this.isSpeaking) {
            await this.stop();
        }

        this.isSpeaking = true;

        try {
            // Simple heuristic to find an Arabic voice
            const voices = await Speech.getAvailableVoicesAsync();
            const arabicVoice = voices.find(v => v.language.includes('ar'));

            Speech.speak(text, {
                language: arabicVoice ? arabicVoice.language : this.defaultLanguage,
                rate: 0.8, // Slightly slower for clarity
                pitch: 1.0,
                onDone: () => {
                    this.isSpeaking = false;
                    if (onDone) onDone();
                },
                onError: (e) => {
                    console.error("TTS Error", e);
                    this.isSpeaking = false;
                    if (onDone) onDone();
                }
            });
        } catch (error) {
            console.error('Speech error:', error);
            this.isSpeaking = false;
            if (onDone) onDone();
        }
    }

    async stop() {
        if (this.isSpeaking) {
            await Speech.stop();
            this.isSpeaking = false;
        }
    }
}

export const voiceService = new VoiceService();
