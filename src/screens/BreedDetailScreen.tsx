import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GalleryTab } from '../components/detail/GalleryTab';
import { OverviewTab } from '../components/detail/OverviewTab';
import { TraitsTab } from '../components/detail/TraitsTab';
import type { DetailScreenProps } from '../navigation/types';
import { useStore } from '../store';
import { useTheme } from '../theme';

const TABS = ['Overview', 'Traits', 'Gallery'] as const;
type Tab = (typeof TABS)[number];

export function BreedDetailScreen({ route }: DetailScreenProps) {
  const { id } = route.params;
  const theme = useTheme();
  const breed = useStore((s) => s.breeds[id]);
  const groupName = useStore((s) => (breed?.groupId ? s.groups[breed.groupId]?.name ?? null : null));
  const refreshBreed = useStore((s) => s.refreshBreed);
  const [tab, setTab] = useState<Tab>('Overview');

  // Enrich/refresh this one breed from GET /breeds/:id; cached copy shows meanwhile.
  useEffect(() => {
    void refreshBreed(id);
  }, [id, refreshBreed]);

  if (!breed) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.subtext }}>This breed is not available offline.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={[styles.tabs, { borderColor: theme.border }]} accessibilityRole="tablist">
        {TABS.map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && { borderBottomColor: theme.primary }]}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t }}>
            <Text style={{ color: tab === t ? theme.primary : theme.subtext, fontWeight: '700' }}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        {tab === 'Overview' && <OverviewTab breed={breed} groupName={groupName} />}
        {tab === 'Traits' && <TraitsTab breed={breed} />}
        {tab === 'Gallery' && <GalleryTab breed={breed} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  body: { padding: 16, paddingBottom: 40 },
});
