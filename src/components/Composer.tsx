import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { AccessibilityInfo, Keyboard, LayoutAnimation, StyleSheet, TextInput, View } from 'react-native';
import { useDiscussion } from '../discussion/Provider';
import { MAX_COMMENT_LENGTH } from '../discussion/types';
import { Button, colors, Label, latinFont, s, useReducedMotion } from './ui';

export type ComposerHandle = { reply: (id: string) => void };
export const Composer = forwardRef<ComposerHandle, { recordId: string; onBusy: (busy: boolean) => void; onFocus: () => void }>(function Composer({ recordId, onBusy, onFocus }, ref) {
  const { t, rtl, data, locale, repository, append } = useDiscussion();
  const [body, setBody] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const pending = useRef(false);
  const input = useRef<TextInput>(null);
  const reduced = useReducedMotion();
  useImperativeHandle(ref, () => ({ reply(id) {
    if (pending.current) return;
    setParentId(id); setError(null); setSuccess(false); onFocus(); input.current?.focus();
  } }));
  const parent = data?.comments.find(c => c.id === parentId);
  const author = parent && data?.users.find(u => u.id === parent.authorId);
  async function submit() {
    if (pending.current || !data) return;
    if (!body.trim()) { setError('EMPTY_COMMENT'); AccessibilityInfo.announceForAccessibility(t.emptyError); input.current?.focus(); return; }
    pending.current = true; setBusy(true); onBusy(true); setError(null); setSuccess(false);
    try {
      const comment = await repository.createComment({ recordId, parentId, body, authorId: data.currentUser.id, language: locale });
      if (!reduced) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      append(comment); setBody(''); setParentId(null); setSuccess(true); Keyboard.dismiss();
      AccessibilityInfo.announceForAccessibility(locale === 'ar' ? 'تم النشر' : 'Posted successfully');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'SUBMIT_FAILED');
      AccessibilityInfo.announceForAccessibility(parentId ? t.replySubmitError : t.submitError);
    } finally { pending.current = false; setBusy(false); onBusy(false); }
  }
  const message = error === 'EMPTY_COMMENT' ? t.emptyError : error === 'INVALID_REPLY_TARGET' ? t.invalidReplyError : parentId ? t.replySubmitError : t.submitError;
  const arabic = body ? /\p{Script=Arabic}/u.test(body) : rtl;
  return <View style={{ gap: 10 }}>
    {parentId && <View style={[styles.replyContext, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
      <View accessibilityLiveRegion="polite" style={{ flex: 1, flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
        <Label style={styles.replyLabel}>{t.replyingTo}</Label>
        <Label style={styles.replyAuthor}>{author?.name ?? t.unknownAuthor}</Label>
      </View>
      <Button ghost disabled={busy} onPress={() => { setParentId(null); setError(null); input.current?.focus(); }}>{t.cancel}</Button>
    </View>}
    <TextInput ref={input} accessibilityLabel={parentId ? t.replyPlaceholder : t.commentPlaceholder} value={body} editable={!busy} multiline maxLength={MAX_COMMENT_LENGTH} onFocus={onFocus} onChangeText={value => { setBody(value.slice(0, MAX_COMMENT_LENGTH)); setError(null); setSuccess(false); }} placeholder={parentId ? t.replyPlaceholder : t.commentPlaceholder} placeholderTextColor={colors.muted} textAlignVertical="top" style={[s.input, { fontFamily: arabic ? 'Cairo' : latinFont, textAlign: arabic ? 'right' : 'left', writingDirection: arabic ? 'rtl' : 'ltr' }, error && { borderColor: '#b91c1c' }]} />
    <Label style={s.muted}>{t.characterHint} {body.length}/{MAX_COMMENT_LENGTH}</Label>
    <Button loading={busy} onPress={() => void submit()}>{busy ? t.submitting : parentId ? t.postReply : t.postComment}</Button>
    {error && <Label accessibilityRole="alert" accessibilityLiveRegion="assertive" style={s.error}>{message}</Label>}
    {success && <Label accessibilityLiveRegion="polite" style={{ color: '#047857' }}>{locale === 'ar' ? 'تم النشر بنجاح' : 'Posted successfully'}</Label>}
  </View>;
});
const styles = StyleSheet.create({
  replyContext: { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  replyLabel: { fontSize: 14, lineHeight: 24, color: '#475569' },
  replyAuthor: { fontSize: 14, lineHeight: 24, color: colors.ink, fontWeight: '700', writingDirection: 'auto' },
});
