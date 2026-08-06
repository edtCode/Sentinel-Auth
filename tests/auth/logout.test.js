const request = require("supertest");

const app = require("../../src/app");

const pool = require("../../src/config/db");

const { loginUser } = require("../helpers/auth");

describe("Logout API", () => {
    describe("POST /api/auth/logout", () => {
        it("should logout and revoke the refresh token", async () => {
            const { refreshToken } = await loginUser();

            const response = await request(app)
                .post("/api/auth/logout")
                .send({ refreshToken });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("User logout successfully");

            const tokenResult = await pool.query(
                `SELECT * FROM refresh_tokens WHERE token = $1`,
                [refreshToken]
            );

            expect(tokenResult.rows.length).toBe(0);
        });

        it("should return 404 when the refresh token is not found", async () => {
            const response = await request(app)
                .post("/api/auth/logout")
                .send({ refreshToken: "non-existent-token" });

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe("Refresh token not found");
        });

        it("should return 400 when refresh token is missing", async () => {
            const response = await request(app)
                .post("/api/auth/logout")
                .send({});

            expect(response.statusCode).toBe(400);
        });
    });

    describe("POST /api/auth/logout-all", () => {
        it("should revoke all sessions for the user", async () => {
            const { accessToken } = await loginUser();

            // create a second session
            await loginUser();

            const sessionsBefore = await pool.query(
                `SELECT COUNT(*) FROM refresh_tokens`
            );

            expect(Number(sessionsBefore.rows[0].count)).toBe(2);

            const response = await request(app)
                .post("/api/auth/logout-all")
                .set("Authorization", `Bearer ${accessToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Logged out from all devices");

            const sessionsAfter = await pool.query(
                `SELECT COUNT(*) FROM refresh_tokens`
            );

            expect(Number(sessionsAfter.rows[0].count)).toBe(0);
        });
    });
});