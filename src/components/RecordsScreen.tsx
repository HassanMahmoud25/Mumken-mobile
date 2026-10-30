import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { useDiscussion } from '../discussion/Provider';
import { formatDate, roots } from '../discussion/model';
import type { Comment, RecordItem } from '../discussion/types';
import { Button, colors, Label, s, useReducedMotion } from './ui';
import { Composer, type ComposerHandle } from './Composer';
import { CommentThread } from './CommentThread';
import { DemoControls } from './DemoControls';
import logo from './logo';
import { Skeleton } from './Skeleton';

export function RecordsScreen({ recordId }: { recordId?: string }) {
  const { generation } = useDiscussion();
  return <Screen key={generation} recordId={recordId} />;
}
function Screen({ recordId }: { recordId?: string }) {
  const { data, t, locale, rtl, toggleLocale, status, retry, repository, generation } = useDiscussion();
  const [detailStatus, setDetailStatus] = useState<'loading' | 'success' | 'error' | 'unavailable'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const list = useRef<FlatList<RecordItem | Comment>>(null);
  const composer = useRef<ComposerHandle>(null);
  const composerY = useRef(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!recordId || status !== 'success') return;
    let active = true;
    repository.loadRecord(recordId).then(() => { if (active) setDetailStatus('success'); }).catch(reason => { if (active) setDetailStatus(reason.message === 'UNAVAILABLE' ? 'unavailable' : 'error'); });
    return () => { active = false; };
  }, [recordId, repository, status, attempt]);
  const record = data?.records.find(r => r.id === recordId);
  const comments = data?.comments.filter(c => c.recordId === recordId) ?? [];
  const currentStatus = status !== 'success' ? status : recordId ? detailStatus : 'success';
  const row = { flexDirection: rtl ? 'row-reverse' as const : 'row' as const };
  function focusComposer() { list.current?.scrollToOffset({ offset: Math.max(0, composerY.current - 12), animated: !reduced }); }
  const items: (RecordItem | Comment)[] = currentStatus !== 'success' ? [] : recordId ? roots(comments) : data?.records ?? [];
  return <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.brand }}>
    <View style={[styles.header, row]}>
      <View accessible accessibilityRole="image" accessibilityLabel={t.appName} style={{ minHeight: 48, justifyContent: 'center' }}><SvgXml accessible={Platform.OS === 'web' ? undefined : false} xml={logo} /></View>
      <View style={[row, { gap: 8, alignItems: 'center' }]}><Button subtle language onPress={toggleLocale}>{t.language}</Button><DemoControls /></View>
    </View>
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.canvas }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <FlatList ref={list} data={items} keyExtractor={item => item.id} keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === 'web' ? 'none' : 'on-drag'} contentContainerStyle={styles.content} initialNumToRender={5} windowSize={7}
        ListHeaderComponent={<>
          <View style={{ marginBottom: 20 }}>{recordId ? <Button subtle onPress={() => router.dismissTo('/records')}>{t.backToUpdates}</Button> : <Label accessibilityRole="header" style={s.title}>{t.records}</Label>}</View>
          {currentStatus === 'loading' && <Skeleton detail={!!recordId} />}
          {currentStatus === 'error' && <View style={s.panel}><Label accessibilityRole="alert">{t.loadError}</Label><Button onPress={() => { if (status === 'error') retry(); else { setDetailStatus('loading'); setAttempt(n => n + 1); } }}>{t.retry}</Button></View>}
          {currentStatus === 'unavailable' && <View style={s.panel}><Label accessibilityRole="header" style={s.heading}>{t.unavailableTitle}</Label><Label>{t.unavailableDescription}</Label></View>}
          {currentStatus === 'success' && recordId && record && <>
            <View style={s.panel}><Label style={s.muted}>{record.id}</Label><Label accessibilityRole="header" style={s.title}>{record.title[locale]}</Label><Label style={{ color: '#475569', lineHeight: 28 }}>{record.summary[locale]}</Label><Label style={s.muted}>{t.source}: {record.source} · {t.published}: {formatDate(record.publishedAt, locale)}</Label></View>
            <View onLayout={event => { composerY.current = event.nativeEvent.layout.y; }} style={[s.panel, { marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomColor: '#f1f5f9' }]}>
              <View style={[row, { justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }]}><Label accessibilityRole="header" style={s.heading}>{t.discussion}</Label><Label accessibilityLiveRegion="polite" style={s.muted}>{comments.length} {t.comments}</Label></View>
              <Composer key={`${recordId}-${generation}`} ref={composer} recordId={recordId} onBusy={setBusy} onFocus={focusComposer} />
            </View>
          </>}
        </>}
        ListEmptyComponent={currentStatus === 'success' ? <View style={[s.panel, recordId && { marginBottom: 0, borderRadius: 0, borderTopWidth: 0, borderBottomWidth: 0 }]}><Label style={s.heading}>{recordId ? t.noComments : t.noRecords}</Label>{recordId && <Label style={s.muted}>{t.beFirst}</Label>}</View> : null}
        ListFooterComponent={recordId && currentStatus === 'success' ? <View style={{ height: 16, backgroundColor: '#fff', borderColor: colors.border, borderWidth: 1, borderTopWidth: 0, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }} /> : null}
        renderItem={({ item }) => 'parentId' in item ? <CommentThread comment={item} comments={comments} submitting={busy} onReply={id => composer.current?.reply(id)} /> : <View style={s.panel}>
          <Label style={s.muted}>{item.source} · {formatDate(item.publishedAt, locale)}</Label>
          <Label accessibilityRole="header" style={s.heading}>{item.title[locale]}</Label><Label style={{ color: '#475569', lineHeight: 28 }}>{item.summary[locale]}</Label>
          <Button icon="chevronRight" iconAfter mirrorIcon={rtl} accessibilityLabel={`${t.openRecord}: ${item.title[locale]}`} onPress={() => router.push({ pathname: '/records/[recordId]', params: { recordId: item.id } })}>{t.openRecord}</Button>
        </View>} />
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  content: { padding: 16, paddingBottom: 48, width: '100%', maxWidth: 720, alignSelf: 'center' },
});
