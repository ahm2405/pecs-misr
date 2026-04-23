import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AudioStatus } from '../types';

interface AudioStatusBadgeProps {
  status: AudioStatus;
}

export default function AudioStatusBadge({ status }: AudioStatusBadgeProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (status === 'generating') {
      rotation.value = withRepeat(withTiming(360, { duration: 1000 }), -1, false);
    } else {
      cancelAnimation(rotation);
      rotation.value = 0;
    }
  }, [status]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  if (status === 'none') {
    return (
      <View style={styles.row}>
        <MaterialCommunityIcons name="volume-off" size={16} color="#BDBDBD" />
        <Text style={[styles.text, { color: '#BDBDBD' }]}>لا يوجد صوت</Text>
      </View>
    );
  }

  if (status === 'generating') {
    return (
      <View style={styles.row}>
        <Animated.View style={spinStyle}>
          <MaterialCommunityIcons name="loading" size={16} color="#FF9800" />
        </Animated.View>
        <Text style={[styles.text, { color: '#FF9800' }]}>جاري التوليد...</Text>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
      <Text style={[styles.text, { color: '#4CAF50' }]}>الصوت جاهز ✓</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 13,
    writingDirection: 'rtl',
  },
});
