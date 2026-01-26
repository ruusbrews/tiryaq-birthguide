import { ExpoSpeechRecognitionModule, addSpeechRecognitionListener } from 'expo-speech-recognition';

class VoiceInputService {
    private isListening = false;
    private currentCallback: ((text: string) => void) | null = null;

    async requestPermissions() {
        try {
            const { status } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Permission error:', error);
            return false;
        }
    }

    async startListening(callback: (text: string) => void, language: string = 'ar-SA') {
        if (this.isListening) return;

        const hasPermission = await this.requestPermissions();
        if (!hasPermission) {
            console.log('No permission for voice input');
            return;
        }

        this.currentCallback = callback;
        this.isListening = true;

        const listener = addSpeechRecognitionListener((event) => {
            if (event.results && event.results.length > 0) {
                const transcript = event.results[0]?.transcript || '';
                if (this.currentCallback && transcript) {
                    this.currentCallback(transcript);
                }
            }

            if (event.isFinal) {
                this.stopListening();
            }
        });

        try {
            await ExpoSpeechRecognitionModule.start({
                lang: language,
                interimResults: false,
                maxAlternatives: 1,
            });
        } catch (error) {
            console.error('Start listening error:', error);
            this.isListening = false;
            listener.remove();
        }
    }

    stopListening() {
        if (!this.isListening) return;

        try {
            ExpoSpeechRecognitionModule.stop();
        } catch (error) {
            console.error('Stop listening error:', error);
        }

        this.isListening = false;
        this.currentCallback = null;
    }

    getIsListening() {
        return this.isListening;
    }
}

export const voiceInputService = new VoiceInputService();
