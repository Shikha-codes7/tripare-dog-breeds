import FastImage from '@d11/react-native-fast-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';
import type { Breed } from '../types';

export const ROW_HEIGHT = 76;

type Props = { breed: Breed; onPress: (breed: Breed) => void };

function subtitle(b: Breed): string {
  const parts = [b.sizeBand, b.coatLength ? `${b.coatLength} coat` : null, b.temperament[0]];
  return parts.filter(Boolean).join(' · ');
}

// Rows are heavy in *data* (traits, images, coat...) but light in *view tree*:
// the row reads only four fields, has a fixed height, and is memoized, so
// scrolling cost stays flat regardless of how rich each record is.
function BreedRowBase({ breed, onPress }: Props) {
  const theme = useTheme();
  const thumb = breed.images[0]?.thumb;
  return (
    <Pressable
      onPress={() => onPress(breed)}
      style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}
      accessibilityRole="button"
      accessibilityLabel={`${breed.name}. ${subtitle(breed)}`}>
      {thumb ? (
        <FastImage
          style={styles.thumb}
          source={{ uri: thumb, priority: FastImage.priority.normal, cache: FastImage.cacheControl.immutable }}
          resizeMode={FastImage.resizeMode.cover}
          accessible={false}
        />
      ) : (
        <View style={[styles.thumb, styles.placeholder, { backgroundColor: theme.chip }]}>
          <Text style={styles.emoji}>🐕</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
          {breed.name}
        </Text>
        <Text style={[styles.sub, { color: theme.subtext }]} numberOfLines={1}>
          {subtitle(breed) || 'No details yet'}
        </Text>
      </View>
      <Text style={[styles.chev, { color: theme.subtext }]}>›</Text>
    </Pressable>
  );
}

export const BreedRow = React.memo(BreedRowBase);

const styles = StyleSheet.create({
  row: { height: ROW_HEIGHT, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  thumb: { width: 52, height: 52, borderRadius: 10 },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 24 },
  info: { flex: 1, marginLeft: 14 },
  name: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 13, marginTop: 3 },
  chev: { fontSize: 24, marginLeft: 8 },
});
