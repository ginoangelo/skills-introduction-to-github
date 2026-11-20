import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import Purchases, { type CustomerInfo, type PurchasesPackage } from "react-native-purchases";
import { getDeviceId } from "./api";
import { ENTITLEMENT, PREVIEW_MESSAGE, type Billing, type BuyResult, type PlanKind } from "./billing.types";

// RevenueCat's public SDK keys, one per store. They are safe to ship in the app.
// Without a key for this platform, the app keeps the preview behavior.
const KEY = Platform.OS === "ios" ? process.env.EXPO_PUBLIC_RC_IOS_KEY : process.env.EXPO_PUBLIC_RC_ANDROID_KEY;

const hasPro = (info: CustomerInfo | null | undefined) => Boolean(info?.entitlements.active[ENTITLEMENT]);

const BillingContext = createContext<Billing | null>(null);

export function BillingProvider({ children }: { children: ReactNode }) {
  const [configured, setConfigured] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [packages, setPackages] = useState<Record<PlanKind, PurchasesPackage | null>>({ monthly: null, annual: null });

  useEffect(() => {
    if (!KEY) return;
    let alive = true;
    const onUpdate = (info: CustomerInfo) => alive && setIsPro(hasPro(info));
    (async () => {
      try {
        // The install ID doubles as the RevenueCat user, so the decode service can check Pro for the same ID.
        Purchases.configure({ apiKey: KEY, appUserID: await getDeviceId() });
        Purchases.addCustomerInfoUpdateListener(onUpdate);
        if (!alive) return;
        setConfigured(true);
        setIsPro(hasPro(await Purchases.getCustomerInfo()));
        const current = (await Purchases.getOfferings()).current;
        if (alive) setPackages({ monthly: current?.monthly ?? null, annual: current?.annual ?? null });
      } catch {
        // Store unavailable (simulator without a store account, no network). Free features keep working.
      }
    })();
    return () => {
      alive = false;
      Purchases.removeCustomerInfoUpdateListener(onUpdate);
    };
  }, []);

  const buy = useCallback(
    async (kind: PlanKind): Promise<BuyResult> => {
      if (!configured) return { ok: false, message: PREVIEW_MESSAGE };
      const pkg = packages[kind];
      if (!pkg) return { ok: false, message: "This plan isn't available right now. Try again in a moment." };
      try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        const pro = hasPro(customerInfo);
        setIsPro(pro);
        return pro ? { ok: true } : { ok: false, message: "The purchase went through, but Pro isn't active yet. Tap Restore purchases." };
      } catch (e) {
        if ((e as { userCancelled?: boolean | null }).userCancelled) return { ok: false, cancelled: true };
        return { ok: false, message: "The purchase didn't go through. You weren't charged. Try again." };
      }
    },
    [configured, packages],
  );

  const restore = useCallback(async (): Promise<BuyResult> => {
    if (!configured) return { ok: false, message: "Restore purchases connects with store billing before launch." };
    try {
      const pro = hasPro(await Purchases.restorePurchases());
      setIsPro(pro);
      return pro ? { ok: true, message: "Pro is restored." } : { ok: false, message: "No Pro subscription was found for this account." };
    } catch {
      return { ok: false, message: "Couldn't reach the store. Try again." };
    }
  }, [configured]);

  const value = useMemo<Billing>(
    () => ({
      configured,
      isPro,
      prices: { monthly: packages.monthly?.product.priceString ?? null, annual: packages.annual?.product.priceString ?? null },
      buy,
      restore,
    }),
    [configured, isPro, packages, buy, restore],
  );
  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling(): Billing {
  const b = useContext(BillingContext);
  if (!b) throw new Error("useBilling must be used inside BillingProvider");
  return b;
}
