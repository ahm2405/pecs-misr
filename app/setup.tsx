import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useParentAuth } from '../hooks/useParentAuth';
import { getSetting, getAllCards } from '../services/database';
import { preGenerateDefaultAudio } from '../services/audio';
import { updateCard } from '../services/database';

type Step = 'pin-a' | 'pin-b' | 'audio' | 'done';

export default function SetupScreen() {
  const db = useSQLiteContext();
  const { setupPin, markSetupComplete } = useParentAuth();

  const [step, setStep] = useState<Step>('pin-a');
  const [pinA, setPinA] = useState('');
  const [pinB, setPinB] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioTotal, setAudioTotal] = useState(0);
  const [generatingAudio, setGeneratingAudio] = useState(false);

  const handlePinASubmit = () => {
    if (pinA.length !== 4 || !/^\d{4}$/.test(pinA)) {
      Alert.alert('تنبيه', 'يجب أن يكون الرقم السري 4 أرقام');
      return;
    }
    if (pinA !== confirmPin) {
      Alert.alert('تنبيه', 'الرقمان السريان غير متطابقين');
      return;
    }
    setConfirmPin('');
    setStep('pin-b');
  };

  const handlePinBSubmit = async () => {
    if (pinB.length !== 4 || !/^\d{4}$/.test(pinB)) {
      Alert.alert('تنبيه', 'يجب أن يكون الرقم السري 4 أرقام');
      return;
    }
    if (pinB !== confirmPin) {
      Alert.alert('تنبيه', 'الرقمان السريان غير متطابقين');
      return;
    }
    await setupPin(1, pinA);
    await setupPin(2, pinB);
    setStep('audio');
  };

  const handleGenerateAudio = async () => {
    const apiKey = await getSetting(db, 'elevenlabs_api_key');
    const voiceId = await getSetting(db, 'elevenlabs_voice_id');

    if (!apiKey || !voiceId) {
      // Skip audio generation, go straight to child mode
      await markSetupComplete();
      router.replace('/(child)');
      return;
    }

    setGeneratingAudio(true);
    const cards = await getAllCards(db);
    setAudioTotal(cards.length);

    await preGenerateDefaultAudio(apiKey, voiceId, cards, async (done, total) => {
      setAudioProgress(done);
      // Update audio_path in DB for each card after generation
    });

    await markSetupComplete();
    setGeneratingAudio(false);
    router.replace('/(child)');
  };

  const handleSkipAudio = async () => {
    await markSetupComplete();
    router.replace('/(child)');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>PECS مصر</Text>
      <Text style={styles.subtitle}>إعداد التطبيق لأول مرة</Text>

      {step === 'pin-a' && (
        <View style={styles.card}>
          <Text style={styles.stepTitle}>الخطوة 1 من 2</Text>
          <Text style={styles.stepDesc}>إنشاء رقم سري للوالد أ</Text>

          <Text style={styles.fieldLabel}>الرقم السري (4 أرقام)</Text>
          <TextInput
            style={styles.input}
            value={pinA}
            onChangeText={setPinA}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            textAlign="center"
            placeholder="••••"
            placeholderTextColor="#BDBDBD"
          />

          <Text style={styles.fieldLabel}>تأكيد الرقم السري</Text>
          <TextInput
            style={styles.input}
            value={confirmPin}
            onChangeText={setConfirmPin}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            textAlign="center"
            placeholder="••••"
            placeholderTextColor="#BDBDBD"
          />

          <TouchableOpacity style={styles.btn} onPress={handlePinASubmit}>
            <Text style={styles.btnText}>التالي</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'pin-b' && (
        <View style={styles.card}>
          <Text style={styles.stepTitle}>الخطوة 2 من 2</Text>
          <Text style={styles.stepDesc}>إنشاء رقم سري للوالد ب</Text>

          <Text style={styles.fieldLabel}>الرقم السري (4 أرقام)</Text>
          <TextInput
            style={styles.input}
            value={pinB}
            onChangeText={setPinB}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            textAlign="center"
            placeholder="••••"
            placeholderTextColor="#BDBDBD"
          />

          <Text style={styles.fieldLabel}>تأكيد الرقم السري</Text>
          <TextInput
            style={styles.input}
            value={confirmPin}
            onChangeText={setConfirmPin}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            textAlign="center"
            placeholder="••••"
            placeholderTextColor="#BDBDBD"
          />

          <TouchableOpacity style={styles.btn} onPress={handlePinBSubmit}>
            <Text style={styles.btnText}>التالي</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'audio' && (
        <View style={styles.card}>
          <Text style={styles.stepTitle}>تحضير الأصوات</Text>
          <Text style={styles.stepDesc}>
            هل تريد توليد أصوات للبطاقات الافتراضية؟{'\n'}
            (يحتاج إلى مفتاح ElevenLabs واتصال بالإنترنت)
          </Text>

          {generatingAudio ? (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="large" color="#1976D2" />
              <Text style={styles.progressText}>
                جاري تحضير الأصوات... ({audioProgress}/{audioTotal})
              </Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: audioTotal > 0 ? `${(audioProgress / audioTotal) * 100}%` : '0%' },
                  ]}
                />
              </View>
            </View>
          ) : (
            <View style={styles.audioButtons}>
              <TouchableOpacity style={styles.btn} onPress={handleGenerateAudio}>
                <Text style={styles.btnText}>توليد الأصوات</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipBtn} onPress={handleSkipAudio}>
                <Text style={styles.skipBtnText}>تخطي — سأفعل ذلك لاحقاً</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  title: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 32,
    color: '#1976D2',
    writingDirection: 'rtl',
  },
  subtitle: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 16,
    color: '#757575',
    writingDirection: 'rtl',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    gap: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  stepTitle: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 13,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  stepDesc: {
    fontFamily: 'Cairo_600SemiBold',
    fontSize: 18,
    color: '#212121',
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  fieldLabel: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 14,
    color: '#757575',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  input: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    fontFamily: 'Cairo_700Bold',
    fontSize: 24,
    color: '#212121',
    backgroundColor: '#FAFAFA',
    letterSpacing: 8,
  },
  btn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#1976D2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnText: { fontFamily: 'Cairo_700Bold', fontSize: 18, color: '#FFFFFF' },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipBtnText: { fontFamily: 'Cairo_400Regular', fontSize: 14, color: '#9E9E9E' },
  audioButtons: { gap: 8 },
  progressContainer: { alignItems: 'center', gap: 16, paddingVertical: 8 },
  progressText: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 15,
    color: '#424242',
    writingDirection: 'rtl',
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1976D2',
    borderRadius: 4,
  },
});
