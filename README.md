# BirthGuide: Emergency Childbirth Assistant

**BirthGuide** is a bilingual (Arabic/English) mobile application designed to guide women through emergency childbirth situations when qualified assistance is unavailable. Built with React Native and Expo, it provides step-by-step voice-guided protocols based on WHO and UNFPA emergency obstetric care guidelines, enabling hands-free navigation during high-pressure labor situations.

**DISCLAIMER**: This application is designed for **emergency situations ONLY** when qualified assistance is unavailable. It is based on WHO emergency obstetric care protocols but **should never replace qualified healthcare services**.

---

## 🌟 Key New Features (Implemented Jan 2026)

### 1. Structured Emergency Assessment
A structured decision tree derived from international emergency standards.
- **Triage Logic**: Immediate "kill-switch" detection for critical dangers (e.g., breech presentation, severe hemorrhage).
- **Visual Decision Support**: Integrated illustrative images for decision tree nodes and emergency protocols to aid in rapid recognition and action.
- **Clinical Domains**: Structured evaluation of pain patterns, bleeding color/volume, fetal movement, and obstetric history.
- **Risk Scoring**: Automated calculation of risk levels (Safe, Monitor, High Risk) to tailor guidance.

### 2. Specialized Emergency Protocols
Beyond standard birth, the app now provides dedicated modules for:
- **C-Section Protocol**: Specialized instructions for situations where surgical intervention is ideally required, including emotional support and safety positioning (knee-chest).
- **Severe Hemorrhage (PPH)**: Rapid-response steps to manage excessive bleeding.
- **Immediate Danger**: General protocol for life-threatening maternal/fetal distress.

### 3. Integrated Legal Compliance & Consent
Built-in transparency and security for high-risk data:
- **Informed Consent**: Mandatory popups before health data or SOS alerts are transmitted via SMS.
- **Privacy First**: Health records focus on clinical metrics, intentionally omitting names or precise residential addresses.
- **SOS Locations**: Automated GPS sharing included in emergency alerts, only with explicit user agreement.

### 4. Bilingual Interactive UX
- **Language Toggle**: Quick switch between Arabic (Primary) and English.
- **Persistent STT**: Refined hands-free input that remains active until a decision is made, with automatic recovery from silence.
- **Mute-Safe Monitoring**: Independent control over voice instructions (TTS) and voice input (STT) to assure accessibility and give users control over their experience.

---

## 📦 Quick Start

### Prerequisites
- **Node.js** (v18+)
- **Expo Go app** on your mobile device.

### Installation
```bash
git clone https://github.com/ruusbrews/tiryaq-birthguide.git
cd tiryaq-birthguide
npm install
npx expo start
```

### Configuration
Update `VoiceInputService.ts` with your **Fanar API Key** for Arabic Speech-to-Text functionality.

---

## 🛠 Core Architecture

### Frontend & UI
- **Framework**: React Native + Expo Router.
- **Theming**: "Soothing Green" custom theme for maternal support.
- **UI Components**: `ComplianceModal`, `ListeningIndicator`, `LanguageToggle`.

### Services
- **VoiceService**: Optimized Arabic TTS with mute support.
- **VoiceInputService**: Continuous, persistent STT using Fanar AI for hands-free navigation.
- **HealthRecordSMSService**: Efficient data compression for transmission over standard SMS networks in low-connectivity areas.

### Data
- **Offline Storage**: Uses `AsyncStorage` to persist maternal health records and assessment data without internet access.

---

## 📜 Sources & Acknowledgments
- **WHO**: Emergency Obstetric Care (IMPAC)
- **UNFPA**: Basic Emergency Obstetric and Newborn Care guidelines
- **Fanar AI**: Arabic Speech-to-Text integration

---

**Built with love for mothers and caregivers in crisis situations worldwide.🤍**
