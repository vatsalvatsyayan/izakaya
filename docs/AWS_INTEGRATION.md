# AWS Integration Specification
## AI Factory Digital Twin — Sustainability Operations Dashboard
**Version:** 1.0  
**Prepared for:** Claude Code Cloud Engineer Agent  
**Hackathon:** ShiftSC AI Ethics Hackathon  
**Integration Philosophy:** AWS is integrated as a non-optional layer that makes three capabilities possible that the base project cannot provide: (1) persistent, tamper-evident accountability artifacts, (2) genuinely intelligent AI narrative generation, and (3) proactive alerting that reaches operators outside the browser. The base application continues to run unchanged; AWS services attach at defined seams without altering the simulation engine, 3D frontend, or WebSocket loop.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [AWS Services Used](#2-aws-services-used)
3. [Prerequisites & Environment Setup](#3-prerequisites--environment-setup)
4. [Service 1: Amazon S3 — Immutable Accountability Ledger](#4-service-1-amazon-s3--immutable-accountability-ledger)
5. [Service 2: Amazon Bedrock — AI Sustainability Narrative Engine](#5-service-2-amazon-bedrock--ai-sustainability-narrative-engine)
6. [Service 3: AWS Lambda + API Gateway — Serverless Action Handler](#6-service-3-aws-lambda--api-gateway--serverless-action-handler)
7. [Service 4: Amazon EventBridge + SNS — Proactive Critical Alerting](#7-service-4-amazon-eventbridge--sns--proactive-critical-alerting)
8. [Service 5: Amazon CloudWatch — Custom Sustainability Metrics](#8-service-5-amazon-cloudwatch--custom-sustainability-metrics)
9. [Integration Seams: Where AWS Attaches to Existing Code](#9-integration-seams-where-aws-attaches-to-existing-code)
10. [IAM Roles & Permissions](#10-iam-roles--permissions)
11. [Environment Variables Reference](#11-environment-variables-reference)
12. [Implementation Order & Time Budget](#12-implementation-order--time-budget)
13. [Frontend Changes](#13-frontend-changes)
14. [Demo Talking Points Per Service](#14-demo-talking-points-per-service)
15. [Fallback Behavior If AWS Is Unavailable](#15-fallback-behavior-if-aws-is-unavailable)
16. [Architecture Diagram (Text)](#16-architecture-diagram-text)

---

## 1. Architecture Overview

### What changes vs. the base project

The base project is a self-contained Node.js/Express backend with an in-memory simulation engine and a React/Three.js frontend. Nothing in that architecture is modified. AWS is integrated at three explicit seams:

**Seam A — Action Commit (`POST /api/actions`):** After the existing handler processes an action and appends it to the in-memory `changeLog` array, it additionally calls the AWS Lambda endpoint and writes to S3. This is a fire-and-forget async call that does not block the response to the frontend.

**Seam B — Recommendation Engine:** When the simulation engine generates a new recommendation, it asynchronously calls Bedrock to generate an AI-powered narrative paragraph. This replaces the hardcoded `body` text in the `Recommendation` object for recommendations that have been enriched. Unenriched recommendations fall back to the existing template text.

**Seam C — Critical Alert Threshold (`evaluateAlerts`):** When `evaluateAlerts()` promotes an alert to `critical` severity, it publishes an EventBridge event. EventBridge routes this to an SNS topic that sends an email/SMS notification to the operator.

### What does NOT change

- The WebSocket simulation loop — unchanged
- The 3D frontend — unchanged except for two new UI elements described in Section 13
- The in-memory state model — unchanged; S3 is additive, not a replacement
- All five user flows — unchanged and still fully completable without AWS connectivity
- The Ethical Tradeoff Acknowledgment Modal — unchanged

---

## 2. AWS Services Used

| Service | Role | Why It's Necessary |
|---|---|---|
| **Amazon S3** | Immutable append-only audit ledger for all committed actions | In-memory change log is lost on server restart. S3 provides the "accountability artifact" that the demo narrative promises — a tamper-evident, cloud-persisted record of every ethical decision made. Without this, the change log download is just a local JSON file. |
| **Amazon Bedrock** (Claude Haiku) | Generates natural-language sustainability narratives for recommendations and post-action impact summaries | The base recommendation engine is hardcoded rule-based text. Bedrock replaces `recommendation.body` with genuinely dynamic AI analysis that contextualizes the current simulation state, quantifies community impact, and reasons about tradeoffs — demonstrating that AI assistance in ethical decision-making requires a real language model, not just string templates. |
| **AWS Lambda + API Gateway** | Serverless handler for action commits; independently invocable audit endpoint | Demonstrates energy-efficient compute: action-processing resources are consumed only when an operator makes a decision, with zero idle overhead. Lambda also exposes the audit log as a public-facing endpoint (`GET /audit/logs`) independent of the main Express server. |
| **Amazon EventBridge + SNS** | Publishes critical threshold breach events; routes to SMS/email notification | Critical alerts (GPU temp > 83°C, WUE > 1.8, Carbon spike) currently only appear in-browser. EventBridge + SNS ensures the operator is notified even if the browser tab is closed — a production-realistic requirement for sustainability incident response. |
| **Amazon CloudWatch** | Custom metric namespace `DigitalTwin/Sustainability` tracks ethical decision-making KPIs | Creates an observable record of operator behavior: how many actions were taken, what the cumulative carbon impact was, how many critical alerts fired without operator response. This is the "meta-accountability" layer — monitoring the operator's sustainability stewardship, not just the facility's. |

---

## 3. Prerequisites & Environment Setup

### AWS Account Requirements
- An AWS account with programmatic access (Access Key ID + Secret Access Key)
- Region: **us-east-1** (required for Bedrock model availability; all services should be in the same region)
- Bedrock model access must be explicitly enabled: navigate to AWS Console → Bedrock → Model Access → Request access to **Anthropic Claude Haiku** (`anthropic.claude-haiku-20240307-v1:0`)

### Install AWS SDK in backend

```bash
cd backend   # or wherever your Node.js server lives
npm install @aws-sdk/client-s3 @aws-sdk/client-bedrock-runtime @aws-sdk/client-eventbridge @aws-sdk/client-sns @aws-sdk/client-cloudwatch
```

### Create `.env` additions

Add the following to your backend `.env` file (see Section 11 for full reference):

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
S3_AUDIT_BUCKET_NAME=digital-twin-audit-logs
BEDROCK_MODEL_ID=anthropic.claude-haiku-20240307-v1:0
SNS_CRITICAL_ALERT_TOPIC_ARN=arn:aws:sns:us-east-1:ACCOUNT_ID:DigitalTwinCriticalAlerts
EVENTBRIDGE_BUS_NAME=digital-twin-events
CLOUDWATCH_NAMESPACE=DigitalTwin/Sustainability
AWS_INTEGRATION_ENABLED=true   # set to false to disable all AWS calls without code changes
```

### One-time AWS resource provisioning

Run the following setup script once before starting the server (script location: `backend/scripts/aws-setup.ts`). See Section 3.1 below for the full script.

---

### 3.1 AWS Setup Script

Create `backend/scripts/aws-setup.ts`:

```typescript
import { S3Client, CreateBucketCommand, PutBucketVersioningCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import { SNSClient, CreateTopicCommand, SubscribeCommand } from '@aws-sdk/client-sns';
import { EventBridgeClient, PutRuleCommand, PutTargetsCommand } from '@aws-sdk/client-eventbridge';

const region = process.env.AWS_REGION || 'us-east-1';
const accountId = process.env.AWS_ACCOUNT_ID!;
const operatorEmail = process.env.OPERATOR_ALERT_EMAIL!;  // set this in .env
const operatorPhone = process.env.OPERATOR_ALERT_PHONE;   // optional, E.164 format e.g. +15551234567

async function setup() {
  console.log('Setting up AWS resources for Digital Twin...');

  // --- S3 Bucket ---
  const s3 = new S3Client({ region });
  const bucketName = process.env.S3_AUDIT_BUCKET_NAME!;

  try {
    await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
    console.log(`✓ S3 bucket created: ${bucketName}`);
  } catch (e: any) {
    if (e.name === 'BucketAlreadyOwnedByYou') {
      console.log(`✓ S3 bucket already exists: ${bucketName}`);
    } else throw e;
  }

  // Enable versioning to make the ledger tamper-evident
  await s3.send(new PutBucketVersioningCommand({
    Bucket: bucketName,
    VersioningConfiguration: { Status: 'Enabled' }
  }));
  console.log('✓ S3 versioning enabled (tamper-evident ledger)');

  // Bucket policy: deny object deletion (append-only enforcement)
  const denyDeletePolicy = {
    Version: '2012-10-17',
    Statement: [{
      Sid: 'DenyObjectDeletion',
      Effect: 'Deny',
      Principal: '*',
      Action: ['s3:DeleteObject', 's3:DeleteObjectVersion'],
      Resource: `arn:aws:s3:::${bucketName}/*`
    }]
  };
  await s3.send(new PutBucketPolicyCommand({
    Bucket: bucketName,
    Policy: JSON.stringify(denyDeletePolicy)
  }));
  console.log('✓ S3 bucket policy set: object deletion denied (append-only)');

  // --- SNS Topic ---
  const sns = new SNSClient({ region });
  const topicResult = await sns.send(new CreateTopicCommand({
    Name: 'DigitalTwinCriticalAlerts'
  }));
  const topicArn = topicResult.TopicArn!;
  console.log(`✓ SNS topic created: ${topicArn}`);

  // Subscribe operator email
  await sns.send(new SubscribeCommand({
    TopicArn: topicArn,
    Protocol: 'email',
    Endpoint: operatorEmail
  }));
  console.log(`✓ SNS email subscription created for ${operatorEmail} (confirm the email AWS sends you)`);

  // Subscribe operator phone (optional)
  if (operatorPhone) {
    await sns.send(new SubscribeCommand({
      TopicArn: topicArn,
      Protocol: 'sms',
      Endpoint: operatorPhone
    }));
    console.log(`✓ SNS SMS subscription created for ${operatorPhone}`);
  }

  // --- EventBridge Rule ---
  const eb = new EventBridgeClient({ region });
  await eb.send(new PutRuleCommand({
    Name: 'DigitalTwinCriticalAlertRule',
    EventBusName: process.env.EVENTBRIDGE_BUS_NAME,
    EventPattern: JSON.stringify({
      source: ['digital-twin.sustainability'],
      'detail-type': ['CriticalAlertFired']
    }),
    State: 'ENABLED',
    Description: 'Route critical sustainability alerts to SNS for operator notification'
  }));

  await eb.send(new PutTargetsCommand({
    Rule: 'DigitalTwinCriticalAlertRule',
    EventBusName: process.env.EVENTBRIDGE_BUS_NAME,
    Targets: [{
      Id: 'SNSTarget',
      Arn: topicArn
    }]
  }));
  console.log('✓ EventBridge rule created → routes to SNS topic');

  console.log('\n✅ AWS setup complete. Add this to your .env:');
  console.log(`SNS_CRITICAL_ALERT_TOPIC_ARN=${topicArn}`);
}

setup().catch(console.error);
```

Run with: `npx tsx backend/scripts/aws-setup.ts`

---

## 4. Service 1: Amazon S3 — Immutable Accountability Ledger

### Purpose

Every committed operator action — including the full tradeoff acknowledgment text, community impact statement, and end-user impact statement — is written to S3 as an individual JSON object. S3 versioning is enabled and object deletion is denied via bucket policy, making this a genuinely append-only, tamper-evident ledger.

**Why this makes AWS necessary:** The demo narrative's core claim is that the change log is an "accountability artifact." An in-memory array that disappears on server restart is not an accountability artifact. S3 with deletion-denied versioning is. This is the difference between a demo feature and a production-realistic design.

### S3 Key Structure

```
s3://digital-twin-audit-logs/
  actions/
    2026-04-12/
      {changeLogEntryId}.json      ← one object per committed action
  session-summaries/
    {sessionId}.json               ← written at server shutdown (cumulative stats)
  alerts/
    critical/
      {alertId}.json               ← written when a critical alert fires
```

### Implementation

Create `backend/src/aws/s3AuditLogger.ts`:

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { ChangeLogEntry, Alert } from '../types';

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.S3_AUDIT_BUCKET_NAME!;

/**
 * Write a committed action to S3.
 * Called after POST /api/actions succeeds and the local changeLog is updated.
 * Fire-and-forget: errors are logged but do not fail the action commit.
 */
export async function persistActionToS3(entry: ChangeLogEntry): Promise<void> {
  if (process.env.AWS_INTEGRATION_ENABLED !== 'true') return;

  const date = entry.timestamp.split('T')[0];   // "2026-04-12"
  const key = `actions/${date}/${entry.id}.json`;

  const payload = {
    ...entry,
    _metadata: {
      persistedAt: new Date().toISOString(),
      bucketName: BUCKET,
      schemaVersion: '1.0',
      immutabilityNote: 'This record is append-only. Deletion is denied by bucket policy.'
    }
  };

  try {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: JSON.stringify(payload, null, 2),
      ContentType: 'application/json',
      // Object tags for easy filtering in S3 console
      Tagging: `layer=${entry.layerId}&lever=${entry.leverId}&severity=action`
    }));
    console.log(`[S3] Action persisted: s3://${BUCKET}/${key}`);
  } catch (err) {
    console.error('[S3] Failed to persist action (non-fatal):', err);
  }
}

/**
 * Write a critical alert to S3.
 * Called when evaluateAlerts() produces a critical-severity alert.
 */
export async function persistCriticalAlertToS3(alert: Alert): Promise<void> {
  if (process.env.AWS_INTEGRATION_ENABLED !== 'true') return;

  const key = `alerts/critical/${alert.id}.json`;

  try {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: JSON.stringify({ ...alert, _persistedAt: new Date().toISOString() }, null, 2),
      ContentType: 'application/json',
      Tagging: `layer=${alert.layerId}&metric=${alert.metricId}&severity=critical`
    }));
    console.log(`[S3] Critical alert persisted: s3://${BUCKET}/${key}`);
  } catch (err) {
    console.error('[S3] Failed to persist critical alert (non-fatal):', err);
  }
}

/**
 * Retrieve all audit log entries from S3 for a given date.
 * Exposed via GET /api/audit/logs?date=2026-04-12
 */
export async function getAuditLogsFromS3(date: string): Promise<ChangeLogEntry[]> {
  if (process.env.AWS_INTEGRATION_ENABLED !== 'true') return [];

  try {
    const listResult = await s3.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: `actions/${date}/`
    }));

    const entries: ChangeLogEntry[] = [];
    for (const obj of listResult.Contents || []) {
      const getResult = await s3.send(new GetObjectCommand({
        Bucket: BUCKET,
        Key: obj.Key!
      }));
      const body = await getResult.Body?.transformToString();
      if (body) entries.push(JSON.parse(body));
    }
    return entries;
  } catch (err) {
    console.error('[S3] Failed to retrieve audit logs:', err);
    return [];
  }
}

/**
 * Write a session summary when the server process exits cleanly.
 * Called from process.on('SIGTERM') and process.on('SIGINT') handlers.
 */
export async function persistSessionSummaryToS3(summary: {
  sessionId: string;
  startTime: string;
  endTime: string;
  totalActionsCommitted: number;
  totalCarbonEmittedKg: number;
  totalWaterConsumedLiters: number;
  criticalAlertsTriggered: number;
  scenariosRun: string[];
}): Promise<void> {
  if (process.env.AWS_INTEGRATION_ENABLED !== 'true') return;

  const key = `session-summaries/${summary.sessionId}.json`;

  try {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: JSON.stringify(summary, null, 2),
      ContentType: 'application/json'
    }));
    console.log(`[S3] Session summary persisted: s3://${BUCKET}/${key}`);
  } catch (err) {
    console.error('[S3] Failed to persist session summary:', err);
  }
}
```

### New Express endpoint for audit log retrieval

Add to `backend/src/routes/audit.ts`:

```typescript
import { Router } from 'express';
import { getAuditLogsFromS3 } from '../aws/s3AuditLogger';

const router = Router();

// GET /api/audit/logs?date=2026-04-12
// Returns S3-persisted audit log for a given date.
// This endpoint is what makes the accountability ledger accessible beyond the session.
router.get('/logs', async (req, res) => {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const logs = await getAuditLogsFromS3(date);
  res.json({
    source: 'aws-s3',
    bucket: process.env.S3_AUDIT_BUCKET_NAME,
    date,
    entries: logs,
    total: logs.length,
    note: 'These records are stored in Amazon S3 with versioning enabled and deletion denied. They persist across server restarts and cannot be modified or deleted.'
  });
});

export default router;
```

Mount in `app.ts`:
```typescript
import auditRouter from './routes/audit';
app.use('/api/audit', auditRouter);
```

---

## 5. Service 2: Amazon Bedrock — AI Sustainability Narrative Engine

### Purpose

Replaces the hardcoded `recommendation.body` template strings with dynamically generated natural-language paragraphs from Claude Haiku. Also generates a post-action impact summary that appears in the change log after an action is committed — this is the "AI Ethics Narrator" feature.

**Why this makes AWS necessary:** The base PRD explicitly flags the rule-based recommendation engine as a limitation and includes a `confidenceNote` acknowledging it's not a real AI. Bedrock replaces that with a live LLM call. The output is genuinely different every time (contextualizes actual current metric values, reasons about the specific tradeoff accepted), which is demonstrably impossible with templates. During the demo, you can say: "This paragraph was written by Claude Haiku, running on AWS Bedrock, given the actual current state of our simulated facility. It is not a template."

### Model

`anthropic.claude-haiku-20240307-v1:0` — fastest and cheapest Anthropic model on Bedrock. Expected latency: 1–3 seconds. This is acceptable because Bedrock calls are async and non-blocking.

### Implementation

Create `backend/src/aws/bedrockNarrator.ts`:

```typescript
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { SimulationState, Recommendation, ChangeLogEntry } from '../types';

const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
const MODEL_ID = process.env.BEDROCK_MODEL_ID!;

/**
 * Enrich a recommendation's body text using Bedrock.
 * Called after the rule-based engine generates a Recommendation object.
 * Returns the enriched body string, or the original body if Bedrock fails.
 */
export async function enrichRecommendationWithBedrock(
  recommendation: Recommendation,
  currentState: SimulationState
): Promise<string> {
  if (process.env.AWS_INTEGRATION_ENABLED !== 'true') return recommendation.body;

  const prompt = buildRecommendationPrompt(recommendation, currentState);

  try {
    const response = await bedrock.send(new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: prompt
        }],
        system: `You are the AI advisor embedded in a real-time data center sustainability dashboard. 
You analyze live operational data and generate concise, actionable recommendations for human operators.
You always:
- Lead with the specific metric value and threshold that triggered this alert
- Quantify the projected impact of the suggested action in concrete units (liters, kgCO2, milliseconds, requests/hr)
- Mention the community or end-user group most affected
- Remind the operator this is a decision-support tool, not a decision-maker
- Write in 2-3 sentences maximum. Be direct and data-driven.
Do not use bullet points. Write in flowing prose.`
      })
    }));

    const responseBody = JSON.parse(Buffer.from(response.body).toString());
    const enrichedText: string = responseBody.content[0].text;
    console.log(`[Bedrock] Enriched recommendation: ${recommendation.id}`);
    return enrichedText;

  } catch (err) {
    console.error('[Bedrock] Enrichment failed, using template body (non-fatal):', err);
    return recommendation.body;  // graceful fallback
  }
}

