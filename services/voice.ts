/**
 * Voice Service
 * 
 * CRITICAL CONSTRAINTS:
 * - Arabic only (ar-SA primary, ar-EG fallback)
 * - Female voice preference where available
 * - Binary recognition MUST degrade safely to buttons
 * - NO retries that block user flow
 * - NO assumptions about microphone availability
 * 
 * ROBUSTNESS OVER ELEGANCE:
 * - All failures are caught and logged, never thrown
 * - Features gracefully degrade to UI fallbacks
 * - User flow never blocks waiting for voice features
 */

import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

// Voice availability state
export interface VoiceCapabilities {
    ttsAvailable: boolean;      // Can we speak?
    sttAvailable: boolean;      // Can we listen?
    permissionsGranted: boolean; // Does user allow mic access?
    arabicVoiceFound: boolean;  // Do we have Arabic TTS voice?
}

// Speech recognition result for binary questions
export interface RecognitionResult {
    success: boolean;           // Did recognition work?
    response: 'yes' | 'no' | null; // What did user say? (null = unclear/failed)
    confidence: number;         // 0-1, how confident are we?
    fallbackToButtons: boolean; // Should UI show buttons instead?
}

// TTS playback result
export interface SpeechResult {
    success: boolean;           // Did speech complete?
    error?: string;            // What went wrong?
    fallbackToText: boolean;   // Should UI show text instead?
}

class VoiceService {
    public readonly DEMO_VOICE_MODE = true; // Enabled for hands-free simulation
    private capabilities: VoiceCapabilities = {
        ttsAvailable: false,
        sttAvailable: false,
        permissionsGranted: false,
        arabicVoiceFound: false
    };

    private initialized = false;
    private arabicVoiceId: string | null = null;
    private recording: Audio.Recording | null = null;

    // Arabic "yes" patterns to recognize
    private readonly YES_PATTERNS = [
        'نعم',  // Standard yes
        'ايوه', // Egyptian yes
        'اه',   // Informal yes
        'yes',  // English fallback (some systems)
    ];

    // Arabic "no" patterns to recognize
    private readonly NO_PATTERNS = [
        'لا',   // Standard no
        'لأ',   // Alternative spelling
        'no',   // English fallback
    ];

