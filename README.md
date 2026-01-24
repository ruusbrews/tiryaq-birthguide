# BirthGuide - Emergency Home Birth Assistant

BirthGuide is a React Native application designed to provide step-by-step audio and visual guidance for unplanned emergency home births. It features a robust decision tree, voice accessibility, and strict adherence to medical protocols for emergency scenarios.

## ⚠️ Critical Disclaimer

**THIS APPLICATION IS FOR EMERGENCY USE ONLY.**

It is NOT a substitute for professional medical care.
- **Call 911 (or local emergency services) IMMEDIATELY** if possible.
- Use this app only when medical help is unavailable or delayed.
- The developers assume no liability for outcomes resulting from the use of this app.

## Features

- **Emergency Assessment**: Quick 3-question assessment to determine labor stage.
- **Real-time Guidance**: Stage-specific instructions (Early, Active, Pushing, Postpartum).
- **Voice Assistant**: Full Text-to-Speech (TTS) support for hands-free operation.
- **Large Touch Targets**: Accessibility-focused UI with 60px+ buttons.
- **Critical Decision Support**:
  - Presentation (Head vs. Breech)
  - Hemorrhage monitoring
  - Newborn resuscitation
  - Placenta delivery
- **Emergency Protocols**: Instant access to life-saving protocols (Breech, Hemorrhage, Cord Prolapse).
- **State Persistence**: Auto-saves progress locally; resumes exactly where you left off if the app closes.

## Information for Testers

### Prerequisites
- Node.js (LTS version recommended)
- **Expo Go** app installed on your physical mobile device:
  - [Android (Play Store)](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - [iOS (App Store)](https://apps.apple.com/us/app/expo-go/id982107779)

### Installation

1. Canle the repository (if applicable) or navigate to project directory:
   ```bash
   cd birthguide
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

1. Start the development server:
   ```bash
   npx expo start
   ```

2. **Test on Physical Device (Recommended):**
   - Ensure your phone and computer are on the **same Wi-Fi network**.
   - Open **Expo Go** on your phone.
   - **Android**: Scan the QR code shown in the terminal.
   - **iOS**: Use the Camera app to scan the QR code.

3. **Test on Emulator/Simulator:**
   - Press `a` in the terminal to open on Android Emulator.
   - Press `i` in the terminal to open on iOS Simulator.

## Project Structure

- **`app/`**: Application screens (Expo Router file-based routing).
  - `(tabs)/`: Main tab navigation (Guide, Emergency).
  - `assessment.tsx`: Initial triage screen.
  - `decision-*.tsx`: Critical decision points.
- **`components/`**: Reusable UI components (`ProtocolViewer`, etc.).
- **`data/`**: Static data definitions (`protocols.ts` medical content).
- **`services/`**: Core business logic.
  - `decisionTree.ts`: State machine for labor progression.
  - `voice.ts`: Text-to-speech service integration.

## Architecture Highlights

- **State Machine**: The app functionality is driven by `decisionTree.ts`, which enforces valid state transitions and detects emergencies.
- **Offline First**: Uses `AsyncStorage` to persist the entire labor state after every single user interaction.
- **Graceful Degradation**: If Voice/TTS fails, the app automatically falls back to a fully functional button-based interface without blocking the user.

## Technologies

- React Native
- Expo (SDK 50+)
- Expo Router
- Expo Speech
- React Native Safe Area Context
- Async Storage
