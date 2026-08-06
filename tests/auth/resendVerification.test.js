const request = require("supertest");

const app = require("../../src/app");

const pool = require("../../src/config/db");

describe("Resend verification API", () => {
    describe("POST /api/auth/resend-verification", () => {
        it("should resend a verification token for an unverified user", async () => {
            const registerResponse = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Rohan",
                    email: "rohan@gmail.com",
                    password: "Password@123",
                });

            expect(registerResponse.statusCode).toBe(201);

            const response = await request(app)
                .post("/api/auth/resend-verification")
                .send({ email: "rohan@gmail.com" });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.verificationToken).toBeDefined();
            expect(response.body.verificationToken).not.toBe(
                registerResponse.body.verificationToken
            );

            const tokens = await pool.query(
                `SELECT * FROM email_verification_tokens WHERE user_id = $1`,
                [registerResponse.body.user.id]
            );

            expect(tokens.rows.length).toBe(1);
            expect(tokens.rows[0].token).toBe(
                response.body.verificationToken
            );
        });

        it("should return 400 when the email is already verified", async () => {
            const registerResponse = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Rohan",
                    email: "rohan@gmail.com",
                    password: "Password@123",
                });

            await request(app)
                .post("/api/auth/verify-email")
                .send({ token: registerResponse.body.verificationToken });

            const response = await request(app)
                .post("/api/auth/resend-verification")
                .send({ email: "rohan@gmail.com" });

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Email is already verified");
        });

        it("should return a generic message for a non-existent email", async () => {
            const response = await request(app)
                .post("/api/auth/resend-verification")
                .send({ email: "ghost@gmail.com" });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it("should return 400 for an invalid email", async () => {
            const response = await request(app)
                .post("/api/auth/resend-verification")
                .send({ email: "not-an-email" });

            expect(response.statusCode).toBe(400);
        });
    });
});