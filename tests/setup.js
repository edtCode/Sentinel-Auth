const dotenv = require("dotenv");

dotenv.config({
    path: ".env.test"
});

beforeAll(() => {
    console.log("Starting test suite...")
})


afterAll(() => {
    console.log("Finished test suite...")
})