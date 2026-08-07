const request = require("supertest");

describe("OAuth not configured", () => {
    let app;

    beforeAll(() => {
        delete process.env.GOOGLE_CLIENT_ID;
        delete process.env.GOOGLE_CLIENT_SECRET;
        delete process.env.GOOGLE_CALLBACK_URL;
        delete process.env.GITHUB_CLIENT_ID;
        delete process.env.GITHUB_CLIENT_SECRET;
        delete process.env.GITHUB_CALLBACK_URL;

        jest.resetModules();

        app = require("../../src/app");
    });

    it("should return 503 for google when not configured", async () => {
        const response = await request(app).get("/api/auth/google");

        expect(response.statusCode).toBe(503);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("OAuth is not configured");
    });

    it("should return 503 for the google callback when not configured", async () => {
        const response = await request(app).get("/api/auth/google/callback");

        expect(response.statusCode).toBe(503);
    });

    it("should return 503 for github when not configured", async () => {
        const response = await request(app).get("/api/auth/github");

        expect(response.statusCode).toBe(503);
    });

    it("should return 503 for the github callback when not configured", async () => {
        const response = await request(app).get("/api/auth/github/callback");

        expect(response.statusCode).toBe(503);
    });
});