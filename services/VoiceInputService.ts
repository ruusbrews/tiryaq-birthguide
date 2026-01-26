import { Audio } from 'expo-av';

class VoiceInputService {
    private recording: Audio.Recording | null = null;
    private isListening = false;
    private onTranscriptCallback: ((text: string) => void) | null = null;
    private FANAR_API_KEY = 'ixVmNEbLwpwW9PjfJpPn1cG8HCFhZA2L';
    private FANAR_API_URL = 'https://api.fanar.qa/v1/audio/transcriptions';
    private stopTimeout: any = null;
    private subscribers: Set<(state: boolean) => void> = new Set();

    private notify() {
        this.subscribers.forEach(cb => cb(this.isListening));
    }

    subscribe(cb: (state: boolean) => void) {
        this.subscribers.add(cb);
        cb(this.isListening);
        return () => this.subscribers.delete(cb);
    }

    async requestPermissions() {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Permission error:', error);
            return false;
        }
    }

    async startListening(callback: (text: string) => void) {
        if (this.isListening) {
            console.log('Already listening, skipping start');
            return;
        }

        const hasPermission = await this.requestPermissions();
        if (!hasPermission) {
            console.warn('No permission for audio recording');
            return;
        }

        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            this.recording = recording;
            this.onTranscriptCallback = callback;
            this.isListening = true;
            this.notify();

            console.log('Started recording... (will auto-stop in 5s)');

            // Auto-stop after 5 seconds to avoid large files and 422 errors
            if (this.stopTimeout) clearTimeout(this.stopTimeout);
            this.stopTimeout = setTimeout(() => {
                if (this.isListening) {
                    console.log('Auto-stopping record due to 5s timeout');
                    this.stopListening();
                }
            }, 5000);

        } catch (error) {
            console.error('Failed to start recording', error);
            this.isListening = false;
        }
    }

    async stopListening() {
        if (!this.isListening) return;

        if (this.stopTimeout) {
            clearTimeout(this.stopTimeout);
            this.stopTimeout = null;
        }

        this.isListening = false;
        this.notify();
        console.log('Stopping recording...');

        try {
            if (this.recording) {
                await this.recording.stopAndUnloadAsync();
                const uri = this.recording.getURI();
                this.recording = null;

                if (uri) {
                    await this.transcribeAudio(uri);
                }
            }
        } catch (error) {
            console.error('Failed to stop recording', error);
        }
    }

    private async transcribeAudio(uri: string) {
        const callback = this.onTranscriptCallback;
        // Reset callback to prevent double calls or stale state
        this.onTranscriptCallback = null;

        try {
            const formData = new FormData();

            // Format the file part correctly for fetch / FormData in React Native
            const fileToUpload = {
                uri: uri,
                type: 'audio/m4a',
                name: 'recording.m4a',
            };

            // @ts-ignore
            formData.append('file', fileToUpload);
            formData.append('model', 'Fanar-Aura-STT-1');

            console.log('Sending to Fanar API...');
            const response = await fetch(this.FANAR_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.FANAR_API_KEY}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Fanar API Error:', errorText);
                return;
            }

            const data = await response.json();
            console.log('Fanar API Response:', data);

            if (data.text && callback) {
                callback(data.text);
            } else {
                console.log('No text transcribed or no callback.');
            }
        } catch (error) {
            console.error('Transcription error:', error);
        }
    }

    getIsListening() {
        return this.isListening;
    }
}

export const voiceInputService = new VoiceInputService();
