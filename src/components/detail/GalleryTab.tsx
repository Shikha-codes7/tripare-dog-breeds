import FastImage from '@d11/react-native-fast-image';
import React, { useState } from 'react';
import { FlatList, Linking, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTheme } from '../../theme';
import type { Breed, BreedImage } from '../../types';

function open(url: string | null): void {
  if (url) Linking.openURL(url).catch(() => undefined);
}

function Attribution({ image }: { image: BreedImage }) {
  const theme = useTheme();
  const a = image.attribution;
  return (
    <View style={styles.attr}>
      <Text style={[styles.attrText, { color: theme.subtext }]}>
        Photo: {a.author}
        {a.license ? ' · ' : ''}
        {a.license ? (
          <Text style={{ color: theme.primary }} onPress={() => open(a.licenseUrl)} accessibilityRole="link">
            {a.license}
          </Text>
        ) : null}
        {a.sourceUrl ? ' · ' : ''}
        {a.sourceUrl ? (
          <Text style={{ color: theme.primary }} onPress={() => open(a.sourceUrl)} accessibilityRole="link">
            {a.source ?? 'Source'}
          </Text>
        ) : null}
      </Text>
    </View>
  );
}

export function GalleryTab({ breed }: { breed: Breed }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const pageWidth = width - 32; // screen padding

  if (breed.images.length === 0) {
    return <Text style={{ color: theme.subtext }}>No photos available for this breed yet.</Text>;
  }

  return (
    <View>
      <FlatList
        horizontal
        pagingEnabled
        data={breed.images}
        keyExtractor={(i) => i.id}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / pageWidth))}
        renderItem={({ item, index }) => (
          <View style={{ width: pageWidth }}>
            <FastImage
              style={[styles.img, { width: pageWidth, backgroundColor: theme.chip }]}
              source={{ uri: item.large, cache: FastImage.cacheControl.immutable }}
              resizeMode={FastImage.resizeMode.contain}
              accessibilityLabel={`${breed.name} photo ${index + 1} of ${breed.images.length}, by ${item.attribution.author}`}
            />
            <Attribution image={item} />
          </View>
        )}
      />
      <Text style={[styles.count, { color: theme.subtext }]}>
        {page + 1} / {breed.images.length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  img: { height: 300, borderRadius: 14 },
  attr: { paddingTop: 10, paddingHorizontal: 4 },
  attrText: { fontSize: 12, lineHeight: 18 },
  count: { textAlign: 'center', marginTop: 10, fontSize: 12 },
});
