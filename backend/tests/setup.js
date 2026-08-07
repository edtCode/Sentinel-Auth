const dotenv = require("dotenv");

dotenv.config({
    path: ".env.test",
    quiet: true,
});

const pool = require('../src/config/db')

const { clearDatabase } = require('./helpers/database')

beforeEach( async ()=> {
    await clearDatabase()
})

afterAll( async ()=>{
    await pool.end()
})