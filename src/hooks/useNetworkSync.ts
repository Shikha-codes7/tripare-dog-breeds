import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { useStore } from '../store';

/** Tracks connectivity and triggers a background sync when the network returns. */
export function useNetworkSync(): void {
  useEffect(() => {
    let wasOffline = useStore.getState().isOffline;
    return NetInfo.addEventListener((state) => {
      const offline = state.isConnected === false || state.isInternetReachable === false;
      const store = useStore.getState();
      store.setOffline(offline);
      if (wasOffline && !offline) void store.sync();
      wasOffline = offline;
    });
  }, []);
}
