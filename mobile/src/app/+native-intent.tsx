import { getShareExtensionKey } from "expo-share-intent";

// A screenshot shared to Subtext arrives as a deep link. Send it to Home; the share handler picks it up.
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    if (path.includes(`dataUrl=${getShareExtensionKey()}`)) return "/";
    return path;
  } catch {
    return "/";
  }
}
