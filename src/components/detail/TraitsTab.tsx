import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import type { Breed, NumericTrait } from '../../types';
import { Chip } from '../Chip';
import { TraitScale } from './TraitScale';

// exercise_minutes is not a 1-5 score, so it gets its own scale below.
const SCORED: { key: Exclude<NumericTrait, 'exercise_minutes'>; label: string }[] = [
  { key: 'energy', label: 'Energy' },
  { key: 'trainability', label: 'Trainability' },
  { key: 'barking', label: 'Barking' },
  { key: 'drooling', label: 'Drooling' },
  { key: 'shedding', label: 'Shedding' },
  { key: 'grooming', label: 'Grooming needs' },
  { key: 'apartment_friendly', label: 'Apartment friendly' },
  { key: 'good_with_children', label: 'Good with children' },
  { key: 'good_with_dogs', label: 'Good with dogs' },
  { key: 'good_with_strangers', label: 'Good with strangers' },
];
const EXERCISE_SCALE_MAX_MIN = 120; // bar is full at 2 hours/day

export function TraitsTab({ breed }: { breed: Breed }) {
  const theme = useTheme();
  const minutes = breed.traits.exercise_minutes;
  return (
    <View>
      <Text style={[styles.hint, { color: theme.subtext }]}>Scores run from 1 (low) to 5 (high).</Text>
      {SCORED.map((t) => (
        <TraitScale key={t.key} label={t.label} value={breed.traits[t.key]} />
      ))}
      <TraitScale
        label="Daily exercise"
        value={minutes === undefined ? undefined : Math.min(minutes, EXERCISE_SCALE_MAX_MIN) / (EXERCISE_SCALE_MAX_MIN / 5)}
        valueLabel={minutes === undefined ? undefined : `${minutes} min`}
      />
      <Text style={[styles.h, { color: theme.text }]}>Temperament</Text>
      <View style={styles.wrap}>
        {breed.temperament.length ? (
          breed.temperament.map((t) => <Chip key={t} label={t} />)
        ) : (
          <Text style={{ color: theme.subtext }}>n/a</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 12, marginBottom: 14 },
  h: { fontSize: 15, fontWeight: '700', marginTop: 8, marginBottom: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
});
