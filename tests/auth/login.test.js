const request = require('supertest')

const { createUser } = require("../helpers/user")

const app = require('../../src/app')

const pool = require('../../src/config/db')

describe("Login api", () => {
    describe("POST /api/auth/login", () => {
        it("should login user successfully", async() => {

            const user = await createUser()

            const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "alex12@gmail.com",
                password: "Password@123"
            })

            expect(response.statusCode).toBe(200)
            expect(response.body.accessToken).toBeDefined()
            expect(response.body.refreshToken).toBeDefined()

            const refreshTokenResult = await pool.query(
                `SELECT * FROM refresh_tokens WHERE user_id = $1`,
                [user.id]
            )

            expect(refreshTokenResult.rows.length).toBe(1)

        })

        it("should return 401 when password is incorrect and increase failed_attempts", async() => {

            const user = await createUser()

            const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "alex12@gmail.com",
                password: "nanhajkjskjs"
            })

            expect(response.statusCode).toBe(401)

            const result = await pool.query(
                `SELECT failed_attempts FROM users WHERE id = $1`,
                [user.id]
            )

            expect(result.rows[0].failed_attempts).toBe(1)
        })

        it("should return 401 email doesn't exist", async () => {

            const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "unknown@gmail.com",
                password: "Password@123"
            })

            expect(response.statusCode).toBe(401)

        })

        it("should return 401 when email is not verified", async() =>{
            
            await createUser({
                is_verified: false
            })

            const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "alex12@gmail.com",
                password: "Password@123"
            })

            expect(response.statusCode).toBe(401)

            expect(response.body.success).toBe(false)

            expect(response.body.message).toBe("Please verify you login first")

        })

        it("should return 401 when account is locked", async() => {

            await createUser({
                account_locked_until: new Date(Date.now() + 15 * 60 * 1000)
            })

            const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "alex12@gmail.com",
                password: "Password@123"
            })

            expect(response.statusCode).toBe(423)

            expect(response.body.success).toBe(false)

            expect(response.body.message).toBe("Account is temporarily locked")
        })

    })
})