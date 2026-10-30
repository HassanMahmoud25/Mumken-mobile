import { memo, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useDiscussion } from '../discussion/Provider';
import { formatDate, replies } from '../discussion/model';
import type { Comment } from '../discussion/types';
import { Button, colors, Label, s, useReducedMotion } from './ui';

function ReplyExpansion({ visible, reduced, children }: { visible: boolean; reduced: boolean; children: ReactNode }) {
  const contentHeight = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => {
    const config = { duration: reduced ? 0 : 220, easing: Easing.bezier(0.25, 0.1, 0.25, 1) };
    return {
      height: withTiming(visible ? contentHeight.value : 0, config),
      opacity: withTiming(visible ? 1 : 0, config),
    };
  });
  return <Animated.View style={[{ overflow: 'hidden' }, animatedStyle]} pointerEvents={visible ? 'auto' : 'none'} accessibilityElementsHidden={!visible} importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}>
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }} onLayout={event => { contentHeight.value = event.nativeEvent.layout.height; }}>
      {children}
    </View>
  </Animated.View>;
}

function CommentBody({ comment, small = false }: { comment: Comment; small?: boolean }) {
  const { data, t, locale, rtl } = useDiscussion();
  const author = data?.users.find(u => u.id === comment.authorId) ?? { name: t.unknownAuthor, initials: '?' };
  const own = comment.authorId === data?.currentUser.id;
  const arabic = /\p{Script=Arabic}/u.test(comment.body);
  return <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', gap: 10 }}>
    <View accessible={false} style={[styles.avatar, small && { width: 32, height: 32, borderRadius: 16 }]}><Label style={[styles.initials, small && { fontSize: 12 }]}>{author.initials}</Label></View>
    <View style={{ flex: 1, gap: 4 }}>
      <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        <Label style={{ fontWeight: '600', fontSize: 14, writingDirection: 'auto' }}>{author.name}</Label>
        {own && <Label style={styles.badge}>{t.you}</Label>}
      </View>
      <Label style={s.muted}>{formatDate(comment.createdAt, locale)}{comment.updatedAt ? ` · ${t.edited}` : ''}</Label>
      <Label selectable style={{ textAlign: arabic ? 'right' : 'left', writingDirection: arabic ? 'rtl' : 'ltr', fontSize: 14, lineHeight: arabic ? 24 : 28, color: colors.body }}>{comment.body}</Label>
    </View>
  </View>;
}
export const CommentThread = memo(function CommentThread({ comment, comments, onReply, submitting }: { comment: Comment; comments: Comment[]; onReply: (id: string) => void; submitting: boolean }) {
  const { t, rtl } = useDiscussion();
  const reduced = useReducedMotion();
  const children = replies(comments, comment.id);
  const [hiddenCount, setHiddenCount] = useState<number | null>(null);
  const visible = hiddenCount !== children.length;
  return <View style={styles.thread}>
    <CommentBody comment={comment} />
    <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
      <Button ghost icon="reply" mirrorIcon={rtl} disabled={submitting} onPress={() => { setHiddenCount(null); onReply(comment.id); }}>{t.reply}</Button>
      {!!children.length && <Button ghost icon={visible ? 'chevronUp' : 'chevronDown'} expanded={visible} onPress={() => { setHiddenCount(visible ? children.length : null); }}>{visible ? t.hideReplies : t.showReplies} ({children.length})</Button>}
    </View>
    {children.length > 0 && <ReplyExpansion visible={visible} reduced={reduced}><View style={{ gap: 12, paddingTop: 14, paddingStart: 12, direction: rtl ? 'rtl' : 'ltr' }}>
      {children.map(reply => <View key={reply.id} style={styles.reply}><CommentBody comment={reply} small /></View>)}
    </View></ReplyExpansion>}
  </View>;
});
const styles = StyleSheet.create({
  thread: { backgroundColor: '#fff', padding: 20, borderColor: colors.border, borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.avatar, justifyContent: 'center', alignItems: 'center' },
  initials: { fontSize: 14, color: colors.green, fontWeight: '600', textAlign: 'center' },
  badge: { fontSize: 12, lineHeight: 20, paddingHorizontal: 8, borderRadius: 20, color: colors.green, backgroundColor: colors.badge },
  reply: { padding: 12, backgroundColor: colors.canvas, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
});
