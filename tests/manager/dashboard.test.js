const request = require("supertest");

const app = require("../../src/app");

const { createUser } = require("../helpers/user");
const { login } = require("../helpers/auth");

const getToken = async (role) => {
    const user = await createUser({ role });

    const response = await login(user.email, "Password@123");

    return response.body.accessToken;
};

describe("Manager dashboard API", () => {
    describe("GET /api/manager/dashboard", () => {
        it("should return 200 for a manager role", async () => {
            const token = await getToken("MANAGER");

            const response = await request(app)
                .get("/api/manager/dashboard")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Welcome manager dashboard");
        });

        it("should return 200 for an admin role", async () => {
            const token = await getToken("ADMIN");

            const response = await request(app)
                .get("/api/manager/dashboard")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
        });

        it("should return 403 for a user role", async () => {
            const token = await getToken("USER");

            const response = await request(app)
                .get("/api/manager/dashboard")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(403);
        });

        it("should return 401 when no token is provided", async () => {
            const response = await request(app).get("/api/manager/dashboard");

            expect(response.statusCode).toBe(401);
        });

        it("should return 401 for an invalid token", async () => {
            const response = await request(app)
                .get("/api/manager/dashboard")
                .set("Authorization", "Bearer invalid-token");

            expect(response.statusCode).toBe(401);
        });
    });
});