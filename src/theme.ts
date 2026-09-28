import { useColorScheme } from 'react-native';

export type Theme = {
  bg: string;
  card: string;
  text: string;
  subtext: string;
  border: string;
  primary: string;
  onPrimary: string;
  chip: string;
  danger: string;
  warn: string;
  scaleOff: string;
};

const light: Theme = {
  bg: '#F6F4EF', card: '#FFFFFF', text: '#1E1B16', subtext: '#6B655A', border: '#E4DFD3',
  primary: '#B4531F', onPrimary: '#FFFFFF', chip: '#EDE8DC', danger: '#B3261E', warn: '#8A5A00', scaleOff: '#E4DFD3',
};
const dark: Theme = {
  bg: '#141210', card: '#1F1C18', text: '#F2EEE6', subtext: '#A59E90', border: '#332F28',
  primary: '#E58A57', onPrimary: '#1A1207', chip: '#2A261F', danger: '#F2B8B5', warn: '#F0C674', scaleOff: '#332F28',
};

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}