/**
 * Generate a post-action sustainability narrative.
 * Called ~5 simulated minutes after an action is committed, when outcomeAfterFiveMinutes is populated.
 * Returns a short narrative paragraph for display in the change log entry.
 */
export async function generatePostActionNarrative(
  entry: ChangeLogEntry,
  currentState: SimulationState
): Promise<string> {
  if (process.env.AWS_INTEGRATION_ENABLED !== 'true') return '';

  const prompt = buildPostActionPrompt(entry, currentState);

  try {
    const response = await bedrock.send(new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 250,
        messages: [{ role: 'user', content: prompt }],
        system: `You are a sustainability impact narrator for a data center operations dashboard. 
When an operator takes an action and its effects are observed, you write a brief factual summary of what happened.
Write in past tense. 2-3 sentences maximum. Be specific with numbers. 
Always end with one sentence about the broader significance — community, carbon, or end-user — of this decision.`
      })
    }));

    const responseBody = JSON.parse(Buffer.from(response.body).toString());
    return responseBody.content[0].text;

  } catch (err) {
    console.error('[Bedrock] Post-action narrative failed (non-fatal):', err);
    return '';
  }
}

// --- Prompt builders ---

function buildRecommendationPrompt(rec: Recommendation, state: SimulationState): string {
  const layer = state.layers[rec.layerAffected as keyof typeof state.layers];
  const metrics = rec.projectedImpact.metricChanges
    .map(m => `${m.metric}: ${m.currentValue}${m.unit} → projected ${m.projectedValue}${m.unit}`)
    .join(', ');

  return `Current facility state:
- PUE: ${state.derivedMetrics.pue.toFixed(2)} | WUE: ${state.derivedMetrics.wue.toFixed(2)} L/kWh | CUE: ${state.derivedMetrics.cue.toFixed(3)} kgCO2/kWh
- Carbon output: ${state.derivedMetrics.carbonOutputKgPerHr.toFixed(1)} kgCO2/hr
- Total carbon emitted this session: ${state.derivedMetrics.totalCarbonEmittedKg.toFixed(1)} kg
- Total water consumed this session: ${state.derivedMetrics.totalWaterConsumedLiters.toFixed(0)} liters
- Community: ${state.layers.location.communityName}, Water Stress Index: ${state.layers.location.waterStressIndex}

Alert triggered: ${rec.title}
Trigger condition: ${rec.triggerCondition}
Suggested action: Set ${rec.suggestedAction.lever} from ${rec.suggestedAction.currentValue} to ${rec.suggestedAction.suggestedValue}
Projected metric changes: ${metrics}
End-user impact if action taken: ${rec.projectedImpact.endUserImpact}
Community impact if action taken: ${rec.projectedImpact.communityImpact}

Generate a recommendation body paragraph for the operator.`;
}

