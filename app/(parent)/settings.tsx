import React, { useState, useEffect } from 'react';
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
import { useSQLiteContext } from 'expo-sqlite';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getSetting, setSetting } from '../../services/database';
import { useParentAuth } from '../../hooks/useParentAuth';
import { speakFallback } from '../../services/audio';

export default function Settings() {
  const db = useSQLiteContext();
  const { setupPin, isPinSet } = useParentAuth();

  const [apiKey, setApiKey] = useState('');
  const [voiceId, setVoiceId] = useState('');
  const [newPinA, setNewPinA] = useState('');
  const [newPinB, setNewPinB] = useState('');
  const [saving, setSaving] = useState(false);
  const [testingAudio, setTestingAudio] = useState(false);

  useEffect(() => {
    const load = async () => {
      const key = await getSetting(db, 'elevenlabs_api_key');
      const voice = await getSetting(db, 'elevenlabs_voice_id');
      if (key) setApiKey(key);
      if (voice) setVoiceId(voice);
    };
    load();
  }, []);

  const handleSaveKeys = async () => {
    setSaving(true);
    await setSetting(db, 'elevenlabs_api_key', apiKey.trim());
    await setSetting(db, 'elevenlabs_voice_id', voiceId.trim());
    setSaving(false);
    Alert.alert('تم', 'تم حفظ الإعدادات');
  };

  const handleTestAudio = async () => {
    setTestingAudio(true);
    try {
      const key = await getSetting(db, 'elevenlabs_api_key');
      const voice = await getSetting(db, 'elevenlabs_voice_id');
      if (!key || !voice) {
        speakFallback('مرحبا');
      } else {
        const { generateAudio, playAudio } = await import('../../services/audio');
        const path = await generateAudio('مرحبا', 'test-audio', key, voice);
        if (path) await playAudio(path);
        else speakFallback('مرحبا');
      }
    } finally {
      setTestingAudio(false);
    }
  };

  const handleChangePinA = async () => {
    if (newPinA.length !== 4 || !/^\d{4}$/.test(newPinA)) {
      Alert.alert('تنبيه', 'الرقم السري يجب أن يكون 4 أرقام');
      return;
    }
    await setupPin(1, newPinA);
    setNewPinA('');
    Alert.alert('تم', 'تم تغيير رقم سري الوالد أ');
  };

  const handleChangePinB = async () => {
    if (newPinB.length !== 4 || !/^\d{4}$/.test(newPinB)) {
      Alert.alert('تنبيه', 'الرقم السري يجب أن يكون 4 أرقام');
      return;
    }
    await setupPin(2, newPinB);
    setNewPinB('');
    Alert.alert('تم', 'تم تغيير رقم سري الوالد ب');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ElevenLabs section */}
      <Text style={styles.sectionHeader}>إعدادات الصوت (ElevenLabs)</Text>

      <Text style={styles.fieldLabel}>مفتاح API</Text>
      <TextInput
        style={styles.input}
        value={apiKey}
        onChangeText={setApiKey}
        placeholder="sk-..."
        placeholderTextColor="#BDBDBD"
        autoCapitalize="none"
        secureTextEntry
      />

      <Text style={styles.fieldLabel}>معرّف الصوت (Voice ID)</Text>
      <TextInput
        style={styles.input}
        value={voiceId}
        onChangeText={setVoiceId}
        placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
        placeholderTextColor="#BDBDBD"
        autoCapitalize="none"
      />

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.primaryBtn, { flex: 2 }]}
          onPress={handleSaveKeys}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>حفظ</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, { flex: 1 }]}
          onPress={handleTestAudio}
          disabled={testingAudio}
        >
          {testingAudio ? (
            <ActivityIndicator color="#1976D2" />
          ) : (
            <>
              <MaterialCommunityIcons name="microphone" size={16} color="#1976D2" />
              <Text style={styles.secondaryBtnText}>تجربة</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* PIN section */}
      <Text style={styles.sectionHeader}>تغيير الأرقام السرية</Text>

      <Text style={styles.fieldLabel}>رقم سري الوالد أ</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={newPinA}
          onChangeText={setNewPinA}
          placeholder="رقم جديد"
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
          textAlign="right"
          placeholderTextColor="#BDBDBD"
        />
        <TouchableOpacity style={styles.primaryBtn} onPress={handleChangePinA}>
          <Text style={styles.primaryBtnText}>تغيير</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>رقم سري الوالد ب</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={newPinB}
          onChangeText={setNewPinB}
          placeholder="رقم جديد"
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
          textAlign="right"
          placeholderTextColor="#BDBDBD"
        />
        <TouchableOpacity style={styles.primaryBtn} onPress={handleChangePinB}>
          <Text style={styles.primaryBtnText}>تغيير</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 20, gap: 12 },
  sectionHeader: {
    fontFamily: 'Cairo_600SemiBold',
    fontSize: 14,
    color: '#757575',
    writingDirection: 'rtl',
    textAlign: 'right',
    marginTop: 8,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldLabel: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 14,
    color: '#424242',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    fontFamily: 'Cairo_400Regular',
    fontSize: 15,
    color: '#212121',
    backgroundColor: '#FFFFFF',
  },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  primaryBtn: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#1976D2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primaryBtnText: { fontFamily: 'Cairo_700Bold', fontSize: 15, color: '#FFFFFF' },
  secondaryBtn: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#1976D2',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
  },
  secondaryBtnText: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: '#1976D2' },
  divider: { height: 1, backgroundColor: '#EEEEEE', marginVertical: 8 },
});
