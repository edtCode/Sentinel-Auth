const request = require("supertest");

const app = require("../../src/app");

const pool = require("../../src/config/db");

let mockGoogleBehavior = "success";
let mockGithubBehavior = "success";

jest.mock("passport-google-oauth20", () => {
    const { Strategy: BaseStrategy } = jest.requireActual("passport");

    return {
        Strategy: class MockGoogleStrategy extends BaseStrategy {
            constructor(options, verify) {
                super();
                this.name = "google";
                this._verify = verify;
                this.options = options;
            }

            authenticate() {
                if (mockGoogleBehavior === "fail") {
                    return this.fail("google auth failed");
                }

                const profile = {
                    id: "google-user-123",
                    displayName: "Google User",
                    emails: [{ value: "oauth.google@gmail.com", verified: true }],
                    provider: "google",
                };

                this._verify("mock-access-token", null, profile, (err, user) => {
                    if (err) {
                        return this.error(err);
                    }
                    return this.success(user);
                });
            }
        },
    };
});

jest.mock("passport-github2", () => {
    const { Strategy: BaseStrategy } = jest.requireActual("passport");

    return {
        Strategy: class MockGitHubStrategy extends BaseStrategy {
            constructor(options, verify) {
                super();
                this.name = "github";
                this._verify = verify;
                this.options = options;
            }

            authenticate() {
                if (mockGithubBehavior === "fail") {
                    return this.fail("github auth failed");
                }

                const profile = {
                    id: "github-user-456",
                    username: "octocat",
                    displayName: "Octo Cat",
                    emails: [{ value: "octocat@users.noreply.github.com", verified: true }],
                    provider: "github",
                };

                this._verify("mock-access-token", null, profile, (err, user) => {
                    if (err) {
                        return this.error(err);
                    }
                    return this.success(user);
                });
            }
        },
    };
});

describe("OAuth callback API", () => {
    describe("GET /api/auth/google/callback", () => {
        it("should create a user and return tokens on success", async () => {
            const response = await request(app).get(
                "/api/auth/google/callback"
            );

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.accessToken).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
            expect(response.body.user.email).toBe("oauth.google@gmail.com");
            expect(response.body.user.provider).toBe("google");

            const userResult = await pool.query(
                `SELECT * FROM users WHERE email = $1`,
                ["oauth.google@gmail.com"]
            );

            expect(userResult.rows.length).toBe(1);
            expect(userResult.rows[0].provider).toBe("google");
            expect(userResult.rows[0].provider_id).toBe("google-user-123");
            expect(userResult.rows[0].is_verified).toBe(true);
        });

        it("should reuse the existing user on a second login", async () => {
            await request(app).get("/api/auth/google/callback");

            const response = await request(app).get(
                "/api/auth/google/callback"
            );

            expect(response.statusCode).toBe(200);
            expect(response.body.user.email).toBe("oauth.google@gmail.com");

            const countResult = await pool.query(
                `SELECT COUNT(*) FROM users WHERE provider = 'google'`
            );

            expect(Number(countResult.rows[0].count)).toBe(1);

            const refreshResult = await pool.query(
                `SELECT COUNT(*) FROM refresh_tokens`
            );

            expect(Number(refreshResult.rows[0].count)).toBe(2);
        });

        it("should redirect to the failure handler when auth fails", async () => {
            mockGoogleBehavior = "fail";

            const response = await request(app).get(
                "/api/auth/google/callback"
            );

            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe(
                "/api/auth/oauth/failure"
            );

            mockGoogleBehavior = "success";
        });
    });

    describe("GET /api/auth/github/callback", () => {
        it("should create a user and return tokens on success", async () => {
            const response = await request(app).get(
                "/api/auth/github/callback"
            );

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.accessToken).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
            expect(response.body.user.email).toBe(
                "octocat@users.noreply.github.com"
            );
            expect(response.body.user.provider).toBe("github");

            const userResult = await pool.query(
                `SELECT * FROM users WHERE email = $1`,
                ["octocat@users.noreply.github.com"]
            );

            expect(userResult.rows.length).toBe(1);
            expect(userResult.rows[0].provider_id).toBe("github-user-456");
            expect(userResult.rows[0].is_verified).toBe(true);
        });

        it("should redirect to the failure handler when auth fails", async () => {
            mockGithubBehavior = "fail";

            const response = await request(app).get(
                "/api/auth/github/callback"
            );

            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe(
                "/api/auth/oauth/failure"
            );

            mockGithubBehavior = "success";
        });
    });

    describe("OAuth account linking", () => {
        it("should link an existing password account to the OAuth provider", async () => {
            const registerResponse = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Google User",
                    email: "oauth.google@gmail.com",
                    password: "Password@123",
                });

            expect(registerResponse.statusCode).toBe(201);

            const response = await request(app).get(
                "/api/auth/google/callback"
            );

            expect(response.statusCode).toBe(200);
            expect(response.body.user.id).toBe(registerResponse.body.user.id);

            const userResult = await pool.query(
                `SELECT * FROM users WHERE id = $1`,
                [registerResponse.body.user.id]
            );

            expect(userResult.rows[0].provider).toBe("google");
            expect(userResult.rows[0].provider_id).toBe("google-user-123");

            const countResult = await pool.query(
                `SELECT COUNT(*) FROM users`
            );

            expect(Number(countResult.rows[0].count)).toBe(1);
        });
    });
});