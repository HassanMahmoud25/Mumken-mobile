import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View } from 'react-native';
import { DiscussionProvider } from '../discussion/Provider';
import { colors } from '../components/ui';

export default function Layout() {
  const [loaded, error] = useFonts({ Cairo: require('../../assets/fonts/Cairo.ttf') });
  if (!loaded && !error) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator accessibilityLabel="Loading fonts" /></View>;
  return <DiscussionProvider><StatusBar style="light" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }} /></DiscussionProvider>;
}