function buildPostActionPrompt(entry: ChangeLogEntry, state: SimulationState): string {
  const outcome = entry.outcomeAfterFiveMinutes;
  if (!outcome) return '';

  return `An operator took the following action and we have observed the results after 5 simulated minutes:

Action: ${entry.operatorAction}
Layer: ${entry.layerId}, Lever: ${entry.leverId}
Change: ${entry.previousValue} → ${entry.newValue}
Tradeoff acknowledged: "${entry.tradeoffAcknowledgment.tradeoffText}"
Community impact acknowledged: "${entry.tradeoffAcknowledgment.communityImpactText}"

Projection accuracy: ${outcome.projectionAccuracy}
Current facility state after action:
- PUE: ${state.derivedMetrics.pue.toFixed(2)}
- Carbon output: ${state.derivedMetrics.carbonOutputKgPerHr.toFixed(1)} kgCO2/hr
- Water usage: ${state.layers.cooling.waterUsageRate} L/hr
- Community (${state.layers.location.communityName}) water stress: ${state.layers.location.waterStressIndex}

Generate a 2-3 sentence post-action narrative summarizing what happened and its significance.`;
}
```

### Where to call Bedrock in the simulation engine

In `backend/src/simulation/recommendationEngine.ts`, after creating a new `Recommendation` object:

```typescript
// Existing code creates `newRec: Recommendation`
// ADD after creation:
enrichRecommendationWithBedrock(newRec, currentState).then(enrichedBody => {
  newRec.body = enrichedBody;
  // Re-emit via WebSocket so the frontend updates with the enriched text
  broadcastToClients({ event: 'recommendation:updated', data: newRec });
}).catch(() => { /* body stays as template fallback */ });
```

In `backend/src/simulation/engine.ts`, in the section that checks `outcomeAfterFiveMinutes`:

```typescript
// When a ChangeLogEntry's outcomeAfterFiveMinutes is populated (5 simulated minutes after commit):
generatePostActionNarrative(entry, currentState).then(narrative => {
  if (narrative) {
    entry.bedrockNarrative = narrative;  // add this field to ChangeLogEntry type
    broadcastToClients({ event: 'action:narrative-ready', data: { id: entry.id, narrative } });
  }
});
```

### New WebSocket events (server → client)

Add to the WebSocket event table in the codebase:

| Event | Payload | When |
|---|---|---|
| `recommendation:updated` | `Recommendation` | After Bedrock enriches a recommendation's body |
| `action:narrative-ready` | `{ id: string, narrative: string }` | After Bedrock generates a post-action narrative |

---

## 6. Service 3: AWS Lambda + API Gateway — Serverless Action Handler

### Purpose

The `POST /api/actions` commit endpoint is mirrored to a Lambda function. Lambda serves two functions: (1) it independently handles the S3 write and CloudWatch metric emission even if the main Express server restarts, and (2) it exposes a public-facing `GET /audit/logs` endpoint via API Gateway that is independent of the main server's uptime.

**Why this makes AWS necessary:** Serverless compute is itself a sustainability story. Lambda functions consume zero CPU when idle. The demo narration can say: "The infrastructure that records our ethical decisions is itself energy-efficient — Lambda functions run only when an operator makes a decision, consuming compute proportional to impact."

### Lambda Function: `DigitalTwinActionHandler`

Create `backend/lambda/actionHandler.ts`:

```typescript
import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { ChangeLogEntry } from '../src/types';  // shared types

