import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ClearButtonProps {
  onPress: () => void;
}

export default function ClearButton({ onPress }: ClearButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
      <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 28,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F44336',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});
