import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import type { Construct } from "constructs";

const here = path.dirname(fileURLToPath(import.meta.url));

export interface AimedStackProps extends StackProps {
  /** Model used for decodes. */
  model?: string;
  /** Model used for "What now?" suggestions. Defaults to the decode model. */
  whatNowModel?: string;
  /** Free decodes per device per day. */
  freeDailyCap?: number;
  /** Pro decodes per device per day. */
  proDailyCap?: number;
  /** Decodes per network (IP) per day, a backstop against reinstall abuse. */
  ipDailyCap?: number;
  /** Optional hard ceiling on concurrent decodes. Leave unset on new AWS accounts with low concurrency quotas. */
  reservedConcurrency?: number;
  /** Optional landing page domain, like "getaimed.com". Needs certificateArn too. */
  domainName?: string;
  /** ARN of an ACM certificate for domainName, created in us-east-1 (CloudFront's requirement). */
  certificateArn?: string;
}

export class AimedStack extends Stack {
  constructor(scope: Construct, id: string, props: AimedStackProps = {}) {
    super(scope, id, props);

    // Daily usage counters. Items expire on their own after two days.
    const usage = new dynamodb.TableV2(this, "Usage", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      billing: dynamodb.Billing.onDemand(),
      timeToLiveAttribute: "expiresAt",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Landing page waitlist. Kept even if the stack is deleted, because the list is valuable.
    const waitlist = new dynamodb.TableV2(this, "Waitlist", {
      partitionKey: { name: "email", type: dynamodb.AttributeType.STRING },
      billing: dynamodb.Billing.onDemand(),
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // The Anthropic API key. Set its value once after the first deploy (see backend/README.md).
    const apiKey = new secretsmanager.Secret(this, "AnthropicApiKey", {
      secretName: "aimed/anthropic-api-key",
      description: "Anthropic API key used by the Aimed decode service.",
    });

    // RevenueCat secret key, used to check who has Pro. Set its value after the first deploy.
    const rcKey = new secretsmanager.Secret(this, "RevenueCatSecretKey", {
      secretName: "aimed/revenuecat-secret-key",
      description: "RevenueCat secret API key, used by the decode service to check Pro subscriptions.",
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
        WAITLIST_TABLE: waitlist.tableName,
        SECRET_ID: apiKey.secretArn,
        MODEL: props.model ?? "claude-opus-5-5",
        WHATNOW_MODEL: props.whatNowModel ?? props.model ?? "claude-opus-5-5",
        WHATNOW_FREE_CAP: "1",
        WHATNOW_PRO_CAP: "100",
        RC_SECRET_ID: rcKey.secretArn,
        FREE_DAILY_CAP: String(props.freeDailyCap ?? 2),
        PRO_DAILY_CAP: String(props.proDailyCap ?? 30),
        IP_DAILY_CAP: String(props.ipDailyCap ?? 100),
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
    waitlist.grant(fn, "dynamodb:PutItem");
    apiKey.grantRead(fn);
    rcKey.grantRead(fn);

    // Public HTTPS endpoint for the app. Function URLs allow long decodes (no 30-second gateway limit).
    const url = fn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
        allowedMethods: [lambda.HttpMethod.GET, lambda.HttpMethod.POST],
        allowedHeaders: ["content-type", "x-aimed-device"],
        maxAge: Duration.hours(1),
      },
    });

    // Landing page: a private S3 bucket behind CloudFront. /api/* goes to the same function,
    // so the signup form posts to its own site.
    const site = new s3.Bucket(this, "LandingSite", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    const apiHeaders = new cloudfront.OriginRequestPolicy(this, "ApiHeaders", {
      comment: "Aimed landing API: forward the visitor's address, not the Host header.",
      headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList("CloudFront-Viewer-Address", "Content-Type"),
      queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.none(),
      cookieBehavior: cloudfront.OriginRequestCookieBehavior.none(),
    });
    const domain = props.domainName && props.certificateArn ? props.domainName : undefined;
    const cdn = new cloudfront.Distribution(this, "LandingCdn", {
      comment: "Aimed landing page",
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(site),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
      },
      additionalBehaviors: {
        "/api/*": {
          origin: new origins.FunctionUrlOrigin(url),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: apiHeaders,
        },
      },
      domainNames: domain ? [domain, `www.${domain}`] : undefined,
      certificate: domain ? acm.Certificate.fromCertificateArn(this, "LandingCert", props.certificateArn!) : undefined,
      errorResponses: [{ httpStatus: 404, responseHttpStatus: 404, responsePagePath: "/index.html" }],
    });
    new s3deploy.BucketDeployment(this, "LandingFiles", {
      sources: [s3deploy.Source.asset(path.join(here, "..", "..", "landing"))],
      destinationBucket: site,
      distribution: cdn,
    });

    // Alert-ready alarm: more than 5 failed decodes in 5 minutes.
    new cloudwatch.Alarm(this, "DecodeErrors", {
      metric: fn.metricErrors({ period: Duration.minutes(5) }),
      threshold: 5,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: "Aimed decode function is failing.",
    });

    new CfnOutput(this, "DecodeUrl", { value: url.url, description: "Put this in the app as EXPO_PUBLIC_API_URL (without the trailing slash)." });
    new CfnOutput(this, "LandingUrl", { value: `https://${cdn.distributionDomainName}`, description: "The landing page. Point your domain here once you have one." });
    new CfnOutput(this, "WaitlistTableName", { value: waitlist.tableName, description: "Where signups are stored. Export with: npm run waitlist:export" });
    new CfnOutput(this, "ApiKeySecretName", { value: apiKey.secretName });
    new CfnOutput(this, "RevenueCatSecretName", { value: rcKey.secretName });
  }
}
