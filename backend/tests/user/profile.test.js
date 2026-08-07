const request = require("supertest");

const app = require("../../src/app");

const { loginUser } = require("../helpers/auth");

describe("User profile API", () => {
    describe("GET /api/users/me", () => {
        it("should return the authenticated user profile", async () => {
            const { accessToken } = await loginUser();

            const response = await request(app)
                .get("/api/users/me")
                .set("Authorization", `Bearer ${accessToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.email).toBe("alex12@gmail.com");
            expect(response.body.user.name).toBe("alex");
        });

        it("should return 401 when no token is provided", async () => {
            const response = await request(app).get("/api/users/me");

            expect(response.statusCode).toBe(401);
        });

        it("should return 401 for an invalid token", async () => {
            const response = await request(app)
                .get("/api/users/me")
                .set("Authorization", "Bearer invalid-token");

            expect(response.statusCode).toBe(401);
        });
    });
});