module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/dist/", "setup.js"],
  setupFiles: ["./src/__tests__/setup.js"]
};
