# PECS مصر — Product Requirements Document

## Overview
A PECS (Picture Exchange Communication System) app for children with communication needs,
in Egyptian Arabic dialect. Built with React Native (Expo) for iPad and Android tablet.

---

## Two Modes

### 1. Parent / Guardian Mode (PIN-protected)
- Two parent accounts: **Parent A** and **Parent B**
- Each parent has their own 4-digit PIN
- Both parents share ONE child board (same SQLite database on device)
- Accessible by holding 5 fingers on screen for 3 seconds from child mode

### 2. Child Mode (full-screen, distraction-free)
- Launches by default on app open
- No visible exit button
- Large tap targets, bright colors, Arabic labels under every image

---

## Parent Features

### Authentication
- 4-digit PIN per parent (hashed with SHA-256 via expo-crypto)
- Stored securely in expo-secure-store
- First launch: prompt both parents to set their PINs before using the app

### Board Management
- View all cards in a scrollable grid
- **Add a card:**
  1. Type the Arabic word (Egyptian dialect)
  2. Pick image from gallery OR take photo with camera (expo-image-picker)
  3. Select category: people / actions / food / places / feelings / other
  4. Tap "Generate Audio" → calls ElevenLabs API → saves MP3 locally
  5. Audio status icon: grey = no audio, orange spinner = generating, green check = ready
- Edit existing card (word, image, category)
- Delete card (with confirmation dialog)
- Drag to reorder cards (react-native-reanimated)
- "Switch to Child Mode" button visible at top

### Settings Screen
- Enter / update ElevenLabs API key
- Select ElevenLabs voice (show list fetched from API)
- Change Parent A PIN
- Change Parent B PIN

---

## Child Features

### Main Grid Screen
- Full-screen card grid
- 4 columns on tablet landscape, 3 columns on portrait
- Minimum card size: 140×160px
- Each card: image fills top 70%, Arabic label strip at bottom 30%
- Card border (4px) matches category color
- Tap a card → plays its MP3 audio AND adds it to the sentence strip

### Sentence Strip (bottom bar)
- Fixed 100px tall bar at bottom of screen
- Horizontally scrollable row of selected cards (small thumbnails)
- Cards appear in the order they were tapped
- "Clear" button (red X icon) on the bottom left

### Speak Button
- Large (72px) green circle button, bottom right corner
- On press: plays each card's audio in sequence with 300ms gap between words
- Visual feedback: pulses while speaking

### Exit to Parent Mode (hidden)
- Hold 5 fingers simultaneously on screen for 3 seconds
- Then shows PIN entry modal overlay
- Correct PIN → navigate to Parent Mode

---

## Audio System

### Primary: ElevenLabs API
- Endpoint: `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`
- Model: `eleven_multilingual_v2`
- Recommended voice: search ElevenLabs voice library for Egyptian Arabic female voices
- Request body:
  ```json
  {
    "text": "Arabic word here",
    "model_id": "eleven_multilingual_v2",
    "voice_settings": { "stability": 0.5, "similarity_boost": 0.75 }
  }
  ```
- Response is MP3 binary → save via expo-file-system to `{documentDirectory}/audio/{card_id}.mp3`

### Fallback: expo-speech
- Used when ElevenLabs unavailable or API key not configured
- `Speech.speak(word, { language: 'ar-EG', rate: 0.8 })`

### Offline Strategy
- All generated audio cached as local MP3 files
- On first launch: pre-generate audio for all 15 default seed words
- App functions fully offline after first-time audio generation
- Show loading spinner overlay on card while audio generates

---

## Database Schema (expo-sqlite)

### Table: cards
```sql
CREATE TABLE cards (
  id TEXT PRIMARY KEY,
  word_arabic TEXT NOT NULL,
  image_path TEXT,
  audio_path TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'other',
  created_at TEXT NOT NULL
);
```

### Table: parents
```sql
CREATE TABLE parents (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  pin_hash TEXT
);
-- Seed: INSERT INTO parents VALUES (1, 'الوالد أ', null), (2, 'الوالد ب', null);
```

### Table: settings
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
-- Keys used: 'elevenlabs_api_key', 'elevenlabs_voice_id', 'setup_complete'
```

---

## Seed Data (15 default cards)

| Arabic | Category |
|--------|----------|
| ماما | people |
| بابا | people |
| عايز / عايزة | actions |
| مش عايز | actions |
| أكل | food |
| عصير | food |
| مية | food |
| حمام | places |
| بيت | places |
| مدرسة | places |
| كويس | feelings |
| مش كويس | feelings |
| زعلان | feelings |
| العب | actions |
| نام | actions |

Default images: use colored placeholder squares with first letter until parent uploads real images.

---

## Design

### Category Colors
| Category | Arabic | Hex |
|----------|--------|-----|
| people | ناس | #FFD700 |
| actions | أفعال | #4CAF50 |
| food | أكل | #FF9800 |
| places | أماكن | #2196F3 |
| feelings | مشاعر | #F44336 |
| other | أخرى | #9C27B0 |

### Fonts
- Arabic text: **Cairo** (expo-google-fonts)
- All Arabic: `writingDirection: 'rtl'`, `textAlign: 'right'`

### Child Mode UI
- Background: #F0F4F8
- Card: white bg, 16px radius, 4px category-color border, subtle shadow
- Label strip: category color bg, white Cairo bold text, 18px
- Sentence strip: white bg, top border 2px #DDD
- Speak button: #4CAF50, white microphone icon, 72px circle
- Clear button: #F44336, white X icon, 40px circle

### Parent Mode UI
- Clean, minimal — similar to iOS Settings aesthetic
- Add Card screen: image preview box (150×150), text input, category picker, generate button
- Audio status: use colored badge next to each card in list

---

## Screen / File Structure for Claude Code

```
/app
  _layout.tsx          — root navigator, mode switching logic
  index.tsx            — entry: check setup → route to child or parent

/app/(child)
  index.tsx            — full screen child grid + sentence strip

/app/(parent)
  _layout.tsx          — stack navigator
  index.tsx            — card management grid
  add-card.tsx         — add new card screen
  edit-card.tsx        — edit existing card
  settings.tsx         — API key, voice, PIN management

/components
  PecsCard.tsx         — single card component (child mode)
  SentenceStrip.tsx    — bottom strip component
  SpeakButton.tsx      — green speak circle
  PinModal.tsx         — PIN entry overlay
  AudioStatusBadge.tsx — grey/orange/green audio indicator

/services
  database.ts          — SQLite init, CRUD operations
  audio.ts             — ElevenLabs API call + expo-speech fallback
  storage.ts           — file system helpers

/constants
  categories.ts        — category names, colors, Arabic labels
  defaultCards.ts      — 15 seed word definitions
```

---

## V1 Build Order
1. Database init + seed
2. Child grid screen (static, no audio yet)
3. Audio playback service
4. Sentence strip + speak button
5. PIN modal + parent/child mode switching
6. Parent card list screen
7. Add card + ElevenLabs audio generation
8. Settings screen (API key entry)
9. Polish: animations, loading states, RTL fixes
