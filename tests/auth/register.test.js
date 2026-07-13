const request = require('supertest')

const app = require('../../src/app')

describe("Register API ", () => {
    describe("POST /api/auth/register", () => {
        
        it("should register the new user successfully", async() => {
            const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Rohan",
                email: "rohan@gmail.com",
                password: "Password@123"
            })

            expect(response.statusCode).toBe(201)

        })

    })
})