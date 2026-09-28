import FastImage from '@d11/react-native-fast-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import type { Breed, Range } from '../../types';
import { Chip } from '../Chip';

const range = (r: Range | null, unit: string): string =>
  r ? `${r.min}–${r.max} ${unit}` : 'n/a';

function Fact({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.fact}>
      <Text style={[styles.factLabel, { color: theme.subtext }]}>{label}</Text>
      <Text style={[styles.factValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

export function OverviewTab({ breed, groupName }: { breed: Breed; groupName: string | null }) {
  const theme = useTheme();
  const hero = breed.images[0]?.medium; // medium (600px) here; large only in the gallery
  const origin = [breed.origin.country, breed.origin.region, breed.origin.era].filter(Boolean).join(' · ');

  return (
    <View>
      {hero ? (
        <FastImage
          style={styles.hero}
          source={{ uri: hero, cache: FastImage.cacheControl.immutable }}
          resizeMode={FastImage.resizeMode.cover}
          accessibilityLabel={`Photo of ${breed.name}`}
        />
      ) : null}
      {groupName ? <Chip label={groupName} /> : null}
      <Text style={[styles.desc, { color: theme.text }]}>{breed.description || 'No description available.'}</Text>

      <Fact label="Life span" value={range(breed.life, 'years')} />
      <Fact label="Weight (male)" value={range(breed.maleWeight, 'kg')} />
      <Fact label="Weight (female)" value={range(breed.femaleWeight, 'kg')} />
      <Fact label="Height (male)" value={range(breed.maleHeight, 'cm')} />
      <Fact label="Height (female)" value={range(breed.femaleHeight, 'cm')} />
      <Fact label="Origin" value={origin || 'n/a'} />
      <Fact label="Coat" value={[breed.coatLength, breed.coatType].filter(Boolean).join(', ') || 'n/a'} />
      <Fact label="Hypoallergenic" value={breed.hypoallergenic === null ? 'n/a' : breed.hypoallergenic ? 'Yes' : 'No'} />
      <Fact label="Also known as" value={breed.otherNames.join(', ') || 'n/a'} />

      <Text style={[styles.h, { color: theme.text }]}>Recognized by</Text>
      <View style={styles.wrap}>
        {breed.recognizedBy.length ? breed.recognizedBy.map((k) => <Chip key={k} label={k} />) : <Text style={{ color: theme.subtext }}>n/a</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 220, borderRadius: 14, marginBottom: 14 },
  desc: { fontSize: 15, lineHeight: 22, marginVertical: 12 },
  fact: { flexDirection: 'row', paddingVertical: 8 },
  factLabel: { width: 120, fontSize: 13 },
  factValue: { flex: 1, fontSize: 14, fontWeight: '500' },
  h: { fontSize: 15, fontWeight: '700', marginTop: 14, marginBottom: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
});
