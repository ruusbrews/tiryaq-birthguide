import { Audio } from 'expo-av';

class VoiceInputService {
    private recording: Audio.Recording | null = null;
    private isListening = false;
    private isTranscribing = false;
    private transcription = '';
    private onTranscriptCallback: ((text: string) => void) | null = null;
    private FANAR_API_KEY = 'ixVmNEbLwpwW9PjfJpPn1cG8HCFhZA2L';
    private FANAR_API_URL = 'https://api.fanar.qa/v1/audio/transcriptions';
    private stopTimeout: any = null;
    private listeners: Set<(listening: boolean, transcribing: boolean, transcription: string) => void> = new Set();

    private notify() {
        this.listeners.forEach(cb => cb(this.isListening, this.isTranscribing, this.transcription));
    }

    subscribe(cb: (listening: boolean, transcribing: boolean, transcription: string) => void) {
        this.listeners.add(cb);
        cb(this.isListening, this.isTranscribing, this.transcription);
        return () => this.listeners.delete(cb);
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
            this.transcription = '';
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

    async stopListening(shouldTranscribe = true) {
        if (!this.isListening) return;

        // Reset the callback early if we are stopping (especially if cancelled)
        if (!shouldTranscribe) {
            this.onTranscriptCallback = null;
        }

        if (this.stopTimeout) {
            clearTimeout(this.stopTimeout);
            this.stopTimeout = null;
        }

        if (shouldTranscribe) {
            this.isTranscribing = true;
        }
        this.isListening = false;
        this.notify();
        console.log('Stopping recording...');

        try {
            if (this.recording) {
                await this.recording.stopAndUnloadAsync();
                const uri = this.recording.getURI();
                this.recording = null;

                if (uri && shouldTranscribe) {
                    await this.transcribeAudio(uri);
                } else {
                    this.isTranscribing = false;
                    this.notify();
                }
            } else {
                this.isTranscribing = false;
                this.notify();
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

            if (data.text) {
                // If transcription comes back as separated letters (common in some Arabic STT outputs), join them
                let cleanedText = data.text;
                if (cleanedText.split(' ').every((s: string) => s.length === 1)) {
                    cleanedText = cleanedText.split(' ').join('');
                }

                this.transcription = cleanedText;
                this.isTranscribing = false;
                this.notify();
                if (callback) callback(cleanedText);
            } else {
                this.isTranscribing = false;
                this.notify();
                console.log('No text transcribed or no callback.');
                if (callback) callback(''); // Signal completion even if empty
            }
        } catch (error) {
            this.isTranscribing = false;
            this.notify();
            console.error('Transcription error:', error);
            if (callback) callback(''); // Signal completion even if error
        }
    }

    getIsListening() {
        return this.isListening;
    }
}

export const voiceInputService = new VoiceInputService();
