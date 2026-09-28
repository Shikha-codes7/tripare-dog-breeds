export type Range = { min: number; max: number };

export type BreedImage = {
  id: string;
  thumb: string; // square 200x200 webp  -> list rows
  medium: string; // 600px webp          -> detail hero
  large: string; // 1200px webp          -> gallery
  attribution: {
    author: string;
    license: string;
    licenseUrl: string | null;
    source: string | null;
    sourceUrl: string | null;
  };
};

export const NUMERIC_TRAITS = [
  'energy',
  'barking',
  'drooling',
  'grooming',
  'shedding',
  'trainability',
  'good_with_dogs',
  'exercise_minutes',
  'apartment_friendly',
  'good_with_children',
  'good_with_strangers',
] as const;
export type NumericTrait = (typeof NUMERIC_TRAITS)[number];

export const GOOD_WITH_TRAITS = [
  'good_with_children',
  'good_with_dogs',
  'good_with_strangers',
] as const;
export type GoodWithTrait = (typeof GOOD_WITH_TRAITS)[number];

export type SizeBand = 'small' | 'medium' | 'large' | 'giant';
export type CoatLength = 'short' | 'medium' | 'long' | 'wire';

export type Breed = {
  id: string;
  name: string;
  description: string;
  groupId: string | null;
  hypoallergenic: boolean | null;
  life: Range | null;
  maleWeight: Range | null; // kg
  femaleWeight: Range | null; // kg
  maleHeight: Range | null; // cm
  femaleHeight: Range | null; // cm
  origin: { country: string | null; region: string | null; era: string | null };
  coatLength: CoatLength | null;
  coatType: string | null;
  coatColors: string[];
  traits: Partial<Record<NumericTrait, number>>;
  temperament: string[];
  otherNames: string[];
  recognizedBy: string[];
  sources: { url: string; title: string }[];
  images: BreedImage[];
  sizeBand: SizeBand | null; // derived, see normalize.ts
};

export type Group = { id: string; name: string };
