import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  BreedList: undefined;
  BreedDetail: { id: string; name: string };
};

export type ListScreenProps = NativeStackScreenProps<RootStackParamList, 'BreedList'>;
export type DetailScreenProps = NativeStackScreenProps<RootStackParamList, 'BreedDetail'>;
