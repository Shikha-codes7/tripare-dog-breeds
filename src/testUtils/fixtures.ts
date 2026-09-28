
export const caucasianRaw = {
  id: 'f9643a80-af1d-422a-9f15-18d466822053',
  type: 'breed',
  attributes: {
    name: 'Caucasian Shepherd Dog',
    description: 'A serious guardian breed.',
    hypoallergenic: false,
    life: { min: 15, max: 20 },
    male_weight: { min: 50, max: 100 },
    female_weight: { min: 45, max: 70 },
    male_height: { min: 72, max: 75 },
    female_height: { min: 67, max: 70 },
    origin: { country: 'Georgia', region: 'Caucasus Mountains', era: 'antiquity' },
    coat: { type: 'double', length: 'long', colors: ['gray', 'fawn'] },
    traits: {
      energy: 3, trainability: 2, barking: 4, grooming: 4, shedding: 5, drooling: 3,
      good_with_children: 3, good_with_dogs: 2, good_with_strangers: 1,
      apartment_friendly: 1, exercise_minutes: 60,
      temperament: ['fearless', 'self-confident'],
    },
    other_names: ['Caucasian Ovcharka', 'Nagazi'],
    recognized_by: ['AKC', 'FCI'],
    sources: [{ url: 'https://www.akc.org/x', title: 'AKC' }],
    images: [
      {
        id: 'img1',
        url: 'https://images.dogapi.dog/a.jpg',
        thumb: 'https://images.dogapi.dog/a-thumb.webp',
        medium: 'https://images.dogapi.dog/a-medium.webp',
        large: 'https://images.dogapi.dog/a-large.webp',
        attribution: {
          author: 'Magdalena Niemiec',
          license: 'CC BY-SA 3.0',
          license_url: 'https://creativecommons.org/licenses/by-sa/3.0/',
          source: 'wikimedia_commons',
          source_url: 'https://commons.wikimedia.org/wiki/File:X.jpg',
        },
      },
    ],
  },
  relationships: { group: { data: { id: 'g-working', type: 'group' } } },
};

export function rawBreed(id: string, name: string, extra: Record<string, unknown> = {}): unknown {
  return { id, type: 'breed', attributes: { name, ...extra } };
}
