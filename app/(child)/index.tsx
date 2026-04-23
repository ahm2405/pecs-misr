import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';
import PecsCard from '../../components/PecsCard';
import SentenceStrip from '../../components/SentenceStrip';
import SpeakButton from '../../components/SpeakButton';
import ClearButton from '../../components/ClearButton';
import PinModal from '../../components/PinModal';

import { Card, SentenceCard } from '../../types';
import { useCards } from '../../hooks/useCards';
import { useAudio } from '../../hooks/useAudio';
import { useParentAuth } from '../../hooks/useParentAuth';
import { playCardAudio } from '../../services/audio';

const STRIP_HEIGHT = 110;

export default function ChildScreen() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const numCols = isLandscape ? 4 : 3;

  const { cards, loadCards } = useCards();
  const { isPlaying, playAll } = useAudio();
  const { verifyPin } = useParentAuth();

  const [sentence, setSentence] = useState<SentenceCard[]>([]);
  const [pinVisible, setPinVisible] = useState(false);
  const [pinParentId] = useState<1 | 2>(1);
  const [pinError, setPinError] = useState(false);
  const wrongAttemptsRef = useRef(0);
  const pinModalRef = useRef<any>(null);

  // Five-finger long press tracking
  const touchCountRef = useRef(0);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const padding = 12;
  const gap = 10;
  const cardWidth = Math.floor((width - padding * 2 - gap * (numCols - 1)) / numCols);

  const handleCardPress = useCallback(async (card: Card) => {
    setSentence((prev) => [...prev, { card, key: uuidv4() }]);
    // silent play — never show errors to child
    try {
      await playCardAudio(card);
    } catch {
      // silent
    }
  }, []);

  const handleSpeak = useCallback(() => {
    playAll(sentence.map((s) => s.card));
  }, [sentence, playAll]);

  const handleClear = useCallback(() => {
    setSentence([]);
  }, []);

  const handlePinSubmit = useCallback(async (pin: string) => {
    // Try parent 1 first, then parent 2
    const ok1 = await verifyPin(1, pin);
    const ok2 = !ok1 && await verifyPin(2, pin);
    if (ok1 || ok2) {
      setPinVisible(false);
      wrongAttemptsRef.current = 0;
      router.replace('/(parent)');
    } else {
      wrongAttemptsRef.current += 1;
      if (wrongAttemptsRef.current >= 3) {
        wrongAttemptsRef.current = 0;
        setPinVisible(false);
      }
      // Signal wrong to modal via key change or callback
      setPinError(true);
      setTimeout(() => setPinError(false), 100);
    }
  }, [verifyPin]);

  const handleTouchStart = useCallback(() => {
    touchCountRef.current += 1;
    if (touchCountRef.current >= 5) {
      holdTimerRef.current = setTimeout(() => {
        setPinVisible(true);
      }, 3000);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchCountRef.current = Math.max(0, touchCountRef.current - 1);
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  return (
    <>
      <StatusBar hidden />
      <View
        style={styles.container}
        onStartShouldSetResponder={() => true}
        onResponderGrant={handleTouchStart}
        onResponderRelease={handleTouchEnd}
      >
        <View style={[styles.grid, { paddingHorizontal: padding }]}>
          <FlashList
            data={cards}
            numColumns={numCols}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PecsCard card={item} size={cardWidth} onPress={handleCardPress} />
            )}
            estimatedItemSize={cardWidth * 1.15}
            contentContainerStyle={{ paddingVertical: padding, paddingBottom: STRIP_HEIGHT + 16 }}
          />
        </View>

        <View style={styles.stripContainer}>
          <SentenceStrip cards={sentence} />
        </View>

        <SpeakButton onPress={handleSpeak} isSpeaking={isPlaying} />
        <ClearButton onPress={handleClear} />

        <PinModal
          key={pinError ? 'error' : 'normal'}
          visible={pinVisible}
          parentName="وضع الوالدين"
          onSubmit={handlePinSubmit}
          onCancel={() => setPinVisible(false)}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  grid: {
    flex: 1,
  },
  stripContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
