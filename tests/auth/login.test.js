const request = require('supertest')

const { createUser } = require("../helpers/user")

const app = require('../../src/app')

const pool = require('../../src/config/db')
const { email } = require('zod')

describe("Login api", () => {
    describe("/api/auth/login", () => {
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

    })
})