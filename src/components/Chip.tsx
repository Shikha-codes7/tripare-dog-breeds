import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';

type Props = { label: string; selected?: boolean; onPress?: () => void };

export function Chip({ label, selected = false, onPress }: Props) {
  const theme = useTheme();
  const style = [styles.chip, { backgroundColor: selected ? theme.primary : theme.chip }];
  const body = (
    <Text style={[styles.text, { color: selected ? theme.onPrimary : theme.text }]}>{label}</Text>
  );
  if (!onPress) return <View style={style}>{body}</View>;
  return (
    <Pressable
      onPress={onPress}
      style={style}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, marginRight: 8, marginBottom: 8 },
  text: { fontSize: 13, fontWeight: '500' },
});
