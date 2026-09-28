import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { useNetworkSync } from './src/hooks/useNetworkSync';
import type { DetailScreenProps, ListScreenProps, RootStackParamList } from './src/navigation/types';
import { BreedDetailScreen } from './src/screens/BreedDetailScreen';
import { BreedListScreen } from './src/screens/BreedListScreen';
import { useStore } from './src/store';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Each major feature gets its own error boundary.
function ListScreen(props: ListScreenProps) {
  return (
    <ErrorBoundary name="list">
      <BreedListScreen {...props} />
    </ErrorBoundary>
  );
}
function DetailScreen(props: DetailScreenProps) {
  return (
    <ErrorBoundary name="detail">
      <BreedDetailScreen {...props} />
    </ErrorBoundary>
  );
}

export default function App() {
  const scheme = useColorScheme();
  useNetworkSync();
  useEffect(() => {
    void useStore.getState().init();
  }, []);

  return (
    <ErrorBoundary name="app">
      <SafeAreaProvider>
        <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
        <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack.Navigator>
            <Stack.Screen name="BreedList" component={ListScreen} options={{ title: 'Dog Breeds' }} />
            <Stack.Screen name="BreedDetail" component={DetailScreen} options={({ route }) => ({ title: route.params.name })} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
