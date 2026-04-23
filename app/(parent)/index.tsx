import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useWindowDimensions,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { useCards } from '../../hooks/useCards';
import AudioStatusBadge from '../../components/AudioStatusBadge';
import { Card, AudioStatus } from '../../types';
import { CATEGORY_COLORS } from '../../constants/categories';

export default function ParentIndex() {
  const { cards, loadCards, removeCard } = useCards();
  const db = useSQLiteContext();

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const handleDelete = (card: Card) => {
    Alert.alert(
      'حذف البطاقة',
      `هل تريد حذف بطاقة "${card.word_arabic}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => removeCard(card.id),
        },
      ]
    );
  };

  const getAudioStatus = (card: Card): AudioStatus => {
    return card.audio_path ? 'ready' : 'none';
  };

  return (
    <View style={styles.container}>
      {/* Header buttons */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/(parent)/add-card')}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>إضافة بطاقة</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.childBtn}
          onPress={() => router.replace('/(child)')}
        >
          <MaterialCommunityIcons name="tablet" size={20} color="#1976D2" />
          <Text style={styles.childBtnText}>وضع الطفل</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push('/(parent)/settings')}
        >
          <MaterialCommunityIcons name="cog" size={22} color="#757575" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {cards.map((card) => (
          <View key={card.id} style={[styles.card, { borderColor: CATEGORY_COLORS[card.category] }]}>
            <View style={styles.cardImageContainer}>
              {card.image_path ? (
                <Image source={{ uri: card.image_path }} style={styles.cardImage} />
              ) : (
                <View style={[styles.cardPlaceholder, { backgroundColor: CATEGORY_COLORS[card.category] }]}>
                  <Text style={styles.cardPlaceholderText}>{card.word_arabic.charAt(0)}</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardWord}>{card.word_arabic}</Text>
            <AudioStatusBadge status={getAudioStatus(card)} />
            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/(parent)/edit-card', params: { id: card.id } })}
                style={styles.editBtn}
              >
                <MaterialCommunityIcons name="pencil" size={18} color="#1976D2" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(card)} style={styles.deleteBtn}>
                <MaterialCommunityIcons name="trash-can-outline" size={18} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976D2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  addBtnText: { fontFamily: 'Cairo_700Bold', fontSize: 14, color: '#FFFFFF' },
  childBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1976D2',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  childBtnText: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: '#1976D2' },
  settingsBtn: {
    marginLeft: 'auto',
    padding: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  card: {
    width: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 3,
    padding: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardImageContainer: { width: '100%', height: 100, borderRadius: 8, overflow: 'hidden', marginBottom: 6 },
  cardImage: { width: '100%', height: '100%' },
  cardPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPlaceholderText: { fontFamily: 'Cairo_700Bold', fontSize: 32, color: 'rgba(255,255,255,0.9)' },
  cardWord: {
    fontFamily: 'Cairo_600SemiBold',
    fontSize: 15,
    color: '#212121',
    writingDirection: 'rtl',
    marginBottom: 4,
  },
  cardActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  editBtn: { padding: 6 },
  deleteBtn: { padding: 6 },
});
