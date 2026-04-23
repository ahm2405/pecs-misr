# Design Reference — PECS مصر

## Inspiration
Model the look and feel after the PECS Talk app:
- Bright, friendly, high-contrast colors
- Large images with clear labels underneath
- Clean category color-coding
- Child-friendly rounded corners everywhere
- No clutter — only what the child needs is visible

---

## Color System

### Category Colors (used for card borders and label strips)
```javascript
export const CATEGORY_COLORS = {
  people:   '#FFD700',  // Yellow
  actions:  '#4CAF50',  // Green
  food:     '#FF9800',  // Orange
  places:   '#2196F3',  // Blue
  feelings: '#F44336',  // Red
  other:    '#9C27B0',  // Purple
};

export const CATEGORY_LABELS_ARABIC = {
  people:   'ناس',
  actions:  'أفعال',
  food:     'أكل',
  places:   'أماكن',
  feelings: 'مشاعر',
  other:    'أخرى',
};
```

### App UI Colors
```javascript
export const UI_COLORS = {
  background:       '#F0F4F8',   // Light blue-grey (child mode bg)
  cardBackground:   '#FFFFFF',
  speakButton:      '#4CAF50',   // Green
  clearButton:      '#F44336',   // Red
  sentenceStrip:    '#FFFFFF',
  stripBorder:      '#E0E0E0',
  parentBackground: '#FAFAFA',
  parentAccent:     '#1976D2',   // Blue for parent UI
  pinButton:        '#1976D2',
  pinButtonText:    '#FFFFFF',
  audioNone:        '#BDBDBD',   // Grey
  audioGenerating:  '#FF9800',   // Orange
  audioReady:       '#4CAF50',   // Green
};
```

---

## Typography

### Font: Cairo (Google Fonts)
Install via: `npx expo install @expo-google-fonts/cairo expo-font`

```javascript
import {
  Cairo_400Regular,
  Cairo_600SemiBold,
  Cairo_700Bold,
} from '@expo-google-fonts/cairo';
```

### Text Styles
```javascript
export const TEXT_STYLES = {
  cardLabel: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  sentenceCardLabel: {
    fontFamily: 'Cairo_600SemiBold',
    fontSize: 13,
    color: '#333333',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  parentCardLabel: {
    fontFamily: 'Cairo_600SemiBold',
    fontSize: 16,
    color: '#212121',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  pinDigit: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 32,
    color: '#212121',
  },
  sectionHeader: {
    fontFamily: 'Cairo_600SemiBold',
    fontSize: 14,
    color: '#757575',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
};
```

---

## Component Specs

### PecsCard (Child Mode)
```
Width:  (screenWidth - padding) / 4  [landscape] or /3 [portrait]
Height: width * 1.15
Border radius: 16px
Border: 4px solid [category color]
Shadow: elevation 3 (Android) / shadowOpacity 0.15 (iOS)

Layout:
┌─────────────────┐
│                 │
│   [IMAGE]       │  ← 70% of card height, object-fit: cover
│                 │
├─────────────────┤
│   Arabic Label  │  ← 30% height, category color bg, white bold text
└─────────────────┘

Press effect: scale to 0.95 with 100ms spring animation
After press: brief glow/highlight on border
```

### SentenceStrip Card (mini version)
```
Width:  80px
Height: 90px
Border radius: 10px
Border: 2px solid [category color]
Label: 12px, below image, dark text
```

### SpeakButton
```
Size: 72px × 72px circle
Color: #4CAF50
Icon: microphone (white, 32px)
Shadow: elevation 6
Position: absolute, bottom 16px, right 16px
Press animation: scale 0.92 with spring
While speaking: pulse animation (scale 1.0 → 1.08 → 1.0, repeat)
```

### ClearButton
```
Size: 44px × 44px circle
Color: #F44336
Icon: X (white, 20px)
Position: absolute, bottom 28px, left 16px
```

### PinModal
```
Background overlay: rgba(0,0,0,0.6)
Card: white, 320px wide, 24px border radius, centered
PIN display: 4 large dot indicators (filled = entered, empty = remaining)
Numpad: 3×4 grid of round buttons (0-9, backspace, confirm)
Button size: 64px circle
Button color: #F5F5F5, active: #E3F2FD
Font: Cairo_700Bold, 28px for digits
```

### Parent Add Card Screen
```
Image picker box:
  Size: 150×150px, centered
  Border: 2px dashed #BDBDBD
  Border radius: 12px
  Shows preview after selection
  Tap to open camera/gallery picker

Text input (Arabic word):
  Height: 56px
  Border radius: 8px
  Font: Cairo_400Regular, 18px
  textAlign: 'right'
  direction: 'rtl'
  placeholder: 'اكتب الكلمة هنا...'

Category picker:
  Horizontal scrollable row of color pills
  Each pill: category color bg, white Arabic label, 12px Cairo
  Selected: border 2px white + shadow

Generate Audio button:
  Full width, height 52px, border radius 12px
  Color: #1976D2
  Text: 'توليد الصوت 🎙' (Cairo_700Bold, white, 18px)
  Disabled when no word typed

Audio status below button:
  Grey dot + 'لا يوجد صوت' = no audio
  Orange spinner + 'جاري التوليد...' = generating
  Green check + 'الصوت جاهز ✓' = ready
```

---

## Animations

### Card Tap (Child Mode)
```javascript
// Quick scale down + up to give tactile feedback
Animated.sequence([
  Animated.spring(scaleAnim, { toValue: 0.93, useNativeDriver: true }),
  Animated.spring(scaleAnim, { toValue: 1.0, useNativeDriver: true }),
])
```

### Sentence Strip Card Appear
```javascript
// Slide in from right as card is added
Animated.spring(translateX, {
  fromValue: 60,
  toValue: 0,
  useNativeDriver: true,
})
```

### Speak Button Pulse
```javascript
// While audio is playing
Animated.loop(
  Animated.sequence([
    Animated.timing(pulse, { toValue: 1.1, duration: 400 }),
    Animated.timing(pulse, { toValue: 1.0, duration: 400 }),
  ])
)
```

---

## Layout Grid

### Child Mode (Tablet Landscape 1024px wide)
```
Screen padding: 12px
Card gap: 10px
Columns: 4
Card width: (1024 - 24 - 30) / 4 = ~242px
Card height: 242 × 1.15 = ~278px
Sentence strip height: 110px
Bottom safe area: 16px
```

### Child Mode (Tablet Portrait 768px wide)
```
Columns: 3
Card width: (768 - 24 - 20) / 3 = ~241px
```

---

## Iconography
Use `@expo/vector-icons` — specifically `MaterialCommunityIcons`:
- Speak button: `microphone`
- Clear button: `close`
- Add card: `plus`
- Edit: `pencil`
- Delete: `trash-can-outline`
- Settings: `cog`
- Back to child: `tablet`
- Audio ready: `check-circle`
- Audio generating: `loading` (with rotation animation)
- Audio none: `volume-off`

---

## RTL Considerations
- Wrap all parent screens in: `I18nManager.forceRTL(true)` on first launch
- Or apply per-component: `flexDirection: 'row-reverse'` for horizontal layouts
- Arabic text inputs: `textAlign: 'right'`, `writingDirection: 'rtl'`
- The card grid itself is LTR (left-to-right reading order for grid is fine for PECS)
- Sentence strip: LTR order (first tapped = leftmost)
