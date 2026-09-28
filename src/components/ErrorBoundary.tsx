import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { children: React.ReactNode; name?: string };
type S = { error: Error | null };

/** Catches render errors in a feature so one bad screen never takes down the app. */
export class ErrorBoundary extends React.Component<Props, S> {
  state: S = { error: null };

  static getDerivedStateFromError(error: Error): S {
    return { error };
  }

  componentDidCatch(error: Error): void {
    console.warn(`[ErrorBoundary:${this.props.name ?? 'app'}]`, error.message);
  }

  render(): React.ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.box} accessibilityRole="alert">
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.msg}>{this.state.error.message}</Text>
        <Pressable style={styles.btn} onPress={() => this.setState({ error: null })} accessibilityRole="button">
          <Text style={styles.btnText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  msg: { color: '#777', textAlign: 'center', marginBottom: 16 },
  btn: { backgroundColor: '#B4531F', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
});
