const request = require("supertest");

const app = require("../../src/app");

const { createUser } = require("../helpers/user");

const { login } = require("../helpers/auth");

const getAdminToken = async (role) => {
    const user = await createUser({ role });

    const response = await login(user.email, "Password@123");

    return response.body.accessToken;
};

describe("Admin dashboard API", () => {
    describe("GET /api/admin/dashboard", () => {
        it("should return 200 for an admin role", async () => {
            const token = await getAdminToken("ADMIN");

            const response = await request(app)
                .get("/api/admin/dashboard")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Welcome Admin");
        });

        it("should return 403 for a manager role", async () => {
            const token = await getAdminToken("MANAGER");

            const response = await request(app)
                .get("/api/admin/dashboard")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(403);
            expect(response.body.message).toBe("Access denied");
        });

        it("should return 403 for a user role", async () => {
            const token = await getAdminToken("USER");

            const response = await request(app)
                .get("/api/admin/dashboard")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(403);
        });

        it("should return 401 when no token is provided", async () => {
            const response = await request(app).get("/api/admin/dashboard");

            expect(response.statusCode).toBe(401);
        });

        it("should return 401 for an invalid token", async () => {
            const response = await request(app)
                .get("/api/admin/dashboard")
                .set("Authorization", "Bearer invalid-token");

            expect(response.statusCode).toBe(401);
        });
    });
});