# BirthGuide 🤱

Emergency childbirth guidance app providing real-time voice and visual support when medical care is unavailable.

## 🎯 Problem

In crisis zones like Gaza, 50,000+ pregnant women lack access to medical facilities. Women are forced to give birth without professional care, leading to preventable maternal and infant deaths.

## 💡 Solution

BirthGuide provides:
- **Voice-guided instructions** for each stage of labor
- **Visual demonstrations** of positions and techniques  
- **Danger sign recognition** to identify complications
- **Offline-first design** - works without internet
- **Multilingual support** (Arabic, English)
- **Connection to remote midwives** when connectivity exists

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation
```bash
# Clone the repository
git clone https://github.com/[your-username]/birth-guide.git
cd birth-guide

# Install dependencies
npm install

# Start development server
npx expo start
```

Scan the QR code with Expo Go to run on your device.

## 📱 Features

- [x] Labor stage assessment and tracking
- [x] Voice-guided instructions (text-to-speech)
- [x] Voice question answering
- [x] Visual guidance (GIFs/images)
- [x] Danger sign checklist
- [x] Emergency SOS messaging
- [x] Fully offline capable
- [ ] Postpartum care guide (planned)
- [ ] Image-based hemorrhage detection (planned)
- [ ] C-section emergency guidance (planned)

## 🛠️ Tech Stack

- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **Voice Output:** expo-speech
- **Voice Input:** @react-native-voice/voice
- **Storage:** AsyncStorage
- **Navigation:** expo-router
- **Localization:** expo-localization + i18n-js

## 📖 Usage

1. Select your language (Arabic/English)
2. Answer simple questions about labor progress
3. Follow voice and visual guidance for each stage
4. Check danger signs regularly
5. Use SOS feature if complications arise

## 🌍 Impact

**Target:** Crisis-affected populations (Gaza, Yemen, South Sudan, refugee camps)

**Goal:** Reduce preventable maternal/infant deaths through accessible emergency guidance

**Metrics:** Births assisted, complications detected early, user confidence scores

## 🤝 Contributing

We welcome contributions! This is a humanitarian project built for CMUQ LifeLines Hackathon.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for CMUQ LifeLines Hackathon 2026
- Medical content based on WHO emergency childbirth protocols
- Inspired by the resilience of women in Gaza

## 📞 Contact

Tiryaq - +974 6699 6726

Project Link: [https://github.com/ruusbrews/tiryaq-birthguide](https://github.com/ruusbrews/tiryaq-birthguide)

---

**⚠️ Medical Disclaimer:** This app provides emergency guidance only when professional medical care is unavailable. It is not a substitute for trained medical professionals. Seek professional help whenever possible.
