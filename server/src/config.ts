/**
 * Load config from environment variables
 */

export interface Config {
  POTC_BASE_URL: string;
  POTC_DEBUG_KEY: string;
  POTC_CAMPAIGN_TAG: string;
  SMARTY_STREETS_ID: string;
  SMARTY_STREETS_TOKEN: string;
  REQUEST_THROTTLING_SALT: string;
  REDIS_URL: string;
  SENTRY_DSN: string;
}

const config: Config = {
  POTC_BASE_URL: requireEnvVar("POTC_BASE_URL"),
  POTC_DEBUG_KEY: process.env.POTC_DEBUG_KEY || "",
  POTC_CAMPAIGN_TAG: process.env.POTC_DEBUG_KEY || "democracy.io",
  SMARTY_STREETS_ID: requireEnvVar("SMARTY_STREETS_ID"),
  SMARTY_STREETS_TOKEN: requireEnvVar("SMARTY_STREETS_ID"),
  REQUEST_THROTTLING_SALT: requireEnvVar("REQUEST_THROTTLING_SALT"),
  REDIS_URL: requireEnvVar("REDIS_URL"),
  SENTRY_DSN: process.env.SENTRY_DSN || ""
};

export default config;

/**
 * gets the environment variable. throws if falsy
 */
function requireEnvVar(name: string): string {
  const val = process.env[name];

  if (val) {
    return val;
  } else {
    throw new Error(`Environment variable ${name} not defined`);
  }
}
