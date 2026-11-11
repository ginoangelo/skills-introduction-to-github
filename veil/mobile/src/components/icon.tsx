import type { ColorValue } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'shield'
  | 'arrow-right'
  | 'back'
  | 'lock'
  | 'refresh'
  | 'list'
  | 'waves'
  | 'mail'
  | 'check'
  | 'bolt'
  | 'alert'
  | 'settings'
  | 'phone';

type Props = { name: IconName; size?: number; color: ColorValue; strokeWidth?: number };

/** Stroke icons drawn with SVG so the app needs no icon font. */
export function Icon({ name, size = 20, color, strokeWidth = 1.8 }: Props) {
  const p = { stroke: color, strokeWidth, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      {name === 'shield' && <Path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" {...p} />}
      {name === 'arrow-right' && <Path d="M5 12h14M13 6l6 6-6 6" {...p} />}
      {name === 'back' && <Path d="M15 6l-6 6 6 6" {...p} />}
      {name === 'lock' && (
        <>
          <Rect x={5} y={11} width={14} height={10} rx={2} {...p} />
          <Path d="M8 11V7a4 4 0 0 1 8 0v4" {...p} />
        </>
      )}
      {name === 'refresh' && <Path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5" {...p} />}
      {name === 'list' && <Path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" {...p} />}
      {name === 'waves' && (
        <Path d="M2 8c2 0 2-1.5 4-1.5S8 8 10 8s2-1.5 4-1.5S16 8 18 8s2-1.5 4-1.5M2 13c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M12 15v6M9 18l3 3 3-3" {...p} />
      )}
      {name === 'mail' && <Path d="M4 6h16v12H4zM4 7l8 6 8-6" {...p} />}
      {name === 'check' && <Path d="M5 12l5 5 9-10" {...p} />}
      {name === 'bolt' && <Path d="M13 2L4 14h7l-1 8 9-12h-7z" {...p} />}
      {name === 'alert' && <Path d="M12 3l10 18H2zM12 10v5M12 18h.01" {...p} />}
      {name === 'settings' && (
        <>
          <Circle cx={12} cy={12} r={3} {...p} />
          <Path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" {...p} />
        </>
      )}
      {name === 'phone' && (
        <>
          <Rect x={6} y={2.5} width={12} height={19} rx={2.5} {...p} />
          <Path d="M10.5 18.5h3" {...p} />
        </>
      )}
    </Svg>
  );
}
