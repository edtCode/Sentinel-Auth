require("dotenv").config();
const request = require("supertest")

const app = require('../src/app')

describe("Application", () => {
    it("should return 404 for unknown routes", async() => {
        const response = await request(app).get("/unknown-route");

        expect(response.statusCode).toBe(404)

    })
})