import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from "aws-cdk-lib";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import type { Construct } from "constructs";

const here = path.dirname(fileURLToPath(import.meta.url));

export interface SubtextStackProps extends StackProps {
  /** Model used for decodes. */
  model?: string;
  /** Free decodes per device per day. */
  freeDailyCap?: number;
  /** Decodes per network (IP) per day, a backstop against reinstall abuse. */
  ipDailyCap?: number;
  /** Optional hard ceiling on concurrent decodes. Leave unset on new AWS accounts with low concurrency quotas. */
  reservedConcurrency?: number;
}

export class SubtextStack extends Stack {
  constructor(scope: Construct, id: string, props: SubtextStackProps = {}) {
    super(scope, id, props);

    // Daily usage counters. Items expire on their own after two days.
    const usage = new dynamodb.TableV2(this, "Usage", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      billing: dynamodb.Billing.onDemand(),
      timeToLiveAttribute: "expiresAt",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // The Anthropic API key. Set its value once after the first deploy (see backend/README.md).
    const apiKey = new secretsmanager.Secret(this, "AnthropicApiKey", {
      secretName: "subtext/anthropic-api-key",
      description: "Anthropic API key used by the Subtext decode service.",
    });

    const fn = new NodejsFunction(this, "Decode", {
      entry: path.join(here, "..", "src", "handler.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 1024,
      timeout: Duration.seconds(90),
      reservedConcurrentExecutions: props.reservedConcurrency,
      environment: {
        TABLE_NAME: usage.tableName,
        SECRET_ID: apiKey.secretArn,
        MODEL: props.model ?? "claude-opus-5-5",
        FREE_DAILY_CAP: String(props.freeDailyCap ?? 2),
        IP_DAILY_CAP: String(props.ipDailyCap ?? 40),
      },
      bundling: {
        format: OutputFormat.ESM,
        target: "node22",
        minify: true,
        sourceMap: true,
        banner: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
      },
      logGroup: new logs.LogGroup(this, "DecodeLogs", { retention: logs.RetentionDays.ONE_MONTH, removalPolicy: RemovalPolicy.DESTROY }),
    });
    usage.grantReadWriteData(fn);
    apiKey.grantRead(fn);

    // Public HTTPS endpoint for the app. Function URLs allow long decodes (no 30-second gateway limit).
    const url = fn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
        allowedMethods: [lambda.HttpMethod.GET, lambda.HttpMethod.POST],
        allowedHeaders: ["content-type", "x-subtext-device"],
        maxAge: Duration.hours(1),
      },
    });

    // Alert-ready alarm: more than 5 failed decodes in 5 minutes.
    new cloudwatch.Alarm(this, "DecodeErrors", {
      metric: fn.metricErrors({ period: Duration.minutes(5) }),
      threshold: 5,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: "Subtext decode function is failing.",
    });

    new CfnOutput(this, "DecodeUrl", { value: url.url, description: "Put this in the app as EXPO_PUBLIC_API_URL (without the trailing slash)." });
    new CfnOutput(this, "ApiKeySecretName", { value: apiKey.secretName });
  }
}
