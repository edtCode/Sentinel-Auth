const request = require('supertest')

const { createUser } = require("../helpers/user")

const app = require('../../src/app')
const { email } = require('zod')
const pool = require('../../src/config/db')

describe("Login api", () => {
    describe("/api/auth/login", () => {
        it("should ogin user successfully", async() => {

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

    })
})