const request = require('supertest')

const app = require('../../src/app')
const { email } = require('zod')

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

        it("should return 409 if email is already exist", async () =>{

             const user = {
             name: "John Doe",
             email: "john@example.com",
             password: "Password@123"
    };

            await request(app)
            .post("/api/auth/register")
            .send(user)

            const response = await request(app)
            .post("/api/auth/register")
            .send(user)

            expect(response.statusCode).toBe(409)
        })

        it("should return 400 when email is invalid", async() =>{
            const user = {
             name: "John Doe",
             email: "john",
             password: "Password@123"
            }

            const response = await request(app)
            .post("/api/auth/register")
            .send(user)

            expect(response.statusCode).toBe(400)
        })

        it("should return 400 when name is missing", async() =>{
            
             const user = {
                name: " ",
                email: "brij@gmail.com",
                password: "Password@123"
             }

             const response = await request(app)
             .post("/api/auth/register")
             .send(user)

             expect(response.statusCode).toBe(400)
        })

    })
})