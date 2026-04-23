import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PinModalProps {
  visible: boolean;
  parentName: string;
  onSubmit: (pin: string) => void;
  onCancel: () => void;
}

const NUMPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'backspace'],
];

export default function PinModal({ visible, parentName, onSubmit, onCancel }: PinModalProps) {
  const [digits, setDigits] = useState<string[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      setDigits([]);
      setWrongAttempts(0);
    }
  }, [visible]);

  const shake = () => {
    shakeX.value = withSequence(
      withTiming(-12, { duration: 60 }),
      withTiming(12, { duration: 60 }),
      withTiming(-10, { duration: 60 }),
      withTiming(10, { duration: 60 }),
      withTiming(-6, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const handleDigit = (d: string) => {
    if (digits.length >= 4) return;
    const next = [...digits, d];
    setDigits(next);
    if (next.length === 4) {
      onSubmit(next.join(''));
    }
  };

  const handleBackspace = () => {
    setDigits((prev) => prev.slice(0, -1));
  };

  // Called by parent when PIN is wrong
  const triggerWrong = () => {
    const attempts = wrongAttempts + 1;
    setWrongAttempts(attempts);
    shake();
    setTimeout(() => setDigits([]), 400);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Text style={styles.title}>{parentName}</Text>
          <Text style={styles.subtitle}>أدخل الرقم السري</Text>

          {/* Dot indicators */}
          <View style={styles.dots}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[styles.dot, i < digits.length && styles.dotFilled]}
              />
            ))}
          </View>

          {/* Numpad */}
          <View style={styles.numpad}>
            {NUMPAD.map((row, ri) => (
              <View key={ri} style={styles.row}>
                {row.map((key, ki) => {
                  if (key === '') {
                    return <View key={ki} style={styles.emptyKey} />;
                  }
                  if (key === 'backspace') {
                    return (
                      <TouchableOpacity
                        key={ki}
                        style={styles.key}
                        onPress={handleBackspace}
                        activeOpacity={0.7}
                      >
                        <MaterialCommunityIcons name="backspace-outline" size={24} color="#424242" />
                      </TouchableOpacity>
                    );
                  }
                  return (
                    <TouchableOpacity
                      key={ki}
                      style={styles.key}
                      onPress={() => handleDigit(key)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.keyText}>{key}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>إلغاء</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
  title: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 22,
    color: '#212121',
    writingDirection: 'rtl',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 15,
    color: '#757575',
    writingDirection: 'rtl',
    marginBottom: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1976D2',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#1976D2',
  },
  numpad: {
    gap: 12,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  key: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyKey: {
    width: 64,
    height: 64,
  },
  keyText: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 28,
    color: '#212121',
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  cancelText: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 15,
    color: '#757575',
    writingDirection: 'rtl',
  },
});
