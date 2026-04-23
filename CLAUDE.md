# PECS مصر — Claude Code Context

## What this project is
A PECS (Picture Exchange Communication System) app in Egyptian Arabic dialect
for children with communication needs. Built for a healthcare professional.
React Native + Expo SDK 51, targets iPad and Android tablet.

## Two modes
- Child mode: full-screen card grid, sentence strip, speak button, no chrome
- Parent mode: PIN-protected, two parents share one board, add/edit/delete cards

## Tech stack
Expo SDK 51, expo-router, expo-sqlite v2, expo-av, expo-speech, ElevenLabs TTS,
react-native-reanimated, @shopify/flash-list, Cairo font (@expo-google-fonts/cairo)

## Audio strategy
Primary: ElevenLabs API (eleven_multilingual_v2) → cached as local MP3
Fallback: expo-speech with language 'ar-EG', rate 0.8
All audio cached offline after first generation. Never crash in child mode.

## Key files
- services/database.ts — SQLite CRUD (expo-sqlite v2 / useSQLiteContext)
- services/audio.ts — ElevenLabs + fallback + playSequence
- services/fileStorage.ts — local MP3/image file helpers
- hooks/useParentAuth.ts — SHA-256 PIN hashing via expo-crypto
- components/PecsCard.tsx — pixel-perfect card, Reanimated press animation
- components/PinModal.tsx — custom numpad, shake on wrong PIN
- app/(child)/index.tsx — main child experience
- app/(parent)/ — card management, add card, settings
- app/setup.tsx — first-launch PIN setup for both parents
- constants/categories.ts — CATEGORY_COLORS, CATEGORY_LABELS_ARABIC
- types/index.ts — Card, Parent, Category, AudioStatus, SentenceCard

## Hard rules — never break these
- Cairo font on ALL Arabic text, always
- Arabic text: textAlign:'right', writingDirection:'rtl' everywhere
- Child mode: zero chrome (no headers, no status bar, no tab bar)
- Audio errors in child mode are completely silent
- Reanimated only — never use the old Animated API
- ElevenLabs fallback to expo-speech is automatic, no user-facing error

## Category colors
people #FFD700 · actions #4CAF50 · food #FF9800
places #2196F3 · feelings #F44336 · other #9C27B0

## Current build status
Last completed: bugfixes — audio_path DB write, unused imports, redundant GestureHandlerRootView
Next up: npx expo start — test the app end-to-end

- ✅ Phase 1 boilerplate — app.json, tsconfig.json, package.json, babel.config.js
- ✅ types/index.ts — Card, Parent, Category, AudioStatus, SentenceCard
- ✅ constants/categories.ts + constants/defaultCards.ts
- ✅ services/fileStorage.ts — ensureDir, getPath, saveImage, delete helpers
- ✅ services/database.ts — initDatabase, getAllCards, addCard, updateCard, deleteCard, getSetting, setSetting, getParent, setParentPin
- ✅ services/audio.ts — generateAudio, playAudio, speakFallback, playCardAudio, playSequence, preGenerateDefaultAudio
- ✅ hooks/useParentAuth.ts — hashPin, verifyPin, setupPin, isPinSet, isSetupComplete, markSetupComplete
- ✅ hooks/useCards.ts — loadCards, createCard, editCard, removeCard
- ✅ hooks/useAudio.ts — playSingle, playAll, stop, isPlaying state
- ✅ components/PecsCard.tsx — pixel-perfect, Reanimated spring, haptics, placeholder letter
- ✅ components/PinModal.tsx — 4-dot indicators, custom 3x4 numpad, shake animation on wrong PIN
- ✅ components/SentenceStrip.tsx — horizontal FlatList, slide-in Reanimated per card
- ✅ components/SpeakButton.tsx — pulse loop while speaking, spring press
- ✅ components/ClearButton.tsx
- ✅ components/AudioStatusBadge.tsx — grey/orange-spin/green states
- ✅ components/CategoryPicker.tsx — horizontal scrollable color pills
- ✅ app/(child)/_layout.tsx — headerShown:false, statusBarHidden
- ✅ app/(child)/index.tsx — FlashList grid, sentence strip, 5-finger hold→PIN, silent audio errors
- ✅ app/(parent)/_layout.tsx — Stack with Arabic header
- ✅ app/(parent)/index.tsx — card grid with edit/delete/AudioStatusBadge
- ✅ app/(parent)/add-card.tsx — image picker, RTL input, CategoryPicker, Generate Audio, Save
- ✅ app/(parent)/edit-card.tsx — same as add-card but pre-filled from DB
- ✅ app/(parent)/settings.tsx — API key, voice ID, test audio, change PINs
- ✅ app/setup.tsx — 2-step PIN creation, optional audio pre-generation with progress bar
- ✅ app/_layout.tsx — useFonts (Cairo), SQLiteProvider, GestureHandlerRootView, route to /setup or /(child)
- ✅ app/index.tsx — checks setup_complete → redirects
- ✅ GitHub repo created and pushed → https://github.com/ahm2405/pecs-misr
