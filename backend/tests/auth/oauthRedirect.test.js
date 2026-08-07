const request = require("supertest");

const app = require("../../src/app");

describe("OAuth redirect API", () => {
    it("GET /api/auth/google should redirect to Google", async () => {
        const response = await request(app).get("/api/auth/google");

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toContain(
            "accounts.google.com"
        );
    });

    it("GET /api/auth/github should redirect to GitHub", async () => {
        const response = await request(app).get("/api/auth/github");

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toContain(
            "github.com/login/oauth"
        );
    });

    it("GET /api/auth/oauth/failure should return 401", async () => {
        const response = await request(app).get("/api/auth/oauth/failure");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("OAuth authentication failed");
    });
});