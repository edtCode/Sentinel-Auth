const request = require("supertest");

const app = require("../../src/app");

const pool = require("../../src/config/db");

const { createUser } = require("../helpers/user");

describe("Forgot password API", () => {
    describe("POST /api/auth/forget-password", () => {
        it("should generate a reset token for an existing user", async () => {
            const user = await createUser();

            const response = await request(app)
                .post("/api/auth/forget-password")
                .send({ email: user.email });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.resetToken).toBeDefined();

            const tokenResult = await pool.query(
                `SELECT * FROM password_reset_tokens WHERE user_id = $1`,
                [user.id]
            );

            expect(tokenResult.rows.length).toBe(1);
            expect(tokenResult.rows[0].token).toBe(response.body.resetToken);
        });

        it("should return a generic message for a non-existent email", async () => {
            const response = await request(app)
                .post("/api/auth/forget-password")
                .send({ email: "doesnotexist@gmail.com" });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.resetToken).toBeUndefined();
            expect(response.body.message).toBe(
                "If the email exists, a reset link has been sent"
            );
        });

        it("should return 400 for an invalid email", async () => {
            const response = await request(app)
                .post("/api/auth/forget-password")
                .send({ email: "not-an-email" });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });
});