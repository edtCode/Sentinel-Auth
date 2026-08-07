const request = require("supertest");

const crypto = require("crypto");

const app = require("../../src/app");

const pool = require("../../src/config/db");

const { createUser } = require("../helpers/user");

describe("Email verification API", () => {
    describe("POST /api/auth/verify-email", () => {
        it("should verify the email and allow login", async () => {
            const registerResponse = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Rohan",
                    email: "rohan@gmail.com",
                    password: "Password@123",
                });

            expect(registerResponse.statusCode).toBe(201);
            expect(registerResponse.body.verificationToken).toBeDefined();

            const response = await request(app)
                .post("/api/auth/verify-email")
                .send({ token: registerResponse.body.verificationToken });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Email verified successfully");

            const userResult = await pool.query(
                `SELECT is_verified FROM users WHERE email = $1`,
                ["rohan@gmail.com"]
            );

            expect(userResult.rows[0].is_verified).toBe(true);

            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "rohan@gmail.com",
                    password: "Password@123",
                });

            expect(loginResponse.statusCode).toBe(200);
        });

        it("should return 400 for an invalid verification token", async () => {
            const response = await request(app)
                .post("/api/auth/verify-email")
                .send({ token: "invalid-token" });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Invalid verification token");
        });

        it("should return 400 for an expired verification token", async () => {
            const user = await createUser({ is_verified: false });

            const expiredToken = crypto.randomBytes(32).toString("hex");

            await pool.query(
                `INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() - INTERVAL '1 hour')`,
                [user.id, expiredToken]
            );

            const response = await request(app)
                .post("/api/auth/verify-email")
                .send({ token: expiredToken });

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Verification token expired");
        });

        it("should return 400 when token is missing", async () => {
            const response = await request(app)
                .post("/api/auth/verify-email")
                .send({});

            expect(response.statusCode).toBe(400);
        });
    });
});
