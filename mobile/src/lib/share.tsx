import type { ReactNode } from "react";

// Web has no share sheet target. Native builds use share.native.tsx.
export function ShareProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function ShareHandler() {
  return null;
}
