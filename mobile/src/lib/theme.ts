import { useColorScheme } from "react-native";

// Subtext brand tokens. Same palette as the approved web design.
const light = {
  bg: "#ffffff",
  surface: "#ffffff",
  surface2: "#f2f3f7",
  ink: "#0a0a0f",
  ink2: "#5a5d6b",
  line: "#e6e7ee",
  brand: "#1e4dff",
  plum: "#8a2858",
  mist: "#e6effc",
  onColor: "#ffffff",
  onColorInk: "#0a0a0f",
  pill: "#0a0a0f",
  pillInk: "#ffffff",
  likely: "#d13b2e",
  possibly: "#d98200",
  unlikely: "#1f9d55",
  unknown: "#767a88",
  scheme: "light" as "light" | "dark",
};

const dark: typeof light = {
  bg: "#0a0b0f",
  surface: "#14161c",
  surface2: "#1d2029",
  ink: "#f4f5f8",
  ink2: "#a2a6b4",
  line: "#272b35",
  brand: "#3d66ff",
  plum: "#9e3468",
  mist: "#142139",
  onColor: "#ffffff",
  onColorInk: "#0a0a0f",
  pill: "#f4f5f8",
  pillInk: "#0a0a0f",
  likely: "#ff6a57",
  possibly: "#f2a531",
  unlikely: "#45c27c",
  unknown: "#9a9eac",
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
