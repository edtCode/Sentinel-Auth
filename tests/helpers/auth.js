const request = require("supertest");

const app = require("../../src/app");

const login = async (
    email = "alex12@gmail.com",
    password = "Password@123"
) => {
    return request(app)
        .post("/api/auth/login")
        .send({ email, password });
};

const registerAndVerify = async (overrides = {}) => {
    const user = {
        name: "alex",
        email: "alex12@gmail.com",
        password: "Password@123",
        ...overrides,
    };

    const registerResponse = await request(app)
        .post("/api/auth/register")
        .send(user);

    if (registerResponse.body.verificationToken) {
        await request(app)
            .post("/api/auth/verify-email")
            .send({ token: registerResponse.body.verificationToken });
    }

    return { ...registerResponse.body, ...user };
};

const loginUser = async (overrides = {}) => {
    await registerAndVerify(overrides);

    const response = await login(
        overrides.email || "alex12@gmail.com",
        overrides.password || "Password@123"
    );

    return response.body;
};

module.exports = {
    login,
    registerAndVerify,
    loginUser,
};
