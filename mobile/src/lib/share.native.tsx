import { useEffect, type ReactNode } from "react";
import { ShareIntentProvider, useShareIntentContext } from "expo-share-intent";
import { useStore } from "./store";
import { startFromUri } from "./pick";

export function ShareProvider({ children }: { children: ReactNode }) {
  return <ShareIntentProvider>{children}</ShareIntentProvider>;
}

/** When a screenshot is shared to Subtext from another app, open it in the context step. */
export function ShareHandler() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();
  const { setPending } = useStore();
  useEffect(() => {
    if (!hasShareIntent) return;
    const file = shareIntent.files?.find((f) => f.mimeType?.startsWith("image/"));
    if (file) startFromUri(file.path, setPending, file.width ?? undefined, file.height ?? undefined);
    resetShareIntent();
  }, [hasShareIntent, shareIntent, resetShareIntent, setPending]);
  return null;
}
