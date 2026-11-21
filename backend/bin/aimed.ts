import { App } from "aws-cdk-lib";
import { AimedStack } from "../lib/aimed-stack.js";

const app = new App();
const reserved = app.node.tryGetContext("reservedConcurrency");

new AimedStack(app, "Aimed", {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION ?? "us-east-1" },
  model: app.node.tryGetContext("model"),
  freeDailyCap: Number(app.node.tryGetContext("freeDailyCap") ?? 2),
  proDailyCap: Number(app.node.tryGetContext("proDailyCap") ?? 30),
  ipDailyCap: Number(app.node.tryGetContext("ipDailyCap") ?? 100),
  reservedConcurrency: reserved ? Number(reserved) : undefined,
  description: "Aimed decode service: screenshot in, decoded read out. Stores no post content.",
});
