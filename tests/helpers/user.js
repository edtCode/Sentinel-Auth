const bcrypt = require("bcrypt")
const pool = require("../../src/config/db")
const { email } = require("zod")

const createUser = async(overrides = {}) => {

    const user = {
        name: "alex",
        email: "alex12@gmail.com",
        password: "Password@123",
        role: "USER",
        is_verified: true,
        failed_attempts: 0,
        account_locked_until: null,
        ...overrides

    }

    const hashedPassword = await bcrypt.hash(user.password, 10)

    const result = await pool.query(
        `INSERT INTO users (name, email, password, role, is_verified, failed_attempts, account_locked_until) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [user.name, user.email, hashedPassword, user.role, user.is_verified, user.failed_attempts, user.account_locked_until]
    )

    return result.rows[0]
}

module.exports = {
    createUser
 }