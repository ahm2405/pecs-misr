import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';

import { Category, AudioStatus } from '../../types';
import { useCards } from '../../hooks/useCards';
import CategoryPicker from '../../components/CategoryPicker';
import AudioStatusBadge from '../../components/AudioStatusBadge';
import { generateAudio } from '../../services/audio';
import { saveImageFromUri } from '../../services/fileStorage';
import { getSetting } from '../../services/database';

export default function AddCard() {
  const db = useSQLiteContext();
  const { createCard } = useCards();

  const [word, setWord] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('none');
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [cardId] = useState(() => uuidv4());

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleGenerateAudio = async () => {
    if (!word.trim()) return;
    const apiKey = await getSetting(db, 'elevenlabs_api_key');
    const voiceId = await getSetting(db, 'elevenlabs_voice_id');
    if (!apiKey || !voiceId) {
      Alert.alert('تنبيه', 'يرجى إدخال مفتاح ElevenLabs أولاً في الإعدادات');
      return;
    }
    setAudioStatus('generating');
    const path = await generateAudio(word.trim(), cardId, apiKey, voiceId);
    setAudioPath(path);
    setAudioStatus(path ? 'ready' : 'none');
    if (!path) Alert.alert('خطأ', 'فشل توليد الصوت. تأكد من الاتصال بالإنترنت والمفتاح الصحيح.');
  };

  const handleSave = async () => {
    if (!word.trim()) {
      Alert.alert('تنبيه', 'يرجى كتابة الكلمة أولاً');
      return;
    }
    setSaving(true);
    try {
      let finalImagePath: string | null = null;
      if (imageUri) {
        finalImagePath = await saveImageFromUri(imageUri, cardId);
      }
      await createCard({
        id: cardId,
        word_arabic: word.trim(),
        image_path: finalImagePath,
        audio_path: audioPath,
        position: Date.now(),
        category,
      });
      router.back();
    } catch (e) {
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Image picker */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>اضغط لاختيار صورة</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.imageActions}>
        <TouchableOpacity style={styles.imgBtn} onPress={pickImage}>
          <Text style={styles.imgBtnText}>من المعرض</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.imgBtn} onPress={takePhoto}>
          <Text style={styles.imgBtnText}>كاميرا</Text>
        </TouchableOpacity>
      </View>

      {/* Word input */}
      <Text style={styles.label}>الكلمة بالعربي</Text>
      <TextInput
        style={styles.input}
        value={word}
        onChangeText={setWord}
        placeholder="اكتب الكلمة هنا..."
        textAlign="right"
        writingDirection="rtl"
        placeholderTextColor="#BDBDBD"
      />

      {/* Category picker */}
      <Text style={styles.label}>الفئة</Text>
      <CategoryPicker selected={category} onSelect={setCategory} />

      {/* Generate audio */}
      <TouchableOpacity
        style={[styles.generateBtn, !word.trim() && styles.generateBtnDisabled]}
        onPress={handleGenerateAudio}
        disabled={!word.trim() || audioStatus === 'generating'}
      >
        {audioStatus === 'generating' ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.generateBtnText}>توليد الصوت 🎙</Text>
        )}
      </TouchableOpacity>

      <View style={styles.audioStatusRow}>
        <AudioStatusBadge status={audioStatus} />
      </View>

      {/* Save */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveBtnText}>حفظ البطاقة</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 20, alignItems: 'center', gap: 14 },
  imagePicker: {
    width: 150,
    height: 150,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  imagePlaceholderText: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 13,
    color: '#9E9E9E',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  imageActions: { flexDirection: 'row', gap: 10 },
  imgBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  imgBtnText: { fontFamily: 'Cairo_600SemiBold', fontSize: 13, color: '#1976D2' },
  label: {
    fontFamily: 'Cairo_600SemiBold',
    fontSize: 14,
    color: '#757575',
    writingDirection: 'rtl',
    alignSelf: 'flex-end',
    width: '100%',
  },
  input: {
    width: '100%',
    height: 56,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    fontFamily: 'Cairo_400Regular',
    fontSize: 18,
    color: '#212121',
    backgroundColor: '#FFFFFF',
  },
  generateBtn: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    backgroundColor: '#1976D2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  generateBtnDisabled: { backgroundColor: '#B0BEC5' },
  generateBtnText: { fontFamily: 'Cairo_700Bold', fontSize: 18, color: '#FFFFFF' },
  audioStatusRow: { alignSelf: 'center' },
  saveBtn: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: { backgroundColor: '#A5D6A7' },
  saveBtnText: { fontFamily: 'Cairo_700Bold', fontSize: 18, color: '#FFFFFF' },
});
