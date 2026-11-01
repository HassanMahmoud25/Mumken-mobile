import { useEffect, useState } from 'react';
import { Animated, Platform, View, useWindowDimensions, type DimensionValue } from 'react-native';
import { useDiscussion } from '../discussion/Provider';
import { colors, s, useReducedMotion } from './ui';

function Bone({ width = '100%', height = 14, round = false }: { width?: DimensionValue; height?: number; round?: boolean }) {
  return <View style={[s.bone, { width, height, borderRadius: round ? height / 2 : 4 }]} />;
}

// Keep the text line boxes aligned with the loaded typography, including
// accessibility font scaling. Short final lines convey the content hierarchy.
function Lines({ widths, lineHeight, fontSize }: { widths: DimensionValue[]; lineHeight: number; fontSize: number }) {
  const { fontScale } = useWindowDimensions();
  const { rtl } = useDiscussion();
  return <View>{widths.map((width, index) => <View key={index} style={{ height: lineHeight * fontScale, justifyContent: 'center', alignItems: rtl ? 'flex-end' : 'flex-start' }}><Bone width={width} height={fontSize * fontScale * 0.8} /></View>)}</View>;
}

function RecordPlaceholder({ detail }: { detail: boolean }) {
  const { width } = useWindowDimensions();
  const wide = width >= 600;
  return <View style={s.panel}>
    <Lines widths={[detail ? '25%' : '70%']} lineHeight={22} fontSize={12} />
    <Lines widths={wide ? ['88%'] : ['95%', '65%']} lineHeight={detail ? 34 : 30} fontSize={detail ? 23 : 19} />
    <Lines widths={wide ? ['100%', '75%'] : ['100%', '100%', '75%']} lineHeight={28} fontSize={16} />
    {detail
      ? <Lines widths={wide ? ['70%'] : ['100%', '55%']} lineHeight={22} fontSize={12} />
      : <View style={[s.button, { backgroundColor: '#e2e8ea' }]} />}
  </View>;
}

function CommentPlaceholder({ reply = false }: { reply?: boolean }) {
  const { rtl } = useDiscussion();
  return <View style={[reply && { backgroundColor: colors.canvas, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 12 }, { gap: 10 }]}>
    <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', gap: 10 }}>
      <Bone width={reply ? 32 : 40} height={reply ? 32 : 40} round />
      <View style={{ flex: 1, gap: 4 }}>
        <Lines widths={['45%']} lineHeight={25} fontSize={14} />
        <Lines widths={['65%']} lineHeight={22} fontSize={12} />
        <Lines widths={['100%', '100%', '70%']} lineHeight={28} fontSize={14} />
        {!reply && <View style={{ height: 48, justifyContent: 'center' }}><Bone width="35%" height={12} /></View>}
      </View>
    </View>
  </View>;
}

function DiscussionPlaceholder() {
  const { rtl } = useDiscussion();
  return <View style={s.panel}>
    <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <View style={{ width: '45%' }}><Lines widths={['100%']} lineHeight={30} fontSize={19} /></View>
      <Bone width="22%" height={10} />
    </View>
    <View style={{ gap: 10 }}>
      <View style={[s.input, { backgroundColor: colors.canvas, alignItems: rtl ? 'flex-end' : 'flex-start' }]}><Bone width="55%" height={14} /></View>
      <Lines widths={rtl ? ['100%', '55%'] : ['90%']} lineHeight={22} fontSize={12} />
      <View style={[s.button, { backgroundColor: '#e2e8ea' }]} />
    </View>
    <View style={{ borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 20, gap: 16 }}>
      <CommentPlaceholder />
      <View style={{ paddingLeft: rtl ? 0 : 12, paddingRight: rtl ? 12 : 0 }}><CommentPlaceholder reply /></View>
      <View style={{ borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 20 }}><CommentPlaceholder /></View>
    </View>
  </View>;
}

export function Skeleton({ detail = false }: { detail?: boolean }) {
  const { t } = useDiscussion();
  const reduced = useReducedMotion();
  const [opacity] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (reduced) { opacity.setValue(1); return; }
    const config = { duration: 850, useNativeDriver: Platform.OS !== 'web' };
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { ...config, toValue: 0.35 }),
      Animated.timing(opacity, { ...config, toValue: 1 }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [opacity, reduced]);
  return <View accessible accessibilityRole="progressbar" accessibilityLabel={t.loading} accessibilityState={{ busy: true }} accessibilityLiveRegion="polite">
    <Animated.View style={{ opacity }} aria-hidden importantForAccessibility="no-hide-descendants" accessibilityElementsHidden pointerEvents="none">
      {detail ? <><RecordPlaceholder detail /><DiscussionPlaceholder /></> : [0, 1, 2].map(index => <RecordPlaceholder key={index} detail={false} />)}
    </Animated.View>
  </View>;
}
