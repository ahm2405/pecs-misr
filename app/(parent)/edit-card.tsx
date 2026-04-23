import React, { useState, useEffect } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { Category, AudioStatus } from '../../types';
import { useCards } from '../../hooks/useCards';
import CategoryPicker from '../../components/CategoryPicker';
import AudioStatusBadge from '../../components/AudioStatusBadge';
import { generateAudio } from '../../services/audio';
import { saveImageFromUri, deleteAudioFile } from '../../services/fileStorage';
import { getSetting, getAllCards } from '../../services/database';

export default function EditCard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const { editCard } = useCards();

  const [word, setWord] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [existingImagePath, setExistingImagePath] = useState<string | null>(null);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('none');
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const all = await getAllCards(db);
      const card = all.find((c) => c.id === id);
      if (card) {
        setWord(card.word_arabic);
        setCategory(card.category);
        setExistingImagePath(card.image_path);
        setAudioPath(card.audio_path);
        setAudioStatus(card.audio_path ? 'ready' : 'none');
      }
    };
    load();
  }, [id]);

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

  const handleGenerateAudio = async () => {
    if (!word.trim() || !id) return;
    const apiKey = await getSetting(db, 'elevenlabs_api_key');
    const voiceId = await getSetting(db, 'elevenlabs_voice_id');
    if (!apiKey || !voiceId) {
      Alert.alert('تنبيه', 'يرجى إدخال مفتاح ElevenLabs أولاً في الإعدادات');
      return;
    }
    setAudioStatus('generating');
    await deleteAudioFile(id);
    const path = await generateAudio(word.trim(), id, apiKey, voiceId);
    setAudioPath(path);
    setAudioStatus(path ? 'ready' : 'none');
  };

  const handleSave = async () => {
    if (!word.trim() || !id) return;
    setSaving(true);
    try {
      let finalImagePath: string | null = existingImagePath;
      if (imageUri) {
        finalImagePath = await saveImageFromUri(imageUri, id);
      }
      await editCard(id, {
        word_arabic: word.trim(),
        category,
        image_path: finalImagePath,
        audio_path: audioPath,
      });
      router.back();
    } catch {
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const displayImage = imageUri || existingImagePath;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {displayImage ? (
          <Image source={{ uri: displayImage }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>اضغط لتغيير الصورة</Text>
          </View>
        )}
      </TouchableOpacity>

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

      <Text style={styles.label}>الفئة</Text>
      <CategoryPicker selected={category} onSelect={setCategory} />

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

      <AudioStatusBadge status={audioStatus} />

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveBtnText}>حفظ التغييرات</Text>
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
  },
  generateBtnDisabled: { backgroundColor: '#B0BEC5' },
  generateBtnText: { fontFamily: 'Cairo_700Bold', fontSize: 18, color: '#FFFFFF' },
  saveBtn: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: { backgroundColor: '#A5D6A7' },
  saveBtnText: { fontFamily: 'Cairo_700Bold', fontSize: 18, color: '#FFFFFF' },
});
