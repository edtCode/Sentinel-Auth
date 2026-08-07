const request = require("supertest");

const crypto = require("crypto");

const app = require("../../src/app");

const pool = require("../../src/config/db");

const { createUser } = require("../helpers/user");

describe("Reset password API", () => {
    describe("POST /api/auth/reset-password", () => {
        it("should reset the password and allow login with the new password", async () => {
            const user = await createUser();

            const forgotResponse = await request(app)
                .post("/api/auth/forget-password")
                .send({ email: user.email });

            const newPassword = "NewPassword@456";

            const response = await request(app)
                .post("/api/auth/reset-password")
                .send({
                    token: forgotResponse.body.resetToken,
                    newPassword,
                });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Password reset successful");

            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send({ email: user.email, password: newPassword });

            expect(loginResponse.statusCode).toBe(200);
            expect(loginResponse.body.accessToken).toBeDefined();
        });

        it("should return 400 for an invalid reset token", async () => {
            const response = await request(app)
                .post("/api/auth/reset-password")
                .send({ token: "invalid-token", newPassword: "NewPassword@456" });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Invalid reset token");
        });

        it("should return 400 for an expired reset token", async () => {
            const user = await createUser();

            const expiredToken = crypto.randomBytes(32).toString("hex");

            await pool.query(
                `INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() - INTERVAL '1 hour')`,
                [user.id, expiredToken]
            );

            const response = await request(app)
                .post("/api/auth/reset-password")
                .send({
                    token: expiredToken,
                    newPassword: "NewPassword@456",
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Reset token expired");
        });

        it("should return 400 for a weak new password", async () => {
            const response = await request(app)
                .post("/api/auth/reset-password")
                .send({ token: "some-token", newPassword: "short" });

            expect(response.statusCode).toBe(400);
        });
    });
});