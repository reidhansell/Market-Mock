module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>'],
    testMatch: ['**/*.test.tsx'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFilesAfterEnv: ['./jest.setup.ts'],
    moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "<rootDir>/src/components/Common/styleMock.tsx"
    },
};