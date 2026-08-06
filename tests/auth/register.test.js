const request = require('supertest')

const app = require('../../src/app')

const pool = require('../../src/config/db')

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
            expect(response.body.success).toBe(true)
            expect(response.body.verificationToken).toBeDefined()
            expect(response.body.user.email).toBe("rohan@gmail.com")

            const tokenResult = await pool.query(
                `SELECT * FROM email_verification_tokens WHERE user_id = $1`,
                [response.body.user.id]
            )

            expect(tokenResult.rows.length).toBe(1)

            const auditResult = await pool.query(
                `SELECT * FROM audit_logs WHERE event_type = 'REGISTER' AND user_id = $1`,
                [response.body.user.id]
            )

            expect(auditResult.rows.length).toBe(1)

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
                email: "brij@gmail.com",
                password: "Password@123"
             }

             const response = await request(app)
             .post("/api/auth/register")
             .send(user)

             expect(response.statusCode).toBe(400)
        })

        it("should return 400 when password is missing", async() =>{

            const user = {
                name: "raju",
                email: "raj@gmail.com",
            }

            const response = await request(app)
            .post("/api/auth/register")
            .send(user)

            expect(response.statusCode).toBe(400)
        })

        it("sholuld return 400 when the password is weak ", async()=>{

            const user = {
                name: "Kendrik lamar",
                email: "lamar420@gmail.com",
                password: "12344563"
            }

            const response = await request(app)
            .post("/api/auth/register")
            .send(user)

            expect(response.statusCode).toBe(400
                
            )
        })

    })
})