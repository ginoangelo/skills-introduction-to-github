import { useColorScheme } from "react-native";

// Sunset, light touch: warm white ground, violet lead, peach and butter cards, ink pills.
const light = {
  bg: "#fffaf6",
  surface: "#ffffff",
  surface2: "#f6efe9",
  ink: "#1b1320",
  ink2: "#6a5f6f",
  line: "#eee3da",
  brand: "#7a3ed6",
  peach: "#ffe3d3",
  butter: "#fff0bf",
  mist: "#f2eaff",
  markAccent: "#ffb48a",
  tagBg: "#ffe9a3",
  onColor: "#ffffff",
  onColorInk: "#1b1320",
  pill: "#1b1320",
  pillInk: "#ffffff",
  likely: "#d9412f",
  possibly: "#c97a00",
  unlikely: "#1f9460",
  unknown: "#857b8a",
  scheme: "light" as "light" | "dark",
};

const dark: typeof light = {
  bg: "#120d16",
  surface: "#1b1520",
  surface2: "#261e2c",
  ink: "#f7f1ee",
  ink2: "#b3a8b7",
  line: "#322839",
  brand: "#8f57ea",
  peach: "#3b2520",
  butter: "#362d16",
  mist: "#261b3a",
  markAccent: "#ffb48a",
  tagBg: "#ffe9a3",
  onColor: "#ffffff",
  onColorInk: "#1b1320",
  pill: "#f7f1ee",
  pillInk: "#1b1320",
  likely: "#ff6d58",
  possibly: "#f2a83a",
  unlikely: "#4cc483",
  unknown: "#a196a6",
  scheme: "dark",
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === "dark" ? dark : light;
}

export const fonts = {
  display: "PlusJakartaSans_800ExtraBold",
  displayBold: "PlusJakartaSans_700Bold",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
};

export const space = { gutter: 20, section: 30, card: 22, radius: 20 };

export function verdictColor(t: Theme, verdict: string): string {
  switch (verdict) {
    case "Likely":
      return t.likely;
    case "Possibly":
      return t.possibly;
    case "Unlikely":
      return t.unlikely;
    default:
      return t.unknown;
  }
}
