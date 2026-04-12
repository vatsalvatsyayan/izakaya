import { Router } from 'express';
import { getAuditLogsFromS3 } from '../aws/s3AuditLogger';

const router = Router();

// GET /api/audit/logs?date=2026-04-12
router.get('/audit/logs', async (req, res) => {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const awsEnabled = process.env.AWS_INTEGRATION_ENABLED === 'true';

  if (!awsEnabled) {
    return res.json({
      source: 'disabled',
      date,
      entries: [],
      total: 0,
      note: 'AWS integration is disabled. Set AWS_INTEGRATION_ENABLED=true in .env to enable the S3 audit ledger.',
    });
  }

  const logs = await getAuditLogsFromS3(date);
  res.json({
    source: 'aws-s3',
    bucket: process.env.S3_AUDIT_BUCKET_NAME,
    date,
    entries: logs,
    total: logs.length,
    note: 'Records stored in Amazon S3 with versioning enabled and deletion denied. Persist across server restarts.',
  });
});

export default router;
