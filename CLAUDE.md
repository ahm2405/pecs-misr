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
- ElevenLabs fallback ser-facing error

## Category colors
people #FFD700 · actions #4CAF50 · food #FF9800
places #2196F3 · feelings #F44336 · other #9C27B0

## Current build status
- [ ] Phase 1 Gemini boilerplate — IN PROGRESS
- [ ] services/database.ts
- [ ] services/audio.ts
- [ ] hooks/useParentAuth.ts
- [ ] components/PecsCard.tsx
- [ ] components/PinModal.tsx
- [ ] app/(child)/index.tsx
- [ ] app/(parent)/index.tsx + add-card.tsx
- [ ] app/(parent)/settings.tsx + app/setup.tsx
- [ ] app/_layout.tsx
- [ ] GitHub repo created
