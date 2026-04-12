/**
 * One-time AWS resource provisioning script.
 * Run with: npx tsx packages/backend/scripts/aws-setup.ts
 *
 * Creates:
 *   - S3 bucket with versioning + delete-deny policy
 *   - SNS topic + email/SMS subscriptions
 *   - EventBridge custom bus + rule → SNS target
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });
import { S3Client, CreateBucketCommand, PutBucketVersioningCommand, PutBucketPolicyCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { SNSClient, CreateTopicCommand, SubscribeCommand, AddPermissionCommand } from '@aws-sdk/client-sns';
import { EventBridgeClient, PutRuleCommand, PutTargetsCommand, CreateEventBusCommand } from '@aws-sdk/client-eventbridge';

const region = process.env.AWS_REGION || 'us-east-1';
const accountId = process.env.AWS_ACCOUNT_ID;
const operatorEmail = process.env.OPERATOR_ALERT_EMAIL;
const operatorPhone = process.env.OPERATOR_ALERT_PHONE;
const bucketName = process.env.S3_AUDIT_BUCKET_NAME || 'digital-twin-audit-logs';
const eventBusName = process.env.EVENTBRIDGE_BUS_NAME || 'digital-twin-events';

if (!accountId) {
  console.error('ERROR: AWS_ACCOUNT_ID not set in .env');
  process.exit(1);
}

async function setup() {
  console.log('=== AWS Setup for AI Factory Digital Twin ===\n');
  console.log(`Region: ${region}`);
  console.log(`Account: ${accountId}`);
  console.log(`S3 Bucket: ${bucketName}`);
  console.log('');

  // --- S3 Bucket ---
  const s3 = new S3Client({ region });

  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log(`✓ S3 bucket already exists: ${bucketName}`);
  } catch {
    try {
      if (region === 'us-east-1') {
        await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
      } else {
        await s3.send(new CreateBucketCommand({
          Bucket: bucketName,
          CreateBucketConfiguration: { LocationConstraint: region as any },
        }));
      }
      console.log(`✓ S3 bucket created: ${bucketName}`);
    } catch (e: any) {
      if (e.name === 'BucketAlreadyOwnedByYou') {
        console.log(`✓ S3 bucket already exists: ${bucketName}`);
      } else {
        throw e;
      }
    }
  }

  await s3.send(new PutBucketVersioningCommand({
    Bucket: bucketName,
    VersioningConfiguration: { Status: 'Enabled' },
  }));
  console.log('✓ S3 versioning enabled (tamper-evident ledger)');

  const denyDeletePolicy = {
    Version: '2012-10-17',
    Statement: [{
      Sid: 'DenyObjectDeletion',
      Effect: 'Deny',
      Principal: '*',
      Action: ['s3:DeleteObject', 's3:DeleteObjectVersion'],
      Resource: `arn:aws:s3:::${bucketName}/*`,
    }],
  };
  await s3.send(new PutBucketPolicyCommand({
    Bucket: bucketName,
    Policy: JSON.stringify(denyDeletePolicy),
  }));
  console.log('✓ S3 bucket policy: object deletion denied (append-only)\n');

  // --- SNS Topic ---
  const sns = new SNSClient({ region });
  const topicResult = await sns.send(new CreateTopicCommand({
    Name: 'DigitalTwinCriticalAlerts',
  }));
  const topicArn = topicResult.TopicArn!;
  console.log(`✓ SNS topic: ${topicArn}`);

  // Allow EventBridge to publish to this SNS topic
  try {
    await sns.send(new AddPermissionCommand({
      TopicArn: topicArn,
      Label: 'AllowEventBridgePublish',
      AWSAccountId: [accountId],
      ActionName: ['Publish'],
    }));
  } catch {
    // May already exist — not fatal
  }

  if (operatorEmail) {
    await sns.send(new SubscribeCommand({
      TopicArn: topicArn,
      Protocol: 'email',
      Endpoint: operatorEmail,
    }));
    console.log(`✓ SNS email subscription pending for ${operatorEmail} — CHECK YOUR EMAIL AND CONFIRM THE SUBSCRIPTION`);
  } else {
    console.log('⚠ No OPERATOR_ALERT_EMAIL set — skipping email subscription');
  }

  if (operatorPhone) {
    await sns.send(new SubscribeCommand({
      TopicArn: topicArn,
      Protocol: 'sms',
      Endpoint: operatorPhone,
    }));
    console.log(`✓ SNS SMS subscription created for ${operatorPhone}`);
  }
  console.log('');

  // --- EventBridge Custom Bus ---
  const eb = new EventBridgeClient({ region });

  try {
    await eb.send(new CreateEventBusCommand({ Name: eventBusName }));
    console.log(`✓ EventBridge custom bus created: ${eventBusName}`);
  } catch (e: any) {
    if (e.name === 'ResourceAlreadyExistsException') {
      console.log(`✓ EventBridge bus already exists: ${eventBusName}`);
    } else {
      throw e;
    }
  }

  await eb.send(new PutRuleCommand({
    Name: 'DigitalTwinCriticalAlertRule',
    EventBusName: eventBusName,
    EventPattern: JSON.stringify({
      source: ['digital-twin.sustainability'],
      'detail-type': ['CriticalAlertFired'],
    }),
    State: 'ENABLED',
    Description: 'Route critical sustainability alerts to SNS for operator notification',
  }));

  await eb.send(new PutTargetsCommand({
    Rule: 'DigitalTwinCriticalAlertRule',
    EventBusName: eventBusName,
    Targets: [{
      Id: 'SNSTarget',
      Arn: topicArn,
    }],
  }));
  console.log('✓ EventBridge rule created → routes CriticalAlertFired to SNS topic\n');

  console.log('=== Setup Complete ===');
  console.log('');
  console.log('Add/verify these in packages/backend/.env:');
  console.log(`SNS_CRITICAL_ALERT_TOPIC_ARN=${topicArn}`);
  console.log(`EVENTBRIDGE_BUS_NAME=${eventBusName}`);
  console.log('');
  if (operatorEmail) {
    console.log('IMPORTANT: Check your email and confirm the SNS subscription before testing alerts.');
  }
}

setup().catch((err) => {
  console.error('\nSetup failed:', err);
  process.exit(1);
});