const s3 = new S3Client({ region: process.env.AWS_REGION });
const cw = new CloudWatchClient({ region: process.env.AWS_REGION });
const BUCKET = process.env.S3_AUDIT_BUCKET_NAME!;
const CW_NAMESPACE = process.env.CLOUDWATCH_NAMESPACE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  // POST /actions — persist action and emit CloudWatch metric
  if (event.httpMethod === 'POST' && event.path === '/actions') {
    try {
      const entry: ChangeLogEntry = JSON.parse(event.body || '{}');

      // Write to S3
      const date = entry.timestamp.split('T')[0];
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: `actions/${date}/${entry.id}.json`,
        Body: JSON.stringify(entry, null, 2),
        ContentType: 'application/json'
      }));

      // Emit CloudWatch custom metrics
      await cw.send(new PutMetricDataCommand({
        Namespace: CW_NAMESPACE,
        MetricData: [
          {
            MetricName: 'EthicalActionsCommitted',
            Value: 1,
            Unit: 'Count',
            Dimensions: [
              { Name: 'Layer', Value: entry.layerId },
              { Name: 'Lever', Value: entry.leverId }
            ]
          }
        ]
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, s3Key: `actions/${date}/${entry.id}.json` })
      };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: String(err) }) };
    }
  }

  // GET /audit/logs?date=YYYY-MM-DD — retrieve persisted audit log
  if (event.httpMethod === 'GET' && event.path === '/audit/logs') {
    try {
      const date = event.queryStringParameters?.date || new Date().toISOString().split('T')[0];
      const listResult = await s3.send(new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: `actions/${date}/`
      }));

      const entries: ChangeLogEntry[] = [];
      for (const obj of listResult.Contents || []) {
        const getResult = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: obj.Key! }));
        const body = await getResult.Body?.transformToString();
        if (body) entries.push(JSON.parse(body));
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          source: 'aws-s3-via-lambda',
          date,
          entries,
          total: entries.length
        })
      };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: String(err) }) };
    }
  }

  return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
};
```

### Deploying the Lambda function

```bash
# From backend/lambda directory
npm install   # install lambda-specific deps
npx esbuild actionHandler.ts --bundle --platform=node --outfile=dist/actionHandler.js

# Zip and deploy
zip -j action-handler.zip dist/actionHandler.js

