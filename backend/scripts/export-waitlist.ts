// Print the waitlist as CSV: npm run waitlist:export > waitlist.csv
// Uses your AWS sign-in. Finds the table from the deployed "Aimed" stack unless WAITLIST_TABLE is set.
import { CloudFormationClient, DescribeStacksCommand } from "@aws-sdk/client-cloudformation";
import { DynamoDBClient, ScanCommand, type AttributeValue } from "@aws-sdk/client-dynamodb";

async function tableName(): Promise<string> {
  if (process.env.WAITLIST_TABLE) return process.env.WAITLIST_TABLE;
  const out = await new CloudFormationClient({}).send(new DescribeStacksCommand({ StackName: "Aimed" }));
  const name = out.Stacks?.[0]?.Outputs?.find((o) => o.OutputKey === "WaitlistTableName")?.OutputValue;
  if (!name) throw new Error("Couldn't find the waitlist table. Deploy the stack first, or set WAITLIST_TABLE.");
  return name;
}

const csv = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

const table = await tableName();
const db = new DynamoDBClient({});
const rows: string[][] = [];
let start: Record<string, AttributeValue> | undefined;
do {
  const page = await db.send(new ScanCommand({ TableName: table, ExclusiveStartKey: start }));
  for (const item of page.Items ?? []) rows.push([item.email?.S ?? "", item.createdAt?.S ?? "", item.source?.S ?? ""]);
  start = page.LastEvaluatedKey;
} while (start);
rows.sort((a, b) => a[1].localeCompare(b[1]));
console.log(["email", "signed_up", "source"].join(","));
for (const r of rows) console.log(r.map(csv).join(","));
console.error(`${rows.length} signups`);
