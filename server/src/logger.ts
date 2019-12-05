import * as winston from "winston";
const format = winston.format;

const development: winston.LoggerOptions = {
  transports: [
    new winston.transports.Console({
      level: "debug",
      format: format.combine(
        format.colorize({ all: true }),
        format.timestamp(),
        format.simple()
      )
    })
  ]
};

const test: winston.LoggerOptions = {
  transports: [
    new winston.transports.Console({
      level: "error"
    })
  ]
};

const production: winston.LoggerOptions = {
  transports: [
    new winston.transports.Console({
      level: "info"
    })
  ]
};

function getEnvConfig(): winston.LoggerOptions {
  const env = process.env.NODE_ENV;
  if (env) {
    const lowercaseEnv = env.toLowerCase();
    switch (lowercaseEnv) {
      case "production":
        return production;
      case "test":
        return test;
      default:
        return development;
    }
  } else {
    return development;
  }
}

export default winston.createLogger(getEnvConfig());