aws lambda create-function \
  --function-name DigitalTwinActionHandler \
  --runtime nodejs20.x \
  --role arn:aws:iam::ACCOUNT_ID:role/DigitalTwinLambdaRole \
  --handler actionHandler.handler \
  --zip-file fileb://action-handler.zip \
  --environment Variables="{AWS_REGION=us-east-1,S3_AUDIT_BUCKET_NAME=digital-twin-audit-logs,CLOUDWATCH_NAMESPACE=DigitalTwin/Sustainability}" \
  --timeout 30

# Create API Gateway HTTP API
aws apigatewayv2 create-api \
  --name DigitalTwinAuditAPI \
  --protocol-type HTTP \
  --target arn:aws:lambda:us-east-1:ACCOUNT_ID:function:DigitalTwinActionHandler
```

Save the API Gateway invoke URL — it goes in `.env` as `LAMBDA_API_GATEWAY_URL`.

### How the Express backend calls Lambda

In `backend/src/aws/lambdaBridge.ts`:

```typescript
/**
 * Asynchronously forward an action commit to Lambda.
 * Non-blocking — Express handler responds immediately, Lambda call is fire-and-forget.
 */
export async function forwardActionToLambda(entry: ChangeLogEntry): Promise<void> {
  if (!process.env.LAMBDA_API_GATEWAY_URL || process.env.AWS_INTEGRATION_ENABLED !== 'true') return;

  fetch(`${process.env.LAMBDA_API_GATEWAY_URL}/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  }).catch(err => console.error('[Lambda] Forward failed (non-fatal):', err));
  // Intentionally not awaited — fire and forget
}
```

---

## 7. Service 4: Amazon EventBridge + SNS — Proactive Critical Alerting

### Purpose

When `evaluateAlerts()` produces a critical-severity alert (GPU temp > 83°C, WUE > 1.8, Carbon output > 400 kgCO2/hr, Request Drop Rate > 2%), an event is published to EventBridge. An EventBridge rule routes this to an SNS topic, which sends an email and/or SMS to the registered operator.

**Why this makes AWS necessary:** In-browser alerts only reach the operator when the dashboard is open. A real data center sustainability system must reach the responsible human regardless of whether they are at their desk. EventBridge + SNS closes this gap. The demo can demonstrate this live: trigger a critical alert, show the email arriving on a phone in real time.

### Critical thresholds that trigger EventBridge events

| Metric | Layer | Critical Threshold | Event Detail Type |
|---|---|---|---|
| Average GPU Temperature | gpu | > 83°C | `CriticalAlertFired` |
| WUE | cooling | > 1.8 L/kWh | `CriticalAlertFired` |
| Carbon Output | power | > 400 kgCO2/hr | `CriticalAlertFired` |
| Request Drop Rate | workload | > 2% | `CriticalAlertFired` |
| Water Stress Index | location | > 0.6 | `CriticalAlertFired` |

### Implementation

Create `backend/src/aws/eventBridgePublisher.ts`:

```typescript
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { Alert, SimulationState } from '../types';

const eb = new EventBridgeClient({ region: process.env.AWS_REGION });

/**
 * Publish a critical alert event to EventBridge.
 * Called from evaluateAlerts() when a new critical-severity alert is created.
 */
export async function publishCriticalAlertEvent(
  alert: Alert,
  state: SimulationState
): Promise<void> {
  if (process.env.AWS_INTEGRATION_ENABLED !== 'true') return;

  const detail = {
    alertId: alert.id,
    severity: alert.severity,
    layerId: alert.layerId,
    metricId: alert.metricId,
    metricName: alert.metricName,
    currentValue: alert.currentValue,
    threshold: alert.threshold,
    message: alert.message,
    timestamp: alert.timestamp,
    facilityContext: {
      region: state.layers.location.region,
      communityName: state.layers.location.communityName,
      waterStressIndex: state.layers.location.waterStressIndex,
      currentCarbonOutput: state.derivedMetrics.carbonOutputKgPerHr,
      currentPUE: state.derivedMetrics.pue,
      activeScenario: state.activeScenario
    },
    // Human-readable summary for the SNS email body
    humanReadableSummary: buildAlertEmailBody(alert, state)
  };

  try {
    await eb.send(new PutEventsCommand({
      Entries: [{
        EventBusName: process.env.EVENTBRIDGE_BUS_NAME,
        Source: 'digital-twin.sustainability',
        DetailType: 'CriticalAlertFired',
        Detail: JSON.stringify(detail),
        Time: new Date()
      }]
    }));
    console.log(`[EventBridge] Critical alert published: ${alert.id} (${alert.metricName})`);
  } catch (err) {
    console.error('[EventBridge] Failed to publish event (non-fatal):', err);
  }
}

function buildAlertEmailBody(alert: Alert, state: SimulationState): string {
  return `
🚨 CRITICAL ALERT — AI Factory Digital Twin
Facility: ${state.layers.location.region} (${state.layers.location.communityName})
Time: ${alert.timestamp}

ALERT: ${alert.message}
Metric: ${alert.metricName} = ${alert.currentValue} (threshold: ${alert.threshold})
Layer: ${alert.layerId.toUpperCase()}

Current facility state:
  • PUE: ${state.derivedMetrics.pue.toFixed(2)}
  • Carbon output: ${state.derivedMetrics.carbonOutputKgPerHr.toFixed(1)} kgCO2/hr
  • Water usage: ${state.layers.cooling.waterUsageRate} L/hr
  • Community water stress: ${state.layers.location.waterStressIndex}
  • Active scenario: ${state.activeScenario || 'None'}

Action required: Open the dashboard immediately to assess and respond.
Dashboard URL: ${process.env.DASHBOARD_URL || 'http://localhost:3000'}

This notification was sent via AWS EventBridge + SNS.
  `.trim();
}
```

### Calling EventBridge from the simulation engine

In `backend/src/simulation/alertEvaluator.ts`, inside the alert generation block:

```typescript
// Existing: push new alert to state.activeAlerts and emit via WebSocket
// ADD:
if (newAlert.severity === 'critical') {
  // Async, non-blocking
  publishCriticalAlertEvent(newAlert, state).catch(() => {});
  persistCriticalAlertToS3(newAlert).catch(() => {});   // from s3AuditLogger.ts
}
```

### SNS Message Transformation

The EventBridge rule's SNS target needs an input transformer to format the email nicely. In the AWS Console or via CLI, set the input transformer on the EventBridge rule's SNS target:

```json
Input path:
{
  "summary": "$.detail.humanReadableSummary",
  "metricName": "$.detail.metricName",
  "currentValue": "$.detail.currentValue"
}

Input template:
"CRITICAL ALERT: <metricName> = <currentValue>\n\n<summary>"
```

---

## 8. Service 5: Amazon CloudWatch — Custom Sustainability Metrics

### Purpose

Emits custom metrics to the `DigitalTwin/Sustainability` namespace in CloudWatch, creating a persistent observable record of both facility performance and operator decision-making behavior.

**Why this makes AWS necessary:** CloudWatch provides a real-time, cloud-hosted dashboard for the simulation's key outputs. Displaying the CloudWatch console during the demo shows evaluators that the system's sustainability metrics are observable at the infrastructure level — not just in a custom frontend. It also creates an "ops meta-layer": we're monitoring the tool that monitors sustainability.

### Metrics emitted

| Metric Name | Unit | When Emitted | Dimensions |
|---|---|---|---|
| `EthicalActionsCommitted` | Count | Every action commit | `Layer`, `Lever` |
| `CriticalAlertsTriggered` | Count | Every critical alert | `Layer`, `MetricId` |
| `CarbonOutputKgPerHr` | None (raw value) | Every 10 ticks (20 seconds) | `Region` |
| `WaterUsageRateLitersPerHr` | None | Every 10 ticks | `Region` |
| `PUE` | None | Every 10 ticks | `Region` |
| `TotalCarbonEmittedKg` | None | Every 10 ticks | `Region` |
| `RecommendationsDismissed` | Count | Every dismissal | `Layer`, `Severity` |
| `AlertsWithoutOperatorResponse` | Count | Every 30 ticks (if critical alert still unacknowledged) | `Layer` |

### Implementation

Create `backend/src/aws/cloudWatchEmitter.ts`:

```typescript
import { CloudWatchClient, PutMetricDataCommand, MetricDatum } from '@aws-sdk/client-cloudwatch';
import { SimulationState, ChangeLogEntry, Alert } from '../types';

const cw = new CloudWatchClient({ region: process.env.AWS_REGION });
const NAMESPACE = process.env.CLOUDWATCH_NAMESPACE!;
const REGION_DIMENSION = process.env.FACILITY_REGION || 'Oregon-USA';

let ticksSinceLastEmit = 0;

/**
 * Called on every simulation tick.
 * Emits facility health metrics every 10 ticks to avoid CloudWatch rate limits.
 */
export async function emitFacilityMetrics(state: SimulationState): Promise<void> {
  if (process.env.AWS_INTEGRATION_ENABLED !== 'true') return;

  ticksSinceLastEmit++;
  if (ticksSinceLastEmit < 10) return;
  ticksSinceLastEmit = 0;

  const regionDim = [{ Name: 'Region', Value: REGION_DIMENSION }];
  const timestamp = new Date();

  const metrics: MetricDatum[] = [
    { MetricName: 'CarbonOutputKgPerHr', Value: state.derivedMetrics.carbonOutputKgPerHr, Dimensions: regionDim, Timestamp: timestamp },
    { MetricName: 'WaterUsageRateLitersPerHr', Value: state.layers.cooling.waterUsageRate, Dimensions: regionDim, Timestamp: timestamp },
    { MetricName: 'PUE', Value: state.derivedMetrics.pue, Dimensions: regionDim, Timestamp: timestamp },
    { MetricName: 'TotalCarbonEmittedKg', Value: state.derivedMetrics.totalCarbonEmittedKg, Dimensions: regionDim, Timestamp: timestamp },
    { MetricName: 'GPUUtilizationPercent', Value: state.layers.gpu.gpuUtilizationRate * 100, Dimensions: regionDim, Timestamp: timestamp },
    { MetricName: 'AverageGPUTemperature', Value: state.layers.gpu.averageGpuTemperature, Dimensions: regionDim, Timestamp: timestamp },
  ];

  try {
    // CloudWatch PutMetricData accepts max 20 metrics per call
    await cw.send(new PutMetricDataCommand({ Namespace: NAMESPACE, MetricData: metrics }));
  } catch (err) {
    console.error('[CloudWatch] Failed to emit facility metrics (non-fatal):', err);
  }
}

/**
 * Emit a metric when an operator commits an action.
 * Tracks ethical decision frequency per layer.
 */
export async function emitActionCommitMetric(entry: ChangeLogEntry): Promise<void> {
  if (process.env.AWS_INTEGRATION_ENABLED !== 'true') return;

  try {
    await cw.send(new PutMetricDataCommand({
      Namespace: NAMESPACE,
      MetricData: [{
        MetricName: 'EthicalActionsCommitted',
        Value: 1,
        Unit: 'Count',
        Dimensions: [
          { Name: 'Layer', Value: entry.layerId },
          { Name: 'Lever', Value: entry.leverId }
        ],
        Timestamp: new Date()
      }]
    }));
  } catch (err) {
    console.error('[CloudWatch] Action commit metric failed (non-fatal):', err);
  }
}

/**
 * Emit a metric when a recommendation is dismissed without action.
 * Tracks operator engagement with AI recommendations.
 */
export async function emitRecommendationDismissedMetric(
  layerId: string,
  severity: string
): Promise<void> {
  if (process.env.AWS_INTEGRATION_ENABLED !== 'true') return;

  try {
    await cw.send(new PutMetricDataCommand({
      Namespace: NAMESPACE,
      MetricData: [{
        MetricName: 'RecommendationsDismissed',
        Value: 1,
        Unit: 'Count',
        Dimensions: [
          { Name: 'Layer', Value: layerId },
          { Name: 'Severity', Value: severity }
        ],
        Timestamp: new Date()
      }]
    }));
  } catch (err) {
    console.error('[CloudWatch] Recommendation dismissed metric failed (non-fatal):', err);
  }
}
```

### Calling CloudWatch from the simulation loop

In the main simulation loop (`setInterval` in engine.ts), at the end of each tick:

```typescript
// At end of tick (non-blocking):
emitFacilityMetrics(state).catch(() => {});
```

In `POST /api/recommendations/:id/dismiss` handler:
```typescript
emitRecommendationDismissedMetric(recommendation.layerAffected, recommendation.severity).catch(() => {});
```

---

## 9. Integration Seams: Where AWS Attaches to Existing Code

This section is the exact map of which existing files to modify, and what to add. No existing logic should be deleted.

### `backend/src/routes/actions.ts` — POST /api/actions handler

After line that does `changeLog.push(newEntry)` and before `res.json(...)`:

```typescript
// AWS integrations — fire-and-forget, non-blocking
persistActionToS3(newEntry).catch(() => {});
forwardActionToLambda(newEntry).catch(() => {});
emitActionCommitMetric(newEntry).catch(() => {});
```

### `backend/src/simulation/engine.ts` — main tick loop

At end of `setInterval` callback, after `broadcastToClients(...)`:

```typescript
emitFacilityMetrics(state).catch(() => {});
```

Also in the `outcomeAfterFiveMinutes` population block:

```typescript
generatePostActionNarrative(entry, state).then(narrative => {
  if (narrative) {
    entry.bedrockNarrative = narrative;
    broadcastToClients({ event: 'action:narrative-ready', data: { id: entry.id, narrative } });
  }
}).catch(() => {});
```

### `backend/src/simulation/alertEvaluator.ts` — evaluateAlerts()

After `state.activeAlerts.push(newAlert)` for any critical-severity alert:

```typescript
if (newAlert.severity === 'critical') {
  publishCriticalAlertEvent(newAlert, state).catch(() => {});
  persistCriticalAlertToS3(newAlert).catch(() => {});
}
```

### `backend/src/simulation/recommendationEngine.ts` — after Recommendation creation

After the `Recommendation` object is fully constructed and before WebSocket emit:

```typescript
enrichRecommendationWithBedrock(newRec, state).then(enrichedBody => {
  newRec.body = enrichedBody;
  broadcastToClients({ event: 'recommendation:updated', data: newRec });
}).catch(() => {});
```

### `backend/src/routes/recommendations.ts` — POST /api/recommendations/:id/dismiss

After the recommendation status is set to `'dismissed'`:

```typescript
emitRecommendationDismissedMetric(rec.layerAffected, rec.severity).catch(() => {});
```

### `backend/src/app.ts` — server startup and shutdown

Add AWS setup verification on startup and session summary on shutdown:

```typescript
// Startup
if (process.env.AWS_INTEGRATION_ENABLED === 'true') {
  console.log('[AWS] Integration enabled. Services: S3, Bedrock, EventBridge, CloudWatch, Lambda');
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await persistSessionSummaryToS3({
    sessionId: SESSION_ID,  // uuid generated at startup
    startTime: SERVER_START_TIME,
    endTime: new Date().toISOString(),
    totalActionsCommitted: changeLog.length,
    totalCarbonEmittedKg: state.derivedMetrics.totalCarbonEmittedKg,
    totalWaterConsumedLiters: state.derivedMetrics.totalWaterConsumedLiters,
    criticalAlertsTriggered: alertHistory.filter(a => a.severity === 'critical').length,
    scenariosRun: [...new Set(scenarioHistory.map(s => s.scenarioId))]
  });
  process.exit(0);
});
process.on('SIGINT', async () => { /* same as SIGTERM */ });
```

---

## 10. IAM Roles & Permissions

### Lambda Execution Role: `DigitalTwinLambdaRole`

Create via AWS Console → IAM → Roles → Create Role → Lambda use case.

Attach the following inline policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3AuditAccess",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::digital-twin-audit-logs",
        "arn:aws:s3:::digital-twin-audit-logs/*"
      ]
    },
    {
      "Sid": "CloudWatchMetrics",
      "Effect": "Allow",
      "Action": ["cloudwatch:PutMetricData"],
      "Resource": "*"
    },
    {
      "Sid": "Logging",
      "Effect": "Allow",
      "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

### Backend Server IAM User: `digital-twin-backend`

Create via AWS Console → IAM → Users → Create User. Attach:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::digital-twin-audit-logs",
        "arn:aws:s3:::digital-twin-audit-logs/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["bedrock:InvokeModel"],
      "Resource": "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-haiku-20240307-v1:0"
    },
    {
      "Effect": "Allow",
      "Action": ["events:PutEvents"],
      "Resource": "arn:aws:events:us-east-1:ACCOUNT_ID:event-bus/digital-twin-events"
    },
    {
      "Effect": "Allow",
      "Action": ["cloudwatch:PutMetricData"],
      "Resource": "*"
    }
  ]
}
```

Generate an Access Key for this user and put it in `.env`.

---

## 11. Environment Variables Reference

Full `.env` for the backend:

```env
# Existing
NODE_ENV=development
PORT=3001
SIMULATED_SECONDS_PER_TICK=300

