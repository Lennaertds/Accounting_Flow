// jest-e2e.config.ts
import type { Config } from 'jest';

export default {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
    },
    globalSetup: './backend/test/jest.global-setup.ts',
    globalTeardown: './backend/test/jest.global-teardown.ts',
    testRegex: '.e2e-spec.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
} satisfies Config;