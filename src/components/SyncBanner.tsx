import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNow } from '../hooks/useNow';
import { useTheme } from '../theme';
import { formatAgo } from '../utils/time';

type Props = {
  isOffline: boolean;
  syncing: boolean;
  error: string | null;
  lastSyncedAt: number | null;
  onRetry: () => void;
};

export function SyncBanner({ isOffline, syncing, error, lastSyncedAt, onRetry }: Props) {
  const theme = useTheme();
  const now = useNow();
  const ago = `Last synced ${formatAgo(lastSyncedAt, now)}`;

  let text = ago;
  let color = theme.subtext;
  if (isOffline) {
    text = `Offline - showing saved data. ${ago}`;
    color = theme.warn;
  } else if (syncing) {
    text = 'Syncing...';
  } else if (error) {
    text = error;
    color = theme.danger;
  }

  return (
    <View style={[styles.bar, { borderColor: theme.border, backgroundColor: theme.card }]} accessibilityLiveRegion="polite">
      <Text style={[styles.text, { color }]} numberOfLines={2}>
        {text}
      </Text>
      {error && !syncing && !isOffline ? (
        <Pressable onPress={onRetry} accessibilityRole="button" accessibilityLabel="Retry sync">
          <Text style={[styles.retry, { color: theme.primary }]}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  text: { flex: 1, fontSize: 12 },
  retry: { fontSize: 13, fontWeight: '700', marginLeft: 12 },
});
