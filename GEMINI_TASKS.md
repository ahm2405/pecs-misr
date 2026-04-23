# Gemini CLI Tasks — Run BEFORE Claude Code
# ─────────────────────────────────────────────────────────────
# These are all the boilerplate / scaffolding tasks.
# Run Gemini first, verify the output, THEN hand off to Claude Code.
# ─────────────────────────────────────────────────────────────

## HOW TO USE GEMINI CLI
# Install: npm install -g @google/gemini-cli
# Run:     gemini
# Then paste each prompt below one at a time.
# After each one, check the file it created before moving to the next.

---

## GEMINI TASK 1 — Create app.json

Create a file called `app.json` for a React Native Expo SDK 51 app with these exact settings:

- App name: "PECS مصر"
- Slug: "pecs-misr"
- Version: "1.0.0"
- Orientation: locked to "landscape"
- Scheme: "pecsmisr"
- New architecture: enabled
- Plugins: expo-router, expo-sqlite, expo-image-picker (with Arabic permission strings), expo-av (microphone false)
- iOS bundle ID: "com.pecsmisr.app", supportsTablet: true, requireFullScreen: true
- Android package: "com.pecsmisr.app", permissions: READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE, CAMERA
- Web: bundler "metro"

Write the complete valid JSON file.

---

## GEMINI TASK 2 — Create package.json

Create a `package.json` for an Expo SDK 51 React Native TypeScript project called "pecs-misr".

Include these exact dependencies:
- expo: ~51.0.0
- expo-router: ~3.5.0
- react: 18.2.0
- react-native: 0.74.0
- expo-sqlite: ~14.0.0
- expo-file-system: ~17.0.0
- expo-secure-store: ~13.0.0
- expo-crypto: ~13.0.0
- expo-image-picker: ~15.0.0
- expo-av: ~14.0.0
- expo-speech: ~12.0.0
- expo-haptics: ~13.0.0
- expo-status-bar: ~1.12.0
- react-native-reanimated: ~3.10.0
- @shopify/flash-list: 1.6.4
- @expo-google-fonts/cairo: ^0.2.3
- expo-font: ~12.0.0
- @expo/vector-icons: ^14.0.0
- react-native-safe-area-context: 4.10.1
- react-native-screens: 3.31.1
- uuid: ^9.0.0
- @types/uuid: ^9.0.0

Include the standard Expo scripts: start, android, ios, web.
Include devDependencies: typescript ~5.3.0, @types/react ~18.2.0, @babel/core ~7.24.0.

---

## GEMINI TASK 3 — Create tsconfig.json

Create a `tsconfig.json` for a React Native Expo project.
Use strict mode. Extend from "expo/tsconfig.base".
Add path alias: "@/*" maps to "./*"
Target: ES2020. Include: ["**/*.ts", "**/*.tsx"]

---

## GEMINI TASK 4 — Create types/index.ts

Create a TypeScript file at `types/index.ts` with these exact interfaces:

```
Card:
  id: string
  word_arabic: string
  image_path: string | null
  audio_path: string | null
  position: number
  category: Category
  created_at: string

Category: union type of the string literals:
  'people' | 'actions' | 'food' | 'places' | 'feelings' | 'other'

Parent:
  id: 1 | 2
  name: string
  pin_hash: string | null

AudioStatus: union type:
  'none' | 'generating' | 'ready'

SentenceCard: (a card selected for the sentence strip)
  card: Card
  key: string  (unique key for the list, use uuid)
```

Export all types. No default export.

---

## GEMINI TASK 5 — Create constants/categories.ts

Create `constants/categories.ts` with:

1. A const object CATEGORY_COLORS mapping each category to its hex color:
   people → '#FFD700'
   actions → '#4CAF50'
   food → '#FF9800'
   places → '#2196F3'
   feelings → '#F44336'
   other → '#9C27B0'

2. A const object CATEGORY_LABELS_ARABIC mapping each category to its Arabic label:
   people → 'ناس'
   actions → 'أفعال'
   food → 'أكل'
   places → 'أماكن'
   feelings → 'مشاعر'
   other → 'أخرى'