# AWS Core
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_ACCOUNT_ID=123456789012

# S3
S3_AUDIT_BUCKET_NAME=digital-twin-audit-logs

# Bedrock
BEDROCK_MODEL_ID=anthropic.claude-haiku-20240307-v1:0

# EventBridge
EVENTBRIDGE_BUS_NAME=digital-twin-events

# SNS
SNS_CRITICAL_ALERT_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:DigitalTwinCriticalAlerts
OPERATOR_ALERT_EMAIL=operator@example.com
OPERATOR_ALERT_PHONE=+15551234567   # optional

# Lambda
LAMBDA_API_GATEWAY_URL=https://abc123.execute-api.us-east-1.amazonaws.com

# CloudWatch
CLOUDWATCH_NAMESPACE=DigitalTwin/Sustainability
FACILITY_REGION=Oregon-USA

# Feature flag — set to false to run entirely offline
AWS_INTEGRATION_ENABLED=true

# Misc
DASHBOARD_URL=http://localhost:3000
```

---

## 12. Implementation Order & Time Budget

This is the recommended order for a 5-hour implementation window. Each step is independently deployable — completing step N means step N is already live and demonstrable.

| Step | Task | Service | Est. Time | Cumulative |
|---|---|---|---|---|
| 1 | IAM user + roles, `.env` setup, `npm install` AWS SDKs | IAM | 20min | 0:20 |
| 2 | Run `aws-setup.ts` script: create S3 bucket with versioning + deletion policy, SNS topic, EventBridge rule | S3, SNS, EB | 20min | 0:40 |
| 3 | Implement `s3AuditLogger.ts` + add S3 write call to `POST /api/actions` + add `GET /api/audit/logs` endpoint | S3 | 30min | 1:10 |
| 4 | Implement `cloudWatchEmitter.ts` + add `emitFacilityMetrics` to tick loop + `emitActionCommitMetric` to action handler | CloudWatch | 20min | 1:30 |
| 5 | Implement `eventBridgePublisher.ts` + add critical alert hook to `evaluateAlerts()` + confirm SNS email arrives | EventBridge + SNS | 30min | 2:00 |
| 6 | Implement `bedrockNarrator.ts` + add enrichment hook to recommendation engine | Bedrock | 1hr | 3:00 |
| 7 | Implement `lambdaBridge.ts` + deploy Lambda function + configure API Gateway | Lambda + APIGW | 1hr | 4:00 |
| 8 | Frontend changes: S3 badge on change log, Bedrock narrative display, AWS status indicator | Frontend | 30min | 4:30 |
| 9 | End-to-end testing: trigger heatwave scenario, commit action, verify S3 write, check CloudWatch, verify SNS email | All | 30min | 5:00 |

**If time is short, drop Step 7 (Lambda).** Steps 1-6 are the highest-impact. S3 + Bedrock + CloudWatch + EventBridge is already a very strong AWS story without Lambda.

---

## 13. Frontend Changes

These are the only changes to the React frontend required for AWS integration. They are purely additive.

### 13.1 AWS Status Indicator

Add a small badge in the top-right corner of the dashboard (outside the main 3D viewport) showing AWS connectivity status:

```tsx
// components/AWSStatusBadge.tsx
import { useEffect, useState } from 'react';

