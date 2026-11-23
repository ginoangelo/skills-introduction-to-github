// Waitlist signups from the landing page. Stores only the email, when it was added, and where it came from.
import { ConditionalCheckFailedException, DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

export interface WaitlistStore {
  /** Add an email. Returns false if it was already on the list. */
  add(email: string, source: string): Promise<boolean>;
}

export class DynamoWaitlist implements WaitlistStore {
  constructor(private table: string, private client = new DynamoDBClient({})) {}

  async add(email: string, source: string): Promise<boolean> {
    try {
      await this.client.send(
        new PutItemCommand({
          TableName: this.table,
          Item: { email: { S: email }, createdAt: { S: new Date().toISOString() }, source: { S: source || "direct" } },
          ConditionExpression: "attribute_not_exists(email)",
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
export class MemoryWaitlist implements WaitlistStore {
  readonly emails = new Map<string, { createdAt: string; source: string }>();
  async add(email: string, source: string): Promise<boolean> {
    if (this.emails.has(email)) return false;
    this.emails.set(email, { createdAt: new Date().toISOString(), source: source || "direct" });
    return true;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Lowercased, trimmed email, or null when it doesn't look like an address. */
export function cleanEmail(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const email = v.trim().toLowerCase();
  if (email.length < 6 || email.length > 254 || !EMAIL_RE.test(email)) return null;
  return email;
}
