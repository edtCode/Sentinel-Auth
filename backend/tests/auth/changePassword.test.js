const request = require("supertest");

const app = require("../../src/app");

const { loginUser } = require("../helpers/auth");

describe("Change password API", () => {
    describe("POST /api/auth/change-password", () => {
        it("should change the password and allow login with the new one", async () => {
            const { accessToken } = await loginUser();

            const response = await request(app)
                .post("/api/auth/change-password")
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    currentPassword: "Password@123",
                    newPassword: "NewPassword@456",
                });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);

            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "alex12@gmail.com",
                    password: "NewPassword@456",
                });

            expect(loginResponse.statusCode).toBe(200);
        });

        it("should return 401 when the current password is incorrect", async () => {
            const { accessToken } = await loginUser();

            const response = await request(app)
                .post("/api/auth/change-password")
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    currentPassword: "WrongPassword@123",
                    newPassword: "NewPassword@456",
                });

            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe(
                "Current password is incorrect"
            );
        });

        it("should return 401 when no auth token is provided", async () => {
            const response = await request(app)
                .post("/api/auth/change-password")
                .send({
                    currentPassword: "Password@123",
                    newPassword: "NewPassword@456",
                });

            expect(response.statusCode).toBe(401);
        });

        it("should return 400 for a weak new password", async () => {
            const { accessToken } = await loginUser();

            const response = await request(app)
                .post("/api/auth/change-password")
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    currentPassword: "Password@123",
                    newPassword: "short",
                });

            expect(response.statusCode).toBe(400);
        });
    });
});