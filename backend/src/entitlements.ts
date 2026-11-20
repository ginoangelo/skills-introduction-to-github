// Checks whether an install has an active Pro subscription, using RevenueCat's REST API.
// The app configures RevenueCat with the install ID as its user ID, so the same ID works here.
// Without a RevenueCat secret key, everyone is treated as Free.
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

export const ENTITLEMENT = "pro";
const CACHE_MS = 10 * 60 * 1000;

export type ProCheck = (installId: string) => Promise<boolean>;

let secretKey: string | null | undefined;
const cache = new Map<string, { pro: boolean; until: number }>();

async function getSecretKey(): Promise<string | null> {
  if (secretKey !== undefined) return secretKey;
  let key = process.env.REVENUECAT_SECRET_KEY ?? null;
  if (!key && process.env.RC_SECRET_ID) {
    try {
      const out = await new SecretsManagerClient({}).send(new GetSecretValueCommand({ SecretId: process.env.RC_SECRET_ID }));
      key = out.SecretString?.trim() ?? null;
    } catch {
      key = null;
    }
  }
  secretKey = key && key !== "REPLACE_ME" ? key : null;
  return secretKey;
}

/** True when RevenueCat reports an active "pro" entitlement. Any failure counts as Free. */
export const revenueCatProCheck: ProCheck = async (installId) => {
  const hit = cache.get(installId);
  if (hit && hit.until > Date.now()) return hit.pro;
  const key = await getSecretKey();
  if (!key) return false;
  let pro = false;
  try {
    const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(installId)}`, {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const body = (await res.json()) as { subscriber?: { entitlements?: Record<string, { expires_date?: string | null }> } };
      const ent = body.subscriber?.entitlements?.[ENTITLEMENT];
      pro = Boolean(ent) && (ent!.expires_date == null || Date.parse(ent!.expires_date) > Date.now());
    } else {
      console.error(JSON.stringify({ event: "entitlement", ok: false, status: res.status }));
    }
  } catch (err) {
    console.error(JSON.stringify({ event: "entitlement", ok: false, error: err instanceof Error ? err.name : "unknown" }));
  }
  cache.set(installId, { pro, until: Date.now() + CACHE_MS });
  return pro;
};
