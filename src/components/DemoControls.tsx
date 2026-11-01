import { useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDiscussion } from '../discussion/Provider';
import type { Scenario } from '../discussion/repository';
import { Button, Label, s } from './ui';

export function DemoControls() {
  const [open, setOpen] = useState(false);
  const { locale, selectScenario } = useDiscussion();
  if (!__DEV__) return null;
  const ar = locale === 'ar';
  const modes: [Scenario, string, string][] = [
    ['normal', 'Reset session', 'إعادة ضبط الجلسة'], ['loading', '4-second loading', 'تحميل لمدة ٤ ثوان'],
    ['initial-error', 'Initial load failure', 'فشل التحميل الأولي'], ['load-error', 'Discussion load failure', 'فشل تحميل النقاش'],
    ['submit-error', 'Next submission fails', 'فشل الإرسال التالي'], ['empty-records', 'Empty records', 'قائمة تحديثات فارغة'],
  ];
  return <><Button subtle onPress={() => setOpen(true)} accessibilityLabel={ar ? 'سيناريوهات التطوير' : 'Development scenarios'}>{ar ? 'تجربة' : 'Demo'}</Button>
    <Modal visible={open} animationType="none" onRequestClose={() => setOpen(false)}><SafeAreaView style={{ flex: 1 }}><ScrollView contentContainerStyle={{ padding: 24, gap: 14 }}>
      <Label accessibilityRole="header" style={s.heading}>{ar ? 'سيناريوهات التطوير' : 'Development scenarios'}</Label>
      <Label>{ar ? 'اختيار سيناريو يعيد ضبط التعليقات. يحدث كل فشل مرة واحدة.' : 'Selecting a scenario resets session comments. Each failure happens once.'}</Label>
      {modes.map(([mode, en, arabic]) => <Button key={mode} onPress={() => { selectScenario(mode); setOpen(false); router.replace('/records'); }}>{ar ? arabic : en}</Button>)}
      <Button onPress={() => { selectScenario('normal'); setOpen(false); router.replace('/records/record-002'); }}>{ar ? 'نقاش فارغ' : 'Empty discussion'}</Button>
      <Button onPress={() => { setOpen(false); router.push('/records/missing'); }}>{ar ? 'تحديث غير متاح' : 'Unavailable record'}</Button>
      <View style={{ marginTop: 12 }}><Button subtle onPress={() => setOpen(false)}>{ar ? 'إغلاق' : 'Close'}</Button></View>
    </ScrollView></SafeAreaView></Modal>
  </>;
}
