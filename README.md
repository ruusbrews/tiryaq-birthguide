# BirthGuide: Emergency Childbirth Assistant

An Expo-based mobile application designed to provide emergency childbirth guidance in high-pressure situations.

## Core Architecture

### Frontend & UI
- **Framework**: React Native with **Expo Go**.
- **Navigation**: `expo-router` for file-based routing.
- **Theming**: `react-native-paper` using a "Hospital Green" (#94E394) theme.
- **UI Components**: 
  - `ScreenContainer`: Global layout with a reactive `ListeningIndicator`.
  - `VoiceButton`: Standard button that triggers TTS feedback.
  - `DangerButton`: High-visibility red button for critical actions.

### Services (Logic Layer)
- **VoiceService (`expo-speech`)**: Handles Text-to-Speech (TTS) in Arabic. 
  - Optimized for speed (1.1) and natural/kind female voices.
- **VoiceInputService (`expo-av` + Fanar API)**: Powers hands-free interaction.
  - Records 5-second audio snippets using `Audio.Recording`.
  - Transcribes audio via **Fanar Aura-STT-1** API.
  - Uses a subscriber pattern to update UI listening state in real-time.

### Data Layer
- **`decisions.ts`**: The logic tree for evaluating the stage of birth and emergency risk.
- **`protocols.ts`**: Structured emergency medical steps (HELLP, Breech, Resuscitation).
- **`stages.ts`**: Educational content and instructions for normal labor stages.

### External Integrations
- **Fanar API**: Primary Arabic Speech-to-Text engine.
- **Expo SMS**: Sending emergency location alerts.
- **Expo Camera**: Visual bleeding classification.

## Key Interaction Flow
1. **Instruction**: `VoiceService` reads steps or questions to the user.
2. **Listening**: Once instructions finish, `VoiceInputService` automatically starts a 5-second recording window.
3. **Transcription**: The audio is sent to Fanar AI for Arabic transcription.
4. **Action**: The app matches keywords (e.g., "نعم", "تم") to progress the user through the protocol hands-free.
