// Runtime env access. On Vercel serverless, secrets live in process.env at
// runtime; import.meta.env is the build-time fallback for local dev.

function readEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env && process.env[key] != null) {
    return process.env[key];
  }
  // import.meta.env is statically replaced by Vite, so access via bracket guard.
  const meta = (import.meta as unknown as { env?: Record<string, string> }).env;
  return meta?.[key];
}

/** Read an env var, returning empty string if unset. */
export function env(key: string): string {
  return readEnv(key) ?? '';
}

/** Read an env var, throwing if it is missing. */
export function requireEnv(key: string): string {
  const value = readEnv(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
