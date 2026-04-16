/**
 * Startup environment validation.
 *
 * Warns on missing recommended vars, throws on missing critical vars
 * when running in production.
 */

import logger from './logger';

const CRITICAL_IN_PRODUCTION = [
  'DATABASE_URL',
  'JWT_SECRET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'STREAM_KEY_ENCRYPTION_KEY',
];

const RECOMMENDED = [
  'REDIS_URL',
  'AWS_ACCOUNT_ID',
  'IVS_STAGE_ARN',
  'IVS_CHANNEL_ARN',
];

export function validateEnv(): void {
  const isProduction = process.env.NODE_ENV === 'production';

  const missingCritical = CRITICAL_IN_PRODUCTION.filter((key) => !process.env[key]);
  const missingRecommended = RECOMMENDED.filter((key) => !process.env[key]);

  for (const key of missingRecommended) {
    logger.warn('Missing recommended env var: %s', key);
  }

  if (isProduction && missingCritical.length > 0) {
    logger.error(
      { missing: missingCritical },
      'Missing critical environment variables for production',
    );
    throw new Error(
      `Missing critical env vars: ${missingCritical.join(', ')}`,
    );
  }

  if (missingCritical.length > 0) {
    logger.warn(
      { missing: missingCritical },
      'Missing env vars (required in production)',
    );
  }
}
