# Audio Setup Guide — Egyptian Arabic TTS

## Why Egyptian Dialect Matters
Standard Arabic (MSA) TTS sounds formal and unnatural to Egyptian children.
ElevenLabs' multilingual model naturally produces Egyptian-accented Arabic when
given Egyptian dialect words (like ماما، مية، عايز). This is the closest to
what children hear at home.

---

## Option 1: ElevenLabs (Recommended — Best Quality)

### Setup Steps
1. Create account at https://elevenlabs.io
2. Go to Profile → API Key → copy your key
3. In the app: Parent Mode → Settings → paste API key
4. Choose a voice (the app will fetch available Arabic voices from the API)

### Finding the Best Egyptian Arabic Voice
In ElevenLabs voice library, search for "Arabic" — look for female voices
labeled Arabic or Egyptian. The voice "Layla" or similar works well.
You can preview voices before selecting.

### API Reference
```
POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}

Headers:
  Content-Type: application/json
  xi-api-key: YOUR_API_KEY

Body:
{
  "text": "ماما",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.75
  }
}

Response: MP3 audio binary
```

### Cost
- Free tier: 10,000 characters/month (enough for ~500 words)
- Starter plan: $5/month for 30,000 characters
- Each word is typically 2–8 characters, so $5/month covers hundreds of new words

### Implementation in the App (services/audio.ts)
```typescript
export async function generateAudioElevenLabs(
  wordArabic: string,
  cardId: string,
  apiKey: string,
  voiceId: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: wordArabic,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!response.ok) throw new Error(`ElevenLabs error: ${response.status}`);

    const audioBlob = await response.blob();
    const audioPath = `${FileSystem.documentDirectory}audio/${cardId}.mp3`;

    // Convert blob to base64 and save
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        await FileSystem.writeAsStringAsync(audioPath, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        resolve(audioPath);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
  } catch (error) {
    console.error('ElevenLabs failed, using fallback', error);
    return null;
  }
}
```

---

## Option 2: Google Cloud TTS (Alternative)

### Voice for Egyptian Arabic
- Language code: `ar-XA`
- Voice name: `ar-XA-Wavenet-A` (female) or `ar-XA-Wavenet-B` (male)
- Note: Google labels this as "Arabic" not specifically Egyptian,
  but Wavenet voices sound natural

### API Call
```
POST https://texttospeech.googleapis.com/v1/text:synthesize?key=YOUR_KEY

Body:
{
  "input": { "text": "ماما" },
  "voice": { "languageCode": "ar-XA", "name": "ar-XA-Wavenet-A" },
  "audioConfig": { "audioEncoding": "MP3", "speakingRate": 0.85 }
}

Response: { "audioContent": "base64-encoded-mp3" }
```

### Cost
- Free tier: 1 million WaveNet characters/month
- Effectively free for this use case

---

## Option 3: expo-speech Fallback (Free, No Key Needed)

Used automatically when ElevenLabs is not configured or fails.

```typescript
import * as Speech from 'expo-speech';

export function speakArabic(text: string) {
  Speech.speak(text, {
    language: 'ar-EG',  // Egyptian Arabic locale
    rate: 0.8,           // Slightly slower for clarity
    pitch: 1.0,
  });
}
```

**Limitation:** Uses the device's built-in TTS engine. Quality varies by device.
On most Android tablets and iPads the Arabic voice is understandable but sounds
robotic compared to ElevenLabs.

---

## Offline Strategy

### First Launch Flow
1. App opens → checks if audio files exist for seed cards
2. If ElevenLabs key is configured: auto-generate all 15 default word MP3s
3. Show progress bar: "جاري تحضير الأصوات... (Preparing audio...)"
4. Once done: all default cards work offline forever

### Per-Card Audio Generation
- When parent adds a new card and taps "Generate Audio":
  - Show spinner on the card
  - Call ElevenLabs API
  - Save MP3 to local filesystem
  - Update card's `audio_path` in SQLite
  - Show green checkmark when done

### File Storage
- Audio files: `{FileSystem.documentDirectory}audio/{cardId}.mp3`
- Images: `{FileSystem.documentDirectory}images/{cardId}.jpg`
- Both survive app updates (documentDirectory is persistent)

### Playback
```typescript
import { Audio } from 'expo-av';

export async function playCardAudio(audioPath: string) {
  const { sound } = await Audio.Sound.createAsync(
    { uri: audioPath },
    { shouldPlay: true }
  );
  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.didJustFinish) sound.unloadAsync();
  });
}
```

---

## Recommended Setup for Healthcare Professional

1. **Purchase ElevenLabs Starter ($5/month)** — one-time setup
2. **Generate audio for all cards before giving tablet to child**
3. **Enable airplane mode on the child's tablet** during sessions
   (all audio is cached, works offline)
4. The child's experience is: tap image → hear Egyptian Arabic word
   with zero internet dependency
