/**
 * Ensures environment variables are defined
 */

export interface Config {
  POTC_BASE_URL: string;
  POTC_DEBUG_KEY: string;
  POTC_CAMPAIGN_TAG: string;
  SMARTY_STREETS_ID: string;
  SMARTY_STREETS_TOKEN: string;
  SENTRY_DSN: string;
}

const testConfig: Config = {
  POTC_BASE_URL: "",
  POTC_DEBUG_KEY: "",
  POTC_CAMPAIGN_TAG: "democracy.io",
  SMARTY_STREETS_ID: "",
  SMARTY_STREETS_TOKEN: "",
  SENTRY_DSN: ""
};

function defaultConfig(): Config {
  return {
    POTC_BASE_URL: requireEnvVar(process.env.POTC_BASE_URL, "POTC_BASE_URL"),
    POTC_DEBUG_KEY: process.env.POTC_DEBUG_KEY || "",
    POTC_CAMPAIGN_TAG: process.env.POTC_CAMPAIGN_TAG || "democracy.io",
    SMARTY_STREETS_ID: requireEnvVar(
      process.env.SMARTY_STREETS_ID,
      "SMARTY_STREETS_ID"
    ),
    SMARTY_STREETS_TOKEN: requireEnvVar(
      process.env.SMARTY_STREETS_TOKEN,
      "SMARTY_STREETS_TOKEN"
    ),
    SENTRY_DSN: process.env.SENTRY_DSN || ""
  };
}

const config = process.env.NODE_ENV === "test" ? testConfig : defaultConfig();
export default config;

/**
 * gets the environment variable. throws if falsy
 */
function requireEnvVar(val: string | undefined, envName: string): string {
  if (val) {
    return val;
  } else {
    throw `Environment variable ${envName} not defined`;
  }
}
