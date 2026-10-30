import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, ActivityIndicator, Platform, Pressable, StyleSheet, Text, type TextProps } from 'react-native';
import { useDiscussion } from '../discussion/Provider';
import { Icon, type IconName } from './Icon';

export const colors = { brand: '#1c2933', canvas: '#f7f9f9', border: '#e2e8f0', muted: '#64748b', ink: '#0f172a', body: '#334155', avatar: '#FFF5D6', green: '#065f46', badge: '#ecfdf5' };
export const latinFont = Platform.OS === 'ios' || Platform.OS === 'web' ? 'Arial' : 'sans-serif';
export function Label({ style, ...props }: TextProps) {
  const { rtl } = useDiscussion();
  const arabic = /\p{Script=Arabic}/u.test(String(props.children ?? ''));
  return <Text {...props} style={[s.text, { fontFamily: arabic ? 'Cairo' : latinFont, textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }, style]} />;
}
export function Button({ children, onPress, disabled, subtle = false, ghost = false, accessibilityLabel, expanded, icon, iconAfter = false, mirrorIcon = false, language = false, loading = false }: { children: ReactNode; onPress: () => void; disabled?: boolean; subtle?: boolean; ghost?: boolean; accessibilityLabel?: string; expanded?: boolean; icon?: IconName; iconAfter?: boolean; mirrorIcon?: boolean; language?: boolean; loading?: boolean }) {
  const { rtl } = useDiscussion();
  const foreground = ghost ? '#475569' : subtle ? '#334155' : '#fff';
  const graphic = icon ? <Icon name={icon} color={foreground} mirrored={mirrorIcon} /> : null;
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityState={{ disabled: !!disabled || loading, busy: loading, expanded }} disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [s.button, { flexDirection: rtl ? 'row-reverse' : 'row' }, subtle && s.subtle, ghost && s.ghost, (disabled || loading || pressed) && { opacity: 0.55 }]}>
    {loading && <ActivityIndicator accessible={false} size="small" color={foreground} />}
    {!iconAfter && graphic}
    {language && <Text accessible={false} style={{ color: foreground, fontFamily: latinFont, fontSize: 16 }}>文A</Text>}
    <Label style={[s.buttonText, { color: foreground }, ghost && { fontSize: 12 }]}>{children}</Label>
    {iconAfter && graphic}
  </Pressable>;
}
export function useReducedMotion() {
  // Start conservatively until the asynchronous preference resolves.
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReduced(value); });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { active = false; subscription.remove(); };
  }, []);
  return reduced;
}
export const s = StyleSheet.create({
  text: { color: colors.ink, fontSize: 16, lineHeight: 28 },
  title: { fontSize: 23, lineHeight: 34, fontWeight: '700' },
  heading: { fontSize: 19, lineHeight: 30, fontWeight: '700' },
  muted: { color: colors.muted, fontSize: 12, lineHeight: 22 },
  panel: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 20, marginBottom: 18, gap: 12 },
  button: { minHeight: 48, gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: colors.brand, justifyContent: 'center', alignItems: 'center' },
  subtle: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent', paddingHorizontal: 8 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 14 },
  input: { minHeight: 115, maxHeight: 220, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 14, fontFamily: 'Cairo', fontSize: 15, lineHeight: 25, color: colors.ink, backgroundColor: '#fff' },
  bone: { backgroundColor: '#e2e8ea', borderRadius: 6 },
  error: { color: '#b91c1c', fontSize: 14 },
});
