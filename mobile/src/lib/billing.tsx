import { createContext, useContext, type ReactNode } from "react";
import { PREVIEW_MESSAGE, type Billing } from "./billing.types";

// Web preview and builds without store billing: Plans shows draft prices and explains checkout.
const preview: Billing = {
  configured: false,
  isPro: false,
  prices: { monthly: null, annual: null },
  buy: async () => ({ ok: false, message: PREVIEW_MESSAGE }),
  restore: async () => ({ ok: false, message: "Restore purchases connects with store billing before launch." }),
};

const BillingContext = createContext<Billing>(preview);

export function BillingProvider({ children }: { children: ReactNode }) {
  return <BillingContext.Provider value={preview}>{children}</BillingContext.Provider>;
}

export function useBilling(): Billing {
  return useContext(BillingContext);
}
