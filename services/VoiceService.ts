import * as Speech from 'expo-speech';

class VoiceService {
    private isSpeaking = false;
    private defaultLanguage = 'ar-SA'; // Saudi Arabic as primary
    private fallbackLanguage = 'ar-EG'; // Egyptian Arabic as fallback

    async init() {
        // Permission check if needed, usually not for TTS
        // Pre-warm voice if possible
    }

    async speak(text: string, onDone?: () => void) {
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
                }
            });
        } catch (error) {
            console.error('Speech error:', error);
            this.isSpeaking = false;
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
