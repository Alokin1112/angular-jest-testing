import { Config } from 'jest'

const config: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/"
  ],
  modulePaths: [
    "<rootDir>"
  ],
  transform: {},
  testMatch: [
    "**/?(*.)+(jest).ts"
  ],
  testEnvironment: "jsdom"
}

export default config;