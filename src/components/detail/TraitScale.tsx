import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';

type Props = { label: string; value: number | undefined; max?: number; valueLabel?: string };

/** A row of segments (5 by default) filled up to `value`, instead of a raw number table. */
export function TraitScale({ label, value, max = 5, valueLabel }: Props) {
  const theme = useTheme();
  const has = value !== undefined;
  const filled = has ? Math.max(0, Math.min(max, Math.round(value))) : 0;
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={has ? `${label}: ${valueLabel ?? `${value} out of ${max}`}` : `${label}: not available`}>
      <View style={styles.labels}>
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.value, { color: theme.subtext }]}>{has ? valueLabel ?? `${value}/${max}` : 'n/a'}</Text>
      </View>
      <View style={styles.bar}>
        {Array.from({ length: max }, (_, i) => (
          <View key={i} style={[styles.seg, { backgroundColor: i < filled ? theme.primary : theme.scaleOff }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 14 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 14, fontWeight: '600' },
  value: { fontSize: 13 },
  bar: { flexDirection: 'row' },
  seg: { flex: 1, height: 8, borderRadius: 4, marginRight: 4 },
});
