// Daily decode limits, stored as small counters in DynamoDB that expire on their own.
import { ConditionalCheckFailedException, DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

export interface Limiter {
  /** Count one decode against the key. Returns false when the key is already at its cap. */
  take(key: string, cap: number): Promise<boolean>;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export class DynamoLimiter implements Limiter {
  constructor(private table: string, private client = new DynamoDBClient({})) {}

  async take(key: string, cap: number): Promise<boolean> {
    const expiresAt = Math.floor(Date.now() / 1000) + 2 * 24 * 3600;
    try {
      await this.client.send(
        new UpdateItemCommand({
          TableName: this.table,
          Key: { pk: { S: `${key}#${today()}` } },
          UpdateExpression: "ADD #c :one SET expiresAt = :exp",
          ConditionExpression: "attribute_not_exists(#c) OR #c < :cap",
          ExpressionAttributeNames: { "#c": "count" },
          ExpressionAttributeValues: { ":one": { N: "1" }, ":cap": { N: String(cap) }, ":exp": { N: String(expiresAt) } },
        }),
      );
      return true;
    } catch (e) {
      if (e instanceof ConditionalCheckFailedException) return false;
      throw e;
    }
  }
}

/** For local runs and tests only. */
export class MemoryLimiter implements Limiter {
  private counts = new Map<string, number>();
  async take(key: string, cap: number): Promise<boolean> {
    const k = `${key}#${today()}`;
    const n = this.counts.get(k) ?? 0;
    if (n >= cap) return false;
    this.counts.set(k, n + 1);
    return true;
  }
}

/** Count a flagged read by day and reason. No screenshot, context, or read text is stored. */
export async function recordFlag(table: string | undefined, reason: string, verdict: string, client = new DynamoDBClient({})): Promise<void> {
  if (!table) return;
  const expiresAt = Math.floor(Date.now() / 1000) + 180 * 24 * 3600;
  await client.send(
    new UpdateItemCommand({
      TableName: table,
      Key: { pk: { S: `flag#${today()}#${reason}#${verdict}` } },
      UpdateExpression: "ADD #c :one SET expiresAt = :exp",
      ExpressionAttributeNames: { "#c": "count" },
      ExpressionAttributeValues: { ":one": { N: "1" }, ":exp": { N: String(expiresAt) } },
    }),
  );
}
