import Svg, { Circle, Path, Rect, Text as SvgText } from "react-native-svg";

export type IconName = "home" | "plus" | "plusCircle" | "clock" | "info" | "search" | "back" | "copy" | "close" | "check" | "lock" | "more" | "tag";

export function Icon({ name, size = 22, color, strokeWidth = 2 }: { name: IconName; size?: number; color: string; strokeWidth?: number }) {
  const p = { fill: "none", stroke: color, strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === "home" && <Path {...p} d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-5v6H5A1.5 1.5 0 0 1 3.5 19z" />}
      {name === "plus" && <Path {...p} d="M12 5v14M5 12h14" />}
      {name === "plusCircle" && (
        <>
          <Circle {...p} cx="12" cy="12" r="9" />
          <Path {...p} d="M12 8v8M8 12h8" />
        </>
      )}
      {name === "clock" && (
        <>
          <Circle {...p} cx="12" cy="12" r="9" />
          <Path {...p} d="M12 7.5V12l3 2" />
        </>
      )}
      {name === "info" && (
        <>
          <Circle {...p} cx="12" cy="12" r="9" />
          <Path {...p} d="M12 11v5.5M12 7.6v.1" />
        </>
      )}
      {name === "search" && (
        <>
          <Circle {...p} cx="11" cy="11" r="7" />
          <Path {...p} d="m20 20-3.6-3.6" />
        </>
      )}
      {name === "back" && <Path {...p} d="M15 5l-7 7 7 7" />}
      {name === "copy" && (
        <>
          <Rect {...p} x="9" y="9" width="11" height="11" rx="2.5" />
          <Path {...p} d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" />
        </>
      )}
      {name === "close" && <Path {...p} d="M7 7l10 10M17 7 7 17" />}
      {name === "check" && <Path {...p} strokeWidth={2.4} d="m5 12.5 4.5 4.5L19 7.5" />}
      {name === "lock" && (
        <>
          <Rect {...p} x="5" y="10.5" width="14" height="10" rx="2.5" />
          <Path {...p} d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
        </>
      )}
      {name === "tag" && (
        <>
          <Path {...p} d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.5 1.5 0 0 1 0 2.1l-6.2 6.2a1.5 1.5 0 0 1-2.1 0z" />
          <Circle cx="8.2" cy="8.2" r="1.5" fill={color} />
        </>
      )}
      {name === "more" && (
        <>
          <Circle cx="5" cy="12" r="1.8" fill={color} />
          <Circle cx="12" cy="12" r="1.8" fill={color} />
          <Circle cx="19" cy="12" r="1.8" fill={color} />
        </>
      )}
    </Svg>
  );
}

/** Card illustrations, drawn in the card's own text color. */
export function Art({ name, color, accent }: { name: "hero" | "bubble" | "quote"; color: string; accent: string }) {
  if (name === "hero")
    return (
      <Svg width={84} height={98} viewBox="0 0 120 140">
        <Rect x="18" y="8" width="66" height="116" rx="14" fill={color} fillOpacity={0.14} stroke={color} strokeWidth={2.5} />
        <Rect x="28" y="20" width="20" height="3" rx="1.5" fill={color} />
        <Rect x="52" y="20" width="22" height="3" rx="1.5" fill={color} fillOpacity={0.4} />
        <Circle cx="33" cy="36" r="5" fill={color} fillOpacity={0.6} />
        <Rect x="28" y="56" width="46" height="6" rx="3" fill={color} />
        <Rect x="28" y="68" width="36" height="6" rx="3" fill={color} />
        <Rect x="28" y="80" width="42" height="6" rx="3" fill={color} fillOpacity={0.5} />
        <Circle cx="80" cy="92" r="21" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={5} />
        <Path d="M95 107l15 15" stroke={color} strokeWidth={7} strokeLinecap="round" />
        <Path d="M106 22l2.4 5.6 5.6 2.4-5.6 2.4-2.4 5.6-2.4-5.6-5.6-2.4 5.6-2.4z" fill={color} />
      </Svg>
    );
  if (name === "bubble")
    return (
      <Svg width={88} height={88} viewBox="0 0 110 110">
        <Rect x="10" y="10" width="90" height="90" rx="20" fill={accent} />
        <Path d="M30 34a8 8 0 0 1 8-8h34a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8H52l-12 11v-11h-2a8 8 0 0 1-8-8z" fill="#ffffff" />
        <SvgText x="55" y="58" textAnchor="middle" fontWeight="800" fontSize="28" fill={accent}>
          ?
        </SvgText>
      </Svg>
    );
  return (
    <Svg width={88} height={88} viewBox="0 0 110 110">
      <Circle cx="55" cy="55" r="44" fill={color} fillOpacity={0.12} />
      <Path d="M34 62c0-12 6-20 17-24l3 6c-6 3-9 7-9 12h8v16H34zm28 0c0-12 6-20 17-24l3 6c-6 3-9 7-9 12h8v16H62z" fill={color} />
    </Svg>
  );
}
