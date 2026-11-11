import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

import { dynamoScanCache, type ScanCache } from '../lib/cache';
import { hibpLookup, UpstreamBusyError, type BreachLookup } from '../lib/hibp';
import { fixesForBreaches } from '../lib/report';
import type { ScanReport } from '../lib/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Deps = { lookup: BreachLookup; cache: ScanCache; now?: () => Date };

const json = (statusCode: number, body: unknown): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  body: JSON.stringify(body),
});

/**
 * POST /scan  { "email": "you@example.com" }  →  ScanReport
 * Never logs or stores the email address in plain text.
 */
export function makeHandler(deps: Deps) {
  return async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    let email: unknown;
    try {
      const raw = event.isBase64Encoded ? Buffer.from(event.body ?? '', 'base64').toString('utf8') : event.body;
      email = (JSON.parse(raw ?? '{}') as { email?: unknown }).email;
    } catch {
      return json(400, { message: 'Request body must be JSON like {"email": "you@example.com"}.' });
    }
    if (typeof email !== 'string' || email.length > 254 || !EMAIL_RE.test(email.trim())) {
      return json(400, { message: 'Enter a valid email address.' });
    }
    const normalized = email.trim().toLowerCase();

    try {
      const cached = await deps.cache.get(normalized);
      if (cached) return json(200, cached);

      const breaches = await deps.lookup(normalized);
      const report: ScanReport = {
        scannedAt: (deps.now?.() ?? new Date()).toISOString(),
        breaches,
        fixes: fixesForBreaches(breaches),
      };
      await deps.cache.put(normalized, report);
      return json(200, report);
    } catch (err) {
      if (err instanceof UpstreamBusyError) {
        return json(503, { message: 'The breach database is busy. Try again in a minute.' });
      }
      console.error('scan failed:', err instanceof Error ? err.message : 'unknown error');
      return json(502, { message: 'Scan failed. Try again shortly.' });
    }
  };
}

let apiKey: Promise<string> | undefined;
const ssm = new SSMClient({});

/** Reads the HIBP API key from SSM Parameter Store once per Lambda container. */
function getApiKey(): Promise<string> {
  apiKey ??= ssm
    .send(new GetParameterCommand({ Name: process.env.HIBP_KEY_PARAM, WithDecryption: true }))
    .then((out) => {
      const value = out.Parameter?.Value;
      if (!value) throw new Error('HIBP API key parameter is empty');
      return value;
    })
    .catch((err) => {
      apiKey = undefined;
      throw err;
    });
  return apiKey;
}

export const handler = makeHandler({
  lookup: hibpLookup(getApiKey),
  cache: dynamoScanCache(process.env.TABLE_NAME ?? ''),
});