3. A const array CATEGORIES listing all 6 category keys in order.

Import the Category type from '../types'. Type all objects properly.
Export all three constants.

---

## GEMINI TASK 6 — Create constants/defaultCards.ts

Read the file DEFAULT_WORDS.json in the current folder.
Create `constants/defaultCards.ts` that imports the JSON and exports it as
a typed const called DEFAULT_CARDS with type matching the Card interface
from '../types/index.ts' (but without id and created_at — those are assigned at seed time).

The export shape per item should be:
  word_arabic: string
  category: Category
  position: number
  image_path: null
  audio_path: null

Map the JSON array to this shape. Export as DEFAULT_CARDS.

---

## GEMINI TASK 7 — Create folder structure

Create all the empty directories and placeholder index files for this structure.
For each .ts/.tsx file just write a single line comment: "// TODO: implement"

Folders and files to create:
  app/_layout.tsx
  app/index.tsx
  app/setup.tsx
  app/(child)/_layout.tsx
  app/(child)/index.tsx
  app/(parent)/_layout.tsx
  app/(parent)/index.tsx
  app/(parent)/add-card.tsx
  app/(parent)/edit-card.tsx
  app/(parent)/settings.tsx
  components/PecsCard.tsx
  components/SentenceStrip.tsx
  components/SpeakButton.tsx
  components/ClearButton.tsx
  components/PinModal.tsx
  components/AudioStatusBadge.tsx
  components/CategoryPicker.tsx
  services/database.ts
  services/audio.ts
  services/fileStorage.ts
  hooks/useCards.ts
  hooks/useAudio.ts
  hooks/useParentAuth.ts
  assets/placeholders/.gitkeep

---

## GEMINI TASK 8 — Create services/fileStorage.ts

Create `services/fileStorage.ts` with these utility functions (complete implementation, not TODO):

```
ensureAudioDirectory(): Promise<void>
  — creates {documentDirectory}/audio/ if it doesn't exist

ensureImagesDirectory(): Promise<void>
  — creates {documentDirectory}/images/ if it doesn't exist

getAudioPath(cardId: string): string
  — returns {documentDirectory}/audio/{cardId}.mp3

getImagePath(cardId: string): string
  — returns {documentDirectory}/images/{cardId}.jpg

saveImageFromUri(uri: string, cardId: string): Promise<string>
  — copies the picked image URI to the images directory
  — returns the new local path

deleteAudioFile(cardId: string): Promise<void>
  — deletes the MP3 if it exists, ignores error if not found

deleteImageFile(cardId: string): Promise<void>
  — deletes the image if it exists, ignores error if not found
```

Use expo-file-system (FileSystem from 'expo-file-system').
Export all functions. Full implementation required — no placeholders.

---

## GEMINI TASK 9 — Create .gitignore and babel.config.js

Create `.gitignore` for a React Native Expo project.
Include: node_modules, .expo, dist, .env, *.local, ios, android (generated), .DS_Store

Create `babel.config.js`:
```js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

---

## AFTER ALL GEMINI TASKS ARE DONE:

Run these install commands in your terminal:
```bash
npx create-expo-app pecs-misr --template blank-typescript
cd pecs-misr
# Replace app.json, package.json, tsconfig.json, babel.config.js with Gemini's versions
# Copy all generated files into the project
npm install
npx expo install expo-sqlite expo-file-system expo-secure-store expo-crypto expo-image-picker expo-av expo-speech expo-haptics react-native-reanimated @shopify/flash-list @expo-google-fonts/cairo expo-font @expo/vector-icons uuid
```

Then verify:
- [ ] All folders exist
- [ ] types/index.ts has all 5 interfaces
- [ ] constants/categories.ts has correct hex colors
- [ ] DEFAULT_WORDS.json is in the root
- [ ] babel.config.js has reanimated plugin
- [ ] app.json has orientation: "landscape"

Once verified → open Claude Code and use CLAUDE_CODE_PROMPT.md
