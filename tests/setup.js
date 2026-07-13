const dotenv = require("dotenv");

const pool = require('../src/config/db')

const { clearDatabase } = require('./helpers/database')

dotenv.config({
    path: ".env.test"
});

beforeEach( async ()=> {
    await clearDatabase()
})

afterAll( async ()=>{
    await pool.end()
})