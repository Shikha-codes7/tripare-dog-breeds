import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Filters, TRAIT_THRESHOLD, toggle } from '../filters';
import { useTheme } from '../theme';
import type { CoatLength, GoodWithTrait, Group, SizeBand } from '../types';
import { Chip } from './Chip';

const SIZES: SizeBand[] = ['small', 'medium', 'large', 'giant'];
const COATS: CoatLength[] = ['short', 'medium', 'long', 'wire'];
const GOOD_WITH: { key: GoodWithTrait; label: string }[] = [
  { key: 'good_with_children', label: 'Children' },
  { key: 'good_with_dogs', label: 'Other dogs' },
  { key: 'good_with_strangers', label: 'Strangers' },
];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.h, { color: theme.text }]}>{title}</Text>
      <View style={styles.wrap}>{children}</View>
    </View>
  );
}

type Props = {
  visible: boolean;
  filters: Filters;
  groups: Group[];
  resultCount: number;
  onChange: (patch: Partial<Filters>) => void;
  onClear: () => void;
  onClose: () => void;
};

export function FiltersModal({ visible, filters, groups, resultCount, onChange, onClear, onClose }: Props) {
  const theme = useTheme();
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.root, { backgroundColor: theme.bg }]}>
        <View style={styles.header}>
          <Pressable onPress={onClear} accessibilityRole="button">
            <Text style={{ color: theme.primary, fontWeight: '600' }}>Clear all</Text>
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>Filters</Text>
          <Pressable onPress={onClose} accessibilityRole="button">
            <Text style={{ color: theme.primary, fontWeight: '600' }}>Done</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          <Section title="Breed group">
            {groups.map((g) => (
              <Chip key={g.id} label={g.name} selected={filters.groupIds.includes(g.id)}
                onPress={() => onChange({ groupIds: toggle(filters.groupIds, g.id) })} />
            ))}
          </Section>
          <Section title="Size">
            {SIZES.map((s) => (
              <Chip key={s} label={cap(s)} selected={filters.sizes.includes(s)}
                onPress={() => onChange({ sizes: toggle(filters.sizes, s) })} />
            ))}
          </Section>
          <Section title="Coat length">
            {COATS.map((c) => (
              <Chip key={c} label={cap(c)} selected={filters.coats.includes(c)}
                onPress={() => onChange({ coats: toggle(filters.coats, c) })} />
            ))}
          </Section>
          <Section title="Hypoallergenic">
            <Chip label="Any" selected={filters.hypoallergenic === null} onPress={() => onChange({ hypoallergenic: null })} />
            <Chip label="Yes" selected={filters.hypoallergenic === true} onPress={() => onChange({ hypoallergenic: true })} />
            <Chip label="No" selected={filters.hypoallergenic === false} onPress={() => onChange({ hypoallergenic: false })} />
          </Section>
          <Section title={`Good with (score ${TRAIT_THRESHOLD}+ of 5)`}>
            {GOOD_WITH.map((t) => (
              <Chip key={t.key} label={t.label} selected={filters.goodWith.includes(t.key)}
                onPress={() => onChange({ goodWith: toggle(filters.goodWith, t.key) })} />
            ))}
          </Section>
        </ScrollView>

        <Pressable style={[styles.cta, { backgroundColor: theme.primary }]} onPress={onClose} accessibilityRole="button">
          <Text style={{ color: theme.onPrimary, fontWeight: '700' }}>Show {resultCount} breeds</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 17, fontWeight: '700' },
  body: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 20 },
  h: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  cta: { margin: 16, padding: 14, borderRadius: 12, alignItems: 'center' },
});
