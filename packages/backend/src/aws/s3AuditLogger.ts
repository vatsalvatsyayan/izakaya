import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import type { ChangeLogEntry, Alert } from '@izakaya/shared';

function s3Client() { return new S3Client({ region: process.env.AWS_REGION || 'us-east-1' }); }
function BUCKET() { return process.env.S3_AUDIT_BUCKET_NAME!; }

function isEnabled(): boolean {
  return process.env.AWS_INTEGRATION_ENABLED === 'true';
}

/**
 * Write a committed action to S3 (fire-and-forget).
 * Returns the S3 key on success, null on failure or if disabled.
 */
export async function persistActionToS3(entry: ChangeLogEntry): Promise<string | null> {
  if (!isEnabled()) return null;

  const date = entry.timestamp.split('T')[0];
  const key = `actions/${date}/${entry.id}.json`;

  const payload = {
    ...entry,
    _metadata: {
      persistedAt: new Date().toISOString(),
      bucketName: BUCKET(),
      schemaVersion: '1.0',
      immutabilityNote: 'This record is append-only. Deletion is denied by bucket policy.',
    },
  };

  try {
    await s3Client().send(new PutObjectCommand({
      Bucket: BUCKET(),
      Key: key,
      Body: JSON.stringify(payload, null, 2),
      ContentType: 'application/json',
    }));
    console.log(`[S3] Action persisted: s3://${BUCKET()}/${key}`);
    return key;
  } catch (err) {
    console.error('[S3] Failed to persist action (non-fatal):', err);
    return null;
  }
}

/**
 * Write a critical alert to S3.
 */
export async function persistCriticalAlertToS3(alert: Alert): Promise<void> {
  if (!isEnabled()) return;

  const key = `alerts/critical/${alert.id}.json`;

  try {
    await s3Client().send(new PutObjectCommand({
      Bucket: BUCKET(),
      Key: key,
      Body: JSON.stringify({ ...alert, _persistedAt: new Date().toISOString() }, null, 2),
      ContentType: 'application/json',
    }));
    console.log(`[S3] Critical alert persisted: s3://${BUCKET()}/${key}`);
  } catch (err) {
    console.error('[S3] Failed to persist critical alert (non-fatal):', err);
  }
}

/**
 * Retrieve all audit log entries from S3 for a given date.
 */
export async function getAuditLogsFromS3(date: string): Promise<ChangeLogEntry[]> {
  if (!isEnabled()) return [];

  try {
    const listResult = await s3Client().send(new ListObjectsV2Command({
      Bucket: BUCKET(),
      Prefix: `actions/${date}/`,
    }));

    const entries: ChangeLogEntry[] = [];
    for (const obj of listResult.Contents || []) {
      const getResult = await s3Client().send(new GetObjectCommand({
        Bucket: BUCKET(),
        Key: obj.Key!,
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
 * Write a session summary on server shutdown.
 */
export async function persistSessionSummaryToS3(summary: {
  sessionId: string;
  startTime: string;
  endTime: string;
  totalActionsCommitted: number;
  totalCarbonEmittedKg: number;
  totalWaterConsumedLiters: number;
  criticalAlertsTriggered: number;
}): Promise<void> {
  if (!isEnabled()) return;

  const key = `session-summaries/${summary.sessionId}.json`;

  try {
    await s3Client().send(new PutObjectCommand({
      Bucket: BUCKET(),
      Key: key,
      Body: JSON.stringify(summary, null, 2),
      ContentType: 'application/json',
    }));
    console.log(`[S3] Session summary persisted: s3://${BUCKET()}/${key}`);
  } catch (err) {
    console.error('[S3] Failed to persist session summary:', err);
  }
}
