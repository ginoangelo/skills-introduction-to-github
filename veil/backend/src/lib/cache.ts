import { createHash } from 'node:crypto';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

import type { ScanReport } from './types';

export type ScanCache = {
  get: (email: string) => Promise<ScanReport | null>;
  put: (email: string, report: ScanReport) => Promise<void>;
};

const TTL_SECONDS = 24 * 60 * 60;

/** The email itself is never stored: rows are keyed by a SHA-256 hash of it. */
export const cacheKey = (email: string) => 'scan#' + createHash('sha256').update(email).digest('hex');

/**
 * 24-hour cache of scan results in DynamoDB. Saves breach-API calls (which cost money)
 * and limits how often one address can be looked up. DynamoDB's TTL deletes old rows.
 */
export function dynamoScanCache(tableName: string, client = DynamoDBDocumentClient.from(new DynamoDBClient({}))): ScanCache {
  return {
    async get(email) {
      const out = await client.send(new GetCommand({ TableName: tableName, Key: { pk: cacheKey(email) } }));
      const item = out.Item as { report?: ScanReport; ttl?: number } | undefined;
      if (!item?.report || (item.ttl ?? 0) < Math.floor(Date.now() / 1000)) return null;
      return item.report;
    },
    async put(email, report) {
      await client.send(
        new PutCommand({
          TableName: tableName,
          Item: { pk: cacheKey(email), report, ttl: Math.floor(Date.now() / 1000) + TTL_SECONDS },
        }),
      );
    },
  };
}
