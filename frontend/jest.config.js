const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const customConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@react-pdf/renderer$': '<rootDir>/src/__mocks__/react-pdf-renderer.tsx',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**',
    '!src/__mocks__/**',
    '!src/__tests__/**',
  ],
};

module.exports = createJestConfig(customConfig);
