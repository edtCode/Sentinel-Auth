const request = require("supertest");

const jwt = require("jsonwebtoken");

const app = require("../../src/app");

const pool = require("../../src/config/db");

const { createUser } = require("../helpers/user");

const { loginUser } = require("../helpers/auth");

describe("Refresh token API", () => {
    describe("POST /api/auth/refresh-token", () => {
        it("should rotate the refresh token successfully", async () => {
            const { refreshToken } = await loginUser();

            const response = await request(app)
                .post("/api/auth/refresh-token")
                .send({ refreshToken });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.accessToken).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
            expect(response.body.refreshToken).not.toBe(refreshToken);

            const oldToken = await pool.query(
                `SELECT * FROM refresh_tokens WHERE token = $1`,
                [refreshToken]
            );

            const newToken = await pool.query(
                `SELECT * FROM refresh_tokens WHERE token = $1`,
                [response.body.refreshToken]
            );

            expect(oldToken.rows.length).toBe(0);
            expect(newToken.rows.length).toBe(1);
        });

        it("should return 401 when the refresh token is reused after rotation", async () => {
            const { refreshToken } = await loginUser();

            await request(app)
                .post("/api/auth/refresh-token")
                .send({ refreshToken });

            const response = await request(app)
                .post("/api/auth/refresh-token")
                .send({ refreshToken });

            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Invalid refresh token");
        });

        it("should return 401 for an invalid refresh token", async () => {
            const response = await request(app)
                .post("/api/auth/refresh-token")
                .send({ refreshToken: "not-a-real-token" });

            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it("should return 401 for an expired refresh token", async () => {
            const user = await createUser();

            const expiredToken = jwt.sign(
                { id: user.id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: "-1s" }
            );

            await pool.query(
                `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
                [user.id, expiredToken]
            );

            const response = await request(app)
                .post("/api/auth/refresh-token")
                .send({ refreshToken: expiredToken });

            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it("should return 401 when a valid token is not stored in the database", async () => {
            const user = await createUser();

            const orphanToken = jwt.sign(
                { id: user.id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: "7d" }
            );

            const response = await request(app)
                .post("/api/auth/refresh-token")
                .send({ refreshToken: orphanToken });

            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it("should return 400 when refresh token is missing", async () => {
            const response = await request(app)
                .post("/api/auth/refresh-token")
                .send({});

            expect(response.statusCode).toBe(400);
        });
    });
});
