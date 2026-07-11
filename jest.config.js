module.exports = {
    testEnvironment: 'node',

    roots: ["<rootDir>/tests"],

    testMatch: ["**/*.test.js"],

    setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

    clearMocks: true,

    collectCoverageFrom: [
        "src/**/*.js",
        "!src/server.js"
    ]
}