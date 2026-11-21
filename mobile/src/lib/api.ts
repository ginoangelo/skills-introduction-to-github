import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { exampleWhatNow } from "./example";
import { VERDICTS, type DecodeResult, type Tone, type WhatNowKind, type WhatNowResult } from "./types";

/** Set EXPO_PUBLIC_API_URL to the AWS decode URL. Without it the app runs in example mode. */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/+$/, "");
export const isLive = API_URL.length > 0;

export class DecodeError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

const DEVICE_KEY = "aimed.device.v1";
let deviceId: string | null = null;

/** A random install ID, used only for the daily free-tier cap. Not tied to the person. */
export async function getDeviceId(): Promise<string> {
  if (deviceId) return deviceId;
  try {
    const stored = await AsyncStorage.getItem(DEVICE_KEY);
    if (stored) return (deviceId = stored);
  } catch {}
  deviceId = Crypto.randomUUID();
  try {
    await AsyncStorage.setItem(DEVICE_KEY, deviceId);
  } catch {}
  return deviceId;
}

function normalize(r: DecodeResult, hadContext: boolean): DecodeResult {
  const verdict = VERDICTS.includes(r.aimed_at_you?.verdict) ? r.aimed_at_you.verdict : "Not enough to tell";
  return {
    ...r,
    evidence: Array.isArray(r.evidence) ? r.evidence : [],
    other_readings: Array.isArray(r.other_readings) ? r.other_readings : [],
    aimed_at_you: {
      verdict: !hadContext && verdict === "Likely" ? "Possibly" : verdict,
      reason: r.aimed_at_you?.reason ?? "",
    },
  };
}

export async function decodeScreenshot(base64: string, context: string, signal?: AbortSignal): Promise<DecodeResult> {
  const id = await getDeviceId();
  let res: Response;
  try {
    res = await fetch(`${API_URL}/decode`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Aimed-Device": id },
      body: JSON.stringify({ image: base64, mediaType: "image/jpeg", context }),
      signal,
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw new DecodeError("cancelled", "");
    throw new DecodeError("network", "Couldn't reach Aimed. Check your connection and try again.");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = typeof body.code === "string" ? body.code : res.status === 429 ? "rate_limited" : res.status >= 500 ? "server" : "bad_request";
    throw new DecodeError(code, body.error || "Something went wrong decoding that screenshot. Try again.");
  }
  return normalize(body.result as DecodeResult, context.length > 0);
}

const KINDS: WhatNowKind[] = ["let_it_go", "check_in", "talk_it_through"];

/** "What now?": three calm next steps for a read. Sends the read's text, never the screenshot. */
export async function getWhatNow(read: DecodeResult, context: string, tone: Tone, live: boolean): Promise<WhatNowResult> {
  if (!live || !isLive) return exampleWhatNow(read.aimed_at_you.verdict, tone);
  const id = await getDeviceId();
  let res: Response;
  try {
    res = await fetch(`${API_URL}/whatnow`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Aimed-Device": id },
      body: JSON.stringify({ literal: read.literal, meaning: read.meaning, verdict: read.aimed_at_you.verdict, reason: read.aimed_at_you.reason, context, tone }),
    });
  } catch {
    throw new DecodeError("network", "Couldn't reach Aimed. Check your connection and try again.");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = typeof body.code === "string" ? body.code : res.status === 429 ? "rate_limited" : "server";
    throw new DecodeError(code, body.error || "Couldn't get suggestions. Try again.");
  }
  const r = body.result as WhatNowResult;
  return {
    ...r,
    recommended: KINDS.includes(r.recommended) ? r.recommended : "let_it_go",
    options: Array.isArray(r.options) ? r.options.filter((o) => KINDS.includes(o.kind)) : [],
  };
}

export type FlagReason = "wrong" | "offensive" | "biased" | "other";

/** Report a read as off. Sends only the reason and the verdict, never the screenshot or the read. */
export async function flagRead(reason: FlagReason, verdict: string): Promise<void> {
  if (!isLive) return;
  const id = await getDeviceId();
  const res = await fetch(`${API_URL}/flag`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Aimed-Device": id },
    body: JSON.stringify({ reason, verdict }),
  }).catch(() => null);
  if (!res || !res.ok) throw new DecodeError("flag_failed", "Couldn't send that report. Try again.");
}

const CONSENT_KEY = "aimed.ai-consent.v1";
/** Apple and Google expect a clear yes before personal data goes to an outside AI. */
export async function hasAiConsent(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CONSENT_KEY)) === "yes";
  } catch {
    return false;
  }
}
export async function giveAiConsent(): Promise<void> {
  try {
    await AsyncStorage.setItem(CONSENT_KEY, "yes");
  } catch {}
}
