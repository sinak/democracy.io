module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/"],
  globals: {
    "ts-jest": {
      // disables type checking
      isolatedModules: true,
    },
  },
};
