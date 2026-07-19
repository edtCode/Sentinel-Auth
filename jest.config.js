module.exports = {
    testEnvironment: 'node',

    roots: ["<rootDir>/tests"],

    testMatch: ["**/*.test.js"],

    setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

    clearMocks: true,

    maxWorkers: 1,

    collectCoverageFrom: [
        "src/**/*.js",
        "!src/server.js"
    ]
}