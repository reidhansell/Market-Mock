module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/src/'],
    testMatch: ['<rootDir>/src/tests/**/*.test.tsx'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFilesAfterEnv: ['./jest.setup.ts'],
    moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "<rootDir>/src/tests/mocks/styleMock.tsx"
    }
};
