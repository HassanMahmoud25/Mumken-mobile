import { useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import { DiscussionProvider } from '../discussion/Provider';
import { StartupScreen } from '../components/StartupScreen';
import { colors } from '../components/ui';

export default function Layout() {
  const [localeReady, setLocaleReady] = useState(false);
  const [loaded, error] = useFonts({ Cairo: require('../../assets/fonts/Cairo.ttf') });
  /* Startup stays mounted for the lifetime of this app session. */
  return <View style={{ flex: 1 }}><StartupScreen ready={(loaded || !!error) && localeReady} />{loaded || error ? <DiscussionProvider onReady={() => setLocaleReady(true)}><StatusBar style="light" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }} /></DiscussionProvider> : null}</View>;
}
