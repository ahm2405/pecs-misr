import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Card } from '../types';
import { CATEGORY_COLORS } from '../constants/categories';

interface PecsCardProps {
  card: Card;
  size: number;
  onPress: (card: Card) => void;
}

export default function PecsCard({ card, size, onPress }: PecsCardProps) {
  const scale = useSharedValue(1);
  const categoryColor = CATEGORY_COLORS[card.category];
  const cardHeight = size * 1.15;
  const imageHeight = cardHeight * 0.7;
  const labelHeight = cardHeight * 0.3;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.93, { damping: 15, stiffness: 400 });
    })
    .onFinalize(() => {
      scale.value = withSpring(1.0, { damping: 15, stiffness: 300 });
    })
    .onEnd(() => {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress(card);
    });

  const firstLetter = card.word_arabic.charAt(0);

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[
          styles.card,
          animatedStyle,
          {
            width: size,
            height: cardHeight,
            borderColor: categoryColor,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
              },
              android: { elevation: 3 },
            }),
          },
        ]}
      >
        <View style={[styles.imageContainer, { height: imageHeight }]}>
          {card.image_path ? (
            <Image
              source={{ uri: card.image_path }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.placeholder, { backgroundColor: categoryColor }]}>
              <Text style={styles.placeholderLetter}>{firstLetter}</Text>
            </View>
          )}
        </View>
        <View style={[styles.label, { height: labelHeight, backgroundColor: categoryColor }]}>
          <Text style={styles.labelText} numberOfLines={1}>
            {card.word_arabic}
          </Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 4,
    overflow: 'hidden',
    margin: 5,
  },
  imageContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderLetter: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 48,
    color: 'rgba(255,255,255,0.9)',
  },
  label: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  labelText: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