    /**
     * Initialize voice service and detect capabilities
     * 
     * FAILURE PATHS:
     * 1. Expo Speech not available → ttsAvailable = false
     * 2. Expo AV not available → sttAvailable = false
     * 3. No Arabic voice installed → arabicVoiceFound = false (use any voice)
     * 4. Permissions denied → permissionsGranted = false (no STT)
     * 
     * CRITICAL: This never throws. App continues with degraded features.
     */
    async initialize(): Promise<VoiceCapabilities> {
        if (this.initialized) {
            return this.capabilities;
        }

        // Test 1: Check TTS availability
        try {
            const voices = await Speech.getAvailableVoicesAsync();
            this.capabilities.ttsAvailable = true;

            // Find Arabic voice (prefer ar-SA, fallback to ar-EG, fallback to any ar)
            // Note: Speech.Voice doesn't expose gender, so we select by language and quality
            const arSaVoice = voices.find((v: Speech.Voice) => v.language === 'ar-SA');
            const arEgVoice = voices.find((v: Speech.Voice) => v.language === 'ar-EG');
            const anyArVoice = voices.find((v: Speech.Voice) => v.language.startsWith('ar'));

            const selectedVoice = arSaVoice || arEgVoice || anyArVoice;

            if (selectedVoice) {
                this.arabicVoiceId = selectedVoice.identifier;
                this.capabilities.arabicVoiceFound = true;
                console.log(`[Voice] Selected Arabic voice: ${selectedVoice.language} (${selectedVoice.name})`);
            } else {
                console.warn('[Voice] No Arabic voice found. TTS will use system default.');
                this.capabilities.arabicVoiceFound = false;
            }
        } catch (error) {
            console.error('[Voice] TTS initialization failed:', error);
            this.capabilities.ttsAvailable = false;
            this.capabilities.arabicVoiceFound = false;
        }

        // Test 2: Check STT availability and permissions
        try {
            // Request microphone permissions (non-blocking)
            const { status } = await Audio.requestPermissionsAsync();
            this.capabilities.permissionsGranted = status === 'granted';

            if (this.capabilities.permissionsGranted) {
                // Set audio mode for recording
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });
                this.capabilities.sttAvailable = true;
                console.log('[Voice] STT available with microphone permission');
            } else {
                console.warn('[Voice] Microphone permission denied. STT disabled.');
                this.capabilities.sttAvailable = false;
            }
        } catch (error) {
            console.error('[Voice] STT initialization failed:', error);
            this.capabilities.sttAvailable = false;
            this.capabilities.permissionsGranted = false;
        }

        this.initialized = true;

        console.log('[Voice] Initialization complete:', this.capabilities);
        return this.capabilities;
    }

    /**
     * Get current voice capabilities
     * Returns cached state or initializes if needed
     */
    async getCapabilities(): Promise<VoiceCapabilities> {
        if (!this.initialized) {
            await this.initialize();
        }
        return { ...this.capabilities };
    }

    /**
     * Speak Arabic text using TTS
     * 
     * FAILURE PATHS:
     * 1. TTS not available → fallbackToText = true, log error
     * 2. Speech interrupted → success = false, error logged
     * 3. Speech fails to start → fallbackToText = true
     * 
     * CRITICAL: Never blocks. Returns immediately with result.
     */
    async speak(text: string): Promise<SpeechResult> {
        // Ensure initialized
        if (!this.initialized) {
            await this.initialize();
        }

        // FAILURE PATH 1: TTS not available
        if (!this.capabilities.ttsAvailable) {
            console.warn('[Voice] TTS not available, showing text instead');
            return {
                success: false,
                error: 'TTS_NOT_AVAILABLE',
                fallbackToText: true
            };
        }

        try {
            // Stop any ongoing speech first
            await Speech.stop();

            // Speak with Arabic voice if available
            const options: Speech.SpeechOptions = {
                language: 'ar-SA', // Primary Arabic locale
                pitch: 1.0,
                rate: 0.9, // Slightly slower for clarity during labor
            };

            // Use specific voice if we found one
            if (this.arabicVoiceId) {
                options.voice = this.arabicVoiceId;
            }

            // Start speaking (non-blocking)
            Speech.speak(text, options);

            console.log(`[Voice] Speaking: "${text}"`);

            return {
                success: true,
                fallbackToText: false
            };

        } catch (error) {
            // FAILURE PATH 2/3: Speech failed
            console.error('[Voice] TTS failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'SPEECH_FAILED',
                fallbackToText: true
            };
        }
    }

    /**
     * Stop any ongoing speech
     * Safe to call anytime, never throws
     */
    async stopSpeaking(): Promise<void> {
        try {
            await Speech.stop();
        } catch (error) {
            console.error('[Voice] Stop speaking failed:', error);
            // Silently fail - not critical
        }
    }

    /**
     * Listen for binary yes/no response
     * 
     * FAILURE PATHS:
     * 1. STT not available → fallbackToButtons = true immediately
     * 2. Permissions not granted → fallbackToButtons = true immediately
     * 3. Recording fails to start → fallbackToButtons = true
     * 4. Recognition fails → fallbackToButtons = true
     * 5. Unclear/ambiguous result → fallbackToButtons = true
     * 6. Low confidence → fallbackToButtons = true
     * 
     * CRITICAL: 
     * - Never blocks user flow
     * - Always returns quickly (max 5 seconds)
     * - Degrades to buttons on ANY uncertainty
     * - User can always tap button instead of speaking
     */
    async listenForBinaryResponse(timeoutMs: number = 5000): Promise<RecognitionResult> {
        // Ensure initialized
        if (!this.initialized) {
            await this.initialize();
        }

        // FAILURE PATH 1: STT not available
        if (!this.capabilities.sttAvailable) {
            console.warn('[Voice] STT not available, showing buttons');
            return {
                success: false,
                response: null,
                confidence: 0,
                fallbackToButtons: true
            };
        }

        // FAILURE PATH 2: No permissions
        if (!this.capabilities.permissionsGranted) {
            console.warn('[Voice] Microphone permission not granted, showing buttons');
            return {
                success: false,
                response: null,
                confidence: 0,
                fallbackToButtons: true
            };
        }

        try {
            // Start recording
            console.log('[Voice] Starting to listen for binary response...');

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            this.recording = recording;

            // Wait for user to speak (with timeout)
            await new Promise(resolve => setTimeout(resolve, timeoutMs));

            // Stop recording and get audio
            await this.recording.stopAndUnloadAsync();
            const uri = this.recording.getURI();
            this.recording = null;

            if (!uri) {
                // FAILURE PATH 3: Recording failed
                console.warn('[Voice] Recording URI is null, showing buttons');
                return {
                    success: false,
                    response: null,
                    confidence: 0,
                    fallbackToButtons: true
                };
            }

            // NOTE: React Native doesn't have built-in speech recognition
            // In production, you would:
            // 1. Send audio to a service like Google Cloud Speech-to-Text
            // 2. Specify ar-SA language
            // 3. Parse response for yes/no patterns
            //
            // For this implementation, we acknowledge the limitation:
            console.warn('[Voice] Speech recognition requires external service. Falling back to buttons.');

            // FAILURE PATH 4: Recognition not implemented
            // In a real app, this is where you'd call an STT service
            // For now, we gracefully degrade
            return {
                success: false,
                response: null,
                confidence: 0,
                fallbackToButtons: true
            };

        } catch (error) {
            // FAILURE PATH 5: Any error during recording/recognition
            console.error('[Voice] STT failed:', error);

            // Clean up recording if it exists
            if (this.recording) {
                try {
                    await this.recording.stopAndUnloadAsync();
                } catch (cleanupError) {
                    console.error('[Voice] Failed to cleanup recording:', cleanupError);
                }
                this.recording = null;
            }

            return {
                success: false,
                response: null,
                confidence: 0,
                fallbackToButtons: true
            };
        }
    }

    /**
     * Parse recognized text into binary yes/no response
     * 
     * PRIVATE HELPER - would be used by real STT implementation
     * 
     * FAILURE PATHS:
     * 1. Text doesn't match yes/no patterns → null
     * 2. Multiple matches found → null (ambiguous)
     * 3. Empty/null text → null
     */
    private parseBinaryResponse(recognizedText: string): 'yes' | 'no' | null {
        if (!recognizedText) {
            return null;
        }

        const lowerText = recognizedText.toLowerCase().trim();

        const matchesYes = this.YES_PATTERNS.some(pattern =>
            lowerText.includes(pattern.toLowerCase())
        );

        const matchesNo = this.NO_PATTERNS.some(pattern =>
            lowerText.includes(pattern.toLowerCase())
        );

        // FAILURE PATH 2: Ambiguous (both yes and no detected)
        if (matchesYes && matchesNo) {
            console.warn('[Voice] Ambiguous response detected:', recognizedText);
            return null;
        }

        // FAILURE PATH 1: No match
        if (!matchesYes && !matchesNo) {
            console.warn('[Voice] No yes/no pattern found in:', recognizedText);
            return null;
        }

        return matchesYes ? 'yes' : 'no';
    }

    /**
     * Cancel any ongoing listening
     * Safe to call anytime, never throws
     */
    async stopListening(): Promise<void> {
        if (this.recording) {
            try {
                await this.recording.stopAndUnloadAsync();
                this.recording = null;
                console.log('[Voice] Stopped listening');
            } catch (error) {
                console.error('[Voice] Failed to stop listening:', error);
                this.recording = null; // Force cleanup even if stop failed
            }
        }
    }

    /**
     * Check if currently listening
     */
    isListening(): boolean {
        return this.recording !== null;
    }

    /**
     * Reset voice service (for testing or permission changes)
     */
    async reset(): Promise<void> {
        await this.stopSpeaking();
        await this.stopListening();
        this.initialized = false;
        this.arabicVoiceId = null;
        this.capabilities = {
            ttsAvailable: false,
            sttAvailable: false,
            permissionsGranted: false,
            arabicVoiceFound: false
        };
        console.log('[Voice] Service reset');
    }
}

// Singleton instance
export default new VoiceService();
