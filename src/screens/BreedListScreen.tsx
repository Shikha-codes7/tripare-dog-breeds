import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Breed } from '../types';
import { BreedRow, ROW_HEIGHT } from '../components/BreedRow';
import { FiltersModal } from '../components/FiltersModal';
import { SyncBanner } from '../components/SyncBanner';
import { activeFilterCount, applyFilters, BreedSection, buildSections } from '../filters';
import { useDebounce } from '../hooks/useDebounce';
import type { ListScreenProps } from '../navigation/types';
import { useStore } from '../store';
import { useTheme } from '../theme';

export function BreedListScreen({ navigation }: ListScreenProps) {
  const theme = useTheme();
  const breeds = useStore((s) => s.breeds);
  const breedIds = useStore((s) => s.breedIds);
  const groups = useStore((s) => s.groups);
  const filters = useStore((s) => s.filters);
  const hydrated = useStore((s) => s.hydrated);
  const syncing = useStore((s) => s.syncing);
  const error = useStore((s) => s.error);
  const isOffline = useStore((s) => s.isOffline);
  const lastSyncedAt = useStore((s) => s.lastSyncedAt);
  const sync = useStore((s) => s.sync);
  const setFilters = useStore((s) => s.setFilters);
  const clearFilters = useStore((s) => s.clearFilters);

  const [text, setText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const query = useDebounce(text, 250);

  const sections: BreedSection[] = useMemo(() => {
    const all = breedIds.map((id) => breeds[id]).filter((b): b is Breed => b !== undefined);
    return buildSections(applyFilters(all, query, filters), groups);
  }, [breedIds, breeds, groups, query, filters]);

  const resultCount = useMemo(() => sections.reduce((n, s) => n + s.data.length, 0), [sections]);
  const groupList = useMemo(() => Object.values(groups).sort((a, b) => a.name.localeCompare(b.name)), [groups]);
  const filterCount = activeFilterCount(filters);

  const openBreed = useCallback(
    (b: Breed) => navigation.navigate('BreedDetail', { id: b.id, name: b.name }),
    [navigation],
  );
  const renderItem = useCallback(
    ({ item }: { item: Breed }) => <BreedRow breed={item} onPress={openBreed} />,
    [openBreed],
  );
  const onRefresh = useCallback(() => void sync(), [sync]);

  const empty = !hydrated || (syncing && breedIds.length === 0) ? (
    <View style={styles.center}><ActivityIndicator /></View>
  ) : (
    <View style={styles.center}>
      <Text style={{ color: theme.subtext, textAlign: 'center' }}>
        {breedIds.length === 0
          ? isOffline
            ? 'No saved breeds yet. Connect to the internet to load them.'
            : 'No breeds loaded yet. Pull down to refresh.'
          : 'No breeds match your search and filters.'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.searchRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Search breeds or other names"
          placeholderTextColor={theme.subtext}
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          autoCorrect={false}
          clearButtonMode="while-editing"
          accessibilityLabel="Search breeds"
        />
        <Pressable
          onPress={() => setShowFilters(true)}
          style={[styles.filterBtn, { backgroundColor: filterCount ? theme.primary : theme.chip }]}
          accessibilityRole="button"
          accessibilityLabel={`Filters, ${filterCount} active`}>
          <Text style={{ color: filterCount ? theme.onPrimary : theme.text, fontWeight: '600' }}>
            Filters{filterCount ? ` (${filterCount})` : ''}
          </Text>
        </Pressable>
      </View>

      <SyncBanner isOffline={isOffline} syncing={syncing} error={error} lastSyncedAt={lastSyncedAt} onRetry={onRefresh} />

      <SectionList<Breed, BreedSection>
        sections={sections}
        keyExtractor={(b) => b.id}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.header, { backgroundColor: theme.bg, color: theme.subtext }]}>
            {section.title.toUpperCase()} · {section.data.length}
          </Text>
        )}
        stickySectionHeadersEnabled
        ListEmptyComponent={empty}
        refreshControl={<RefreshControl refreshing={syncing} onRefresh={onRefresh} />}
        initialNumToRender={Math.ceil(700 / ROW_HEIGHT)}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={sections.length === 0 ? styles.grow : undefined}
      />

      <FiltersModal
        visible={showFilters}
        filters={filters}
        groups={groupList}
        resultCount={resultCount}
        onChange={setFilters}
        onClear={clearFilters}
        onClose={() => setShowFilters(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchRow: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  input: { flex: 1, height: 42, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, fontSize: 15 },
  filterBtn: { marginLeft: 10, height: 42, paddingHorizontal: 14, borderRadius: 10, justifyContent: 'center' },
  header: { paddingHorizontal: 16, paddingVertical: 6, fontSize: 12, fontWeight: '700', letterSpacing: 0.6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  grow: { flexGrow: 1 },
});
