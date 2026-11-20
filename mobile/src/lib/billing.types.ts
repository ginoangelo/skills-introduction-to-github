// Shared shape of the billing module. iPhone and Android use billing.native.tsx (RevenueCat);
// web and builds without RevenueCat keys use billing.tsx, which keeps the preview behavior.

export type PlanKind = "monthly" | "annual";

export interface BuyResult {
  ok: boolean;
  cancelled?: boolean;
  message?: string;
}

export interface Billing {
  /** True when RevenueCat is set up for this build and store. */
  configured: boolean;
  /** True when this person has an active Pro subscription. */
  isPro: boolean;
  /** Store prices as the person will be charged, like "$9.99". Null until loaded or when not configured. */
  prices: Record<PlanKind, string | null>;
  buy: (kind: PlanKind) => Promise<BuyResult>;
  restore: () => Promise<BuyResult>;
}

/** The RevenueCat entitlement that unlocks Pro. Create it with this exact name. */
export const ENTITLEMENT = "pro";

export const PREVIEW_MESSAGE = "Checkout connects with App Store and Google Play billing before launch.";
