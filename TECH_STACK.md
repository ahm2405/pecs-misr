# Tech Stack — PECS مصر

## Framework
- **React Native** with **Expo SDK 51+**
- **TypeScript** (strict mode)
- Target: iPad (primary), Android tablet

## Project Init Command
```bash
npx create-expo-app pecs-misr --template blank-typescript
cd pecs-misr
```

## Required Packages

### Core / Navigation
```bash
npx expo install expo-router
npx expo install react-native-safe-area-context react-native-screens
```

### Database & Storage
```bash
npx expo install expo-sqlite
npx expo install expo-file-system
npx expo install expo-secure-store
npx expo install expo-crypto
```

### Media
```bash
npx expo install expo-image-picker
npx expo install expo-av
npx expo install expo-speech
```

### UI & Animation
```bash
npx expo install react-native-reanimated
npx expo install @expo/vector-icons
npx expo install expo-haptics
npx expo install @shopify/flash-list
```

### Fonts
```bash
npx expo install @expo-google-fonts/cairo expo-font
```

---

## Package Roles

| Package | Used For |
|---|---|
| `expo-sqlite` | Local card/parent/settings database |
| `expo-file-system` | Save MP3 audio + JPEG images locally |
| `expo-secure-store` | Store hashed PINs securely |
| `expo-crypto` | SHA-256 hash PINs before storing |
| `expo-image-picker` | Parent picks image from camera or gallery |
| `expo-av` | Play cached MP3 audio files |
| `expo-speech` | Fallback TTS (ar-EG) when no ElevenLabs key |
| `expo-router` | File-based navigation (child/parent mode routing) |
| `react-native-reanimated` | Card press animations + drag-to-reorder |
| `@shopify/flash-list` | High-performance grid for card list |
| `@expo-google-fonts/cairo` | Arabic font (Cairo) |
| `expo-haptics` | Light haptic on card tap (iPad) |

---

## File Structure
```
pecs-misr/
├── app/
│   ├── _layout.tsx              # Root: font loading, DB init, mode router
│   ├── index.tsx                # Entry: redirect to child or setup
│   ├── setup.tsx                # First-launch PIN setup for both parents
│   ├── (child)/
│   │   ├── _layout.tsx
│   │   └── index.tsx            # Child PECS board (full screen)
│   └── (parent)/
│       ├── _layout.tsx          # Stack navigator
│       ├── index.tsx            # Card management grid
│       ├── add-card.tsx         # Add new card + generate audio
│       ├── edit-card.tsx        # Edit existing card
│       └── settings.tsx         # API key, voice ID, PIN management
├── components/
│   ├── PecsCard.tsx             # Single PECS card (child mode)
│   ├── SentenceStrip.tsx        # Bottom sentence builder
│   ├── SpeakButton.tsx          # Green speak circle button
│   ├── ClearButton.tsx          # Red clear button
│   ├── PinModal.tsx             # 4-digit PIN entry overlay
│   ├── AudioStatusBadge.tsx     # Grey/orange/green audio indicator
│   └── CategoryPicker.tsx       # Horizontal category selector
├── services/
│   ├── database.ts              # SQLite: init schema, CRUD for cards/parents/settings
│   ├── audio.ts                 # ElevenLabs API + expo-speech fallback + playback
│   └── fileStorage.ts           # Save/delete images and audio files
├── constants/
│   ├── categories.ts            # Category colors, Arabic labels
│   └── defaultCards.ts          # 20 seed words (import from DEFAULT_WORDS.json)
├── hooks/
│   ├── useCards.ts              # Cards state + CRUD operations
│   ├── useAudio.ts              # Audio playback queue management
│   └── useParentAuth.ts         # PIN verification logic
├── assets/
│   └── placeholders/            # Colored placeholder images for seed cards
├── DEFAULT_WORDS.json           # (provided — seed data)
├── PRD.md                       # (provided — requirements)
├── AUDIO_SETUP.md               # (provided — ElevenLabs guide)
├── DESIGN_REFERENCE.md          # (provided — visual specs)
└── app.json                     # Expo config
```

---

## app.json Key Settings
```json
{
  "expo": {
    "name": "PECS مصر",
    "slug": "pecs-misr",
    "version": "1.0.0",
    "orientation": "landscape",
    "icon": "./assets/icon.png",
    "plugins": [
      "expo-router",
      "expo-sqlite",
      [
        "expo-image-picker",
        {
          "photosPermission": "يحتاج التطبيق للوصول إلى الصور لإضافة صور البطاقات",
          "cameraPermission": "يحتاج التطبيق للكاميرا لالتقاط صور البطاقات"
        }
      ],
      [
        "expo-av",
        {
          "microphonePermission": false
        }
      ]
    ],
    "ios": {
      "bundleIdentifier": "com.yourname.pecsmisr",
      "supportsTablet": true,
      "requireFullScreen": true
    },
    "android": {
      "package": "com.yourname.pecsmisr",
      "permissions": [
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "CAMERA"
      ]
    }
  }
}
```

---

## Environment Variables
Create `.env` at project root (do NOT commit to git):
```
EXPO_PUBLIC_ELEVENLABS_API_KEY=your_key_here
EXPO_PUBLIC_ELEVENLABS_VOICE_ID=your_voice_id_here
```

Or store via the in-app Settings screen using `expo-secure-store` — preferred
since the healthcare professional will enter the key themselves.

---

## Build & Run
```bash
# Development on connected iPad
npx expo start --ios

# Development on Android tablet  
npx expo start --android

# Production build (EAS)
npx eas build --platform ios --profile production
npx eas build --platform android --profile production
```
