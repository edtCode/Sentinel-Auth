const request = require('supertest')

const { createUser } = require("../helpers/user")

const app = require('../../src/app')
const { email } = require('zod')

describe("Login api", () => {
    describe("/api/auth/login", () => {
        it("should ogin user successfully", async() => {

            await createUser()

            const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "alex12@gmail.com",
                password: "Password@123"
            })

            expect(app.response.statusCode).toBe(200)

        })

    })
})