export function AWSStatusBadge() {
  const [status, setStatus] = useState<'connected' | 'degraded' | 'offline'>('offline');

  useEffect(() => {
    fetch('/api/audit/logs?date=' + new Date().toISOString().split('T')[0])
      .then(r => r.ok ? setStatus('connected') : setStatus('degraded'))
      .catch(() => setStatus('offline'));
  }, []);

  const colors = {
    connected: '#22C55E',
    degraded: '#F59E0B',
    offline: '#6B7280'
  };

  const labels = {
    connected: 'AWS Connected',
    degraded: 'AWS Degraded',
    offline: 'AWS Offline'
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '4px 10px', borderRadius: '9999px',
      backgroundColor: '#1E293B', border: `1px solid ${colors[status]}`,
      fontSize: '11px', color: colors[status], fontWeight: 500
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        backgroundColor: colors[status],
        boxShadow: status === 'connected' ? `0 0 6px ${colors[status]}` : 'none'
      }} />
      {labels[status]}
    </div>
  );
}
```

### 13.2 S3 Persistence Badge on Change Log Entries

In the History tab, add a small S3 icon badge next to each change log entry that has been persisted:

```tsx
// In the HistoryTab component, inside each ChangeLogEntry row:
{entry.s3Key && (
  <span style={{
    fontSize: '10px', color: '#F59E0B', padding: '2px 6px',
    border: '1px solid #F59E0B', borderRadius: '4px', marginLeft: '8px'
  }}>
    ⛅ S3
  </span>
)}
```

Add `s3Key?: string` to the `ChangeLogEntry` type — the backend populates this after a successful S3 write.

### 13.3 Bedrock Narrative Display

In the History tab, for entries where `bedrockNarrative` is populated, display it below the tradeoff acknowledgment text:

```tsx
{entry.bedrockNarrative && (
  <div style={{
    marginTop: '8px', padding: '8px 12px',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '6px', fontSize: '12px', color: '#A5B4FC',
    lineHeight: 1.5
  }}>
    <span style={{ fontSize: '10px', color: '#6366F1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
      ✦ AWS Bedrock · AI Impact Narrative
    </span>
    {entry.bedrockNarrative}
  </div>
)}
```

### 13.4 WebSocket handler additions

In the WebSocket message handler (`useSimulation` hook or equivalent):

```typescript
case 'recommendation:updated':
  // Replace the recommendation's body text with Bedrock-enriched version
  dispatch({ type: 'UPDATE_RECOMMENDATION', payload: data });
  break;

case 'action:narrative-ready':
  // Attach Bedrock narrative to the matching change log entry
  dispatch({ type: 'ATTACH_NARRATIVE', payload: data });
  break;
```

---

## 14. Demo Talking Points Per Service

These are the exact sentences to say during the demo for each AWS service. Keep them short and tied to the demo's ethical narrative.

### S3 — Accountability Ledger
> "Every time I commit an action — including the exact tradeoff I acknowledged — it's written to Amazon S3 with versioning enabled and deletion explicitly denied by bucket policy. This is not a local log. It persists after this server stops. It cannot be edited or deleted. In a real data center, this is the difference between a decision log and a legal accountability artifact."

### Bedrock — AI Narration
> "This paragraph you see here was not written by a template. It was generated by Claude Haiku, running on AWS Bedrock, given the actual current state of our simulation — the specific metric values, the community water stress level, the operator's acknowledged tradeoff. Every recommendation is different because the facility state is always different. This is what meaningful AI assistance in ethical decision-making actually looks like."

### Lambda — Serverless Compute
> "The infrastructure that records our ethical decisions is itself energy-efficient. This Lambda function consumes zero compute when no operator is making a decision. It scales instantly when needed and returns to zero. That's not just an architecture choice — it's a sustainability choice about the sustainability tool."

### EventBridge + SNS
> "When a critical threshold fires — GPU temperatures above 83 degrees, water usage critically high — the system doesn't just turn a box red on a screen. AWS EventBridge routes that event to an SNS topic and sends an email and SMS to the responsible operator within 30 seconds, even if this dashboard tab is closed. Accountability doesn't stop at the browser."

### CloudWatch
> "This is the AWS CloudWatch console, showing our custom `DigitalTwin/Sustainability` namespace. You can see PUE, carbon output, water usage, and ethical actions committed — all as real-time metrics in the cloud. We're not just monitoring the data center; we're making the data center's sustainability record observable and auditable at the infrastructure level."

---

## 15. Fallback Behavior If AWS Is Unavailable

All AWS calls are non-blocking and wrapped in try/catch. If `AWS_INTEGRATION_ENABLED=false` or credentials are invalid:

- **S3:** Change log entries are not persisted to S3. In-memory log still works. `GET /api/audit/logs` returns an empty array with a note explaining AWS is disabled.
- **Bedrock:** `recommendation.body` falls back to the existing template text. No UI change — the recommendation still displays, just without AI enrichment.
- **EventBridge:** Critical alerts still appear in-browser. No email/SMS is sent. No error is shown to the operator.
- **CloudWatch:** Metrics are not emitted. No error is shown.
- **Lambda:** Action commits still succeed via the Express handler. Lambda forwarding silently fails.

The application is fully functional without AWS. This ensures demo stability: if AWS connectivity fails during the presentation, the core product still works.

---

## 16. Architecture Diagram (Text)

```
┌─────────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND (unchanged)                    │
│  Three.js 3D Twin │ Metrics Bar │ Layer Sidebar │ Action Panels │
│                                                                   │
│  New: AWSStatusBadge │ S3 badge on log entries │ Bedrock narrative│
└────────────────────────────┬────────────────────────────────────┘
                             │  WebSocket (ws://) + REST (http://)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              NODE.JS EXPRESS BACKEND (unchanged core)            │
│                                                                   │
│  Simulation Engine (setInterval 2s)                              │
│  ├── applyDrift() │ applyScenarios() │ propagateDependencies()   │
│  ├── evaluateAlerts()  ──────────────────────► [Seam C]         │
│  ├── evaluateRecommendations() ─────────────► [Seam B]         │
│  └── broadcastToClients()                                        │
│                                                                   │
│  REST Routes                                                      │
│  ├── POST /api/actions ──────────────────────► [Seam A]         │
│  ├── GET  /api/audit/logs  (new)                                 │
│  └── ... (all other routes unchanged)                            │
└──────────────────────────────────────────────────────────────────┘
         │ Seam A                │ Seam B            │ Seam C
         ▼                       ▼                   ▼
┌──────────────┐      ┌──────────────────┐   ┌────────────────────┐
│   Amazon S3  │      │ Amazon Bedrock   │   │ Amazon EventBridge │
│              │      │ (Claude Haiku)   │   │                    │
│ Bucket:      │      │                  │   │ Rule:              │
│ audit-logs/  │      │ Enriches recom-  │   │ CriticalAlertFired │
│   actions/   │      │ mendation bodies │   │ → SNS Target       │
│   alerts/    │      │ Generates post-  │   └────────┬───────────┘
│   sessions/  │      │ action narrative │            ▼
│              │      └──────────────────┘   ┌────────────────────┐
│ Versioning:  │                              │    Amazon SNS      │
│ ON           │      ┌──────────────────┐   │                    │
│ Delete: DENY │      │  AWS Lambda +    │   │ Email + SMS to     │
└──────────────┘      │  API Gateway     │   │ operator           │
         ▲            │                  │   └────────────────────┘
         │            │ Mirrors action   │
         └────────────┤ commits to S3    │   ┌────────────────────┐
                      │ Exposes public   │   │ Amazon CloudWatch  │
                      │ GET /audit/logs  │   │                    │
                      └──────────────────┘   │ Namespace:         │
                                             │ DigitalTwin/       │
                                             │ Sustainability     │
                                             │                    │
                                             │ Metrics:           │
                                             │ • CarbonOutput     │
                                             │ • WaterUsage       │
                                             │ • PUE              │
                                             │ • ActionsCommitted │
                                             │ • AlertsTriggered  │
                                             └────────────────────┘
```

---

*End of AWS Integration Specification*  
*This document is complete and implementation-ready. All code samples use the existing type definitions from the PRD and are compatible with Node.js 20 LTS + TypeScript strict mode.*
