import React, { useRef, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { SentenceCard } from '../types';
import { CATEGORY_COLORS } from '../constants/categories';

interface SentenceStripProps {
  cards: SentenceCard[];
}

function MiniCard({ item }: { item: SentenceCard }) {
  const translateX = useSharedValue(60);

  useEffect(() => {
    translateX.value = withSpring(0, { damping: 14, stiffness: 300 });
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const catColor = CATEGORY_COLORS[item.card.category];

  return (
    <Animated.View style={[styles.miniCard, { borderColor: catColor }, style]}>
      {item.card.image_path ? (
        <Image source={{ uri: item.card.image_path }} style={styles.miniImage} />
      ) : (
        <View style={[styles.miniPlaceholder, { backgroundColor: catColor }]}>
          <Text style={styles.miniPlaceholderText}>{item.card.word_arabic.charAt(0)}</Text>
        </View>
      )}
      <Text style={styles.miniLabel} numberOfLines={1}>{item.card.word_arabic}</Text>
    </Animated.View>
  );
}

export default function SentenceStrip({ cards }: SentenceStripProps) {
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (cards.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [cards.length]);

  return (
    <View style={styles.strip}>
      <FlatList
        ref={listRef}
        data={cards}
        horizontal
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => <MiniCard item={item} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>اضغط على بطاقة لإضافتها هنا</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    height: 110,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderTopColor: '#E0E0E0',
  },
  listContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
    flexGrow: 1,
  },
  miniCard: {
    width: 80,
    height: 90,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginHorizontal: 4,
    marginVertical: 10,
  },
  miniImage: {
    width: '100%',
    height: 62,
  },
  miniPlaceholder: {
    width: '100%',
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniPlaceholderText: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 22,
    color: 'rgba(255,255,255,0.9)',
  },
  miniLabel: {
    fontFamily: 'Cairo_600SemiBold',
    fontSize: 11,
    color: '#333333',
    textAlign: 'center',
    writingDirection: 'rtl',
    paddingHorizontal: 2,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 14,
    color: '#BDBDBD',
    writingDirection: 'rtl',
  },
});
