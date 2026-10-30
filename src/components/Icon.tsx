import { Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Same paths, viewBox and stroke treatment as the web application's Icon.
const paths = {
  reply: 'm9 5-6 6 6 6M3 11h10a7 7 0 0 1 7 7v1',
  chevronDown: 'm6 9 6 6 6-6',
  chevronUp: 'm6 15 6-6 6 6',
  chevronRight: 'm9 5 7 7-7 7',
  retry: 'M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 12-1l2 6M4 12l2 6a7 7 0 0 0 12-1',
} as const;
export type IconName = keyof typeof paths;
export function Icon({ name, color = '#475569', mirrored = false, size = 16 }: { name: IconName; color?: string; mirrored?: boolean; size?: number }) {
  return <Svg accessible={Platform.OS === 'web' ? undefined : false} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={mirrored ? { transform: [{ scaleX: -1 }] } : undefined}><Path d={paths[name]} /></Svg>;
}
