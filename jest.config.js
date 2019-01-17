// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

const config = {
  projects: [
    {
      displayName: "server",
      testEnvironment: "node",
      roots: ["<rootDir>/server"]
    },
    {
      displayName: "www",
      testEnvironment: "jsdom",
      roots: ["<rootDir>/www"]
    }
  ]
};

module.exports = config;
