import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';

export const MODES = ['surface', 'low', 'submerged', 'ninja'] as const;
export type Progress = { done: Record<string, boolean>; mode: (typeof MODES)[number]; updatedAt: string };

export type ProgressStore = {
  get: (userId: string) => Promise<Progress | null>;
  put: (userId: string, progress: Progress) => Promise<void>;
  delete: (userId: string) => Promise<void>;
};

const FIX_ID = /^[a-z0-9-]{1,64}$/;
const MAX_FIXES = 200;

const json = (statusCode: number, body?: unknown): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  body: body === undefined ? '' : JSON.stringify(body),
});

/** Validates a PUT body. Returns the clean progress or an error message. */
export function parseProgress(raw: unknown): Omit<Progress, 'updatedAt'> | string {
  if (!raw || typeof raw !== 'object') return 'Body must be a JSON object.';
  const { done, mode } = raw as { done?: unknown; mode?: unknown };
  if (typeof mode !== 'string' || !(MODES as readonly string[]).includes(mode)) return 'Unknown mode.';
  if (!done || typeof done !== 'object' || Array.isArray(done)) return '"done" must be an object.';
  const entries = Object.entries(done as Record<string, unknown>);
  if (entries.length > MAX_FIXES) return 'Too many fixes.';
  const clean: Record<string, boolean> = {};
  for (const [id, value] of entries) {
    if (!FIX_ID.test(id) || typeof value !== 'boolean') return `Invalid fix "${id.slice(0, 64)}".`;
    if (value) clean[id] = true;
  }
  return { done: clean, mode: mode as Progress['mode'] };
}

/**
 * Signed-in endpoints (API Gateway checks the Cognito token before this runs):
 *   GET    /me/progress   → saved fix progress + privacy mode
 *   PUT    /me/progress   → replace it
 *   DELETE /me            → delete everything Veil stores for this user
 */
export function makeHandler(store: ProgressStore, now: () => Date = () => new Date()) {
  return async (event: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
    const userId = event.requestContext.authorizer?.jwt?.claims?.sub;
    if (typeof userId !== 'string' || !userId) return json(401, { message: 'Sign in again.' });

    try {
      switch (event.routeKey) {
        case 'GET /me/progress': {
          const progress = await store.get(userId);
          return json(200, progress ?? { done: {}, mode: 'surface', updatedAt: null });
        }
        case 'PUT /me/progress': {
          let body: unknown;
          try {
            const raw = event.isBase64Encoded ? Buffer.from(event.body ?? '', 'base64').toString('utf8') : event.body;
            body = JSON.parse(raw ?? '');
          } catch {
            return json(400, { message: 'Body must be JSON.' });
          }
          const parsed = parseProgress(body);
          if (typeof parsed === 'string') return json(400, { message: parsed });
          const progress: Progress = { ...parsed, updatedAt: now().toISOString() };
          await store.put(userId, progress);
          return json(200, progress);
        }
        case 'DELETE /me':
          await store.delete(userId);
          return json(204);
        default:
          return json(404, { message: 'Not found.' });
      }
    } catch (err) {
      console.error('me failed:', err instanceof Error ? err.message : 'unknown error');
      return json(500, { message: 'Something went wrong. Try again.' });
    }
  };
}

export function dynamoProgressStore(tableName: string, client = DynamoDBDocumentClient.from(new DynamoDBClient({}))): ProgressStore {
  const key = (userId: string) => ({ pk: `user#${userId}` });
  return {
    async get(userId) {
      const out = await client.send(new GetCommand({ TableName: tableName, Key: key(userId) }));
      if (!out.Item) return null;
      const { done, mode, updatedAt } = out.Item as Progress;
      return { done, mode, updatedAt };
    },
    async put(userId, progress) {
      await client.send(new PutCommand({ TableName: tableName, Item: { ...key(userId), ...progress } }));
    },
    async delete(userId) {
      await client.send(new DeleteCommand({ TableName: tableName, Key: key(userId) }));
    },
  };
}

export const handler = makeHandler(dynamoProgressStore(process.env.USER_TABLE_NAME ?? ''));
