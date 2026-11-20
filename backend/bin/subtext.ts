import { App } from "aws-cdk-lib";
import { SubtextStack } from "../lib/subtext-stack.js";

const app = new App();
const reserved = app.node.tryGetContext("reservedConcurrency");

new SubtextStack(app, "Subtext", {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION ?? "us-east-1" },
  model: app.node.tryGetContext("model"),
  freeDailyCap: Number(app.node.tryGetContext("freeDailyCap") ?? 2),
  ipDailyCap: Number(app.node.tryGetContext("ipDailyCap") ?? 40),
  reservedConcurrency: reserved ? Number(reserved) : undefined,
  description: "Subtext decode service: screenshot in, decoded read out. Stores no post content.",
});
