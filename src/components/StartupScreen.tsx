import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import logo from './logo';
import { useReducedMotion } from './ui';

const background = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><linearGradient id="base" x2="1" y2="1"><stop stop-color="#172a33"/><stop offset=".55" stop-color="#1c2933"/><stop offset="1" stop-color="#253d43"/></linearGradient><radialGradient id="green" cx="15%" cy="10%" r="75%"><stop stop-color="#2a7368" stop-opacity=".45"/><stop offset="1" stop-color="#2a7368" stop-opacity="0"/></radialGradient><radialGradient id="blue" cx="90%" cy="90%" r="75%"><stop stop-color="#4b657a" stop-opacity=".35"/><stop offset="1" stop-color="#4b657a" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#base)"/><rect width="100%" height="100%" fill="url(#green)"/><rect width="100%" height="100%" fill="url(#blue)"/></svg>`;

export function StartupScreen({ ready }: { ready: boolean }) {
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [visible, setVisible] = useState(true);
  const [opacity] = useState(() => new Animated.Value(1));
  const [pulse] = useState(() => new Animated.Value(0));
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const timer = setTimeout(() => setMinimumElapsed(true), 1200);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (reducedMotion) return;
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true, isInteraction: false }),
      Animated.timing(pulse, { toValue: 0, duration: 600, useNativeDriver: true, isInteraction: false }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [pulse, reducedMotion]);
  useEffect(() => {
    if (!ready || !minimumElapsed) return;
    const animation = Animated.timing(opacity, { toValue: 0, duration: reducedMotion ? 0 : 220, useNativeDriver: true });
    animation.start(({ finished }) => { if (finished) setVisible(false); });
    return () => animation.stop();
  }, [ready, minimumElapsed, opacity, reducedMotion]);
  if (!visible) return null;
  return <Animated.View accessibilityViewIsModal accessible accessibilityRole="progressbar" accessibilityLabel="MUMKEN — Loading / جارٍ التحميل" style={[styles.screen, { opacity }]}>
    <View style={StyleSheet.absoluteFill}><SvgXml xml={background} width="100%" height="100%" /></View>
    <View style={styles.brand}>
      <SvgXml xml={logo} width={234} height={76} />
      <Animated.View style={[styles.indicator, { opacity: reducedMotion ? 1 : pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }), transform: [{ scaleX: reducedMotion ? 1 : pulse.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] }) }] }]} />
    </View>
  </Animated.View>;
}
const styles = StyleSheet.create({
  screen: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 100, backgroundColor: '#172a33', alignItems: 'center', justifyContent: 'center' },
  brand: { alignItems: 'center', gap: 28 },
  indicator: { width: 44, height: 3, borderRadius: 999, backgroundColor: '#b8d9cc' },
});
