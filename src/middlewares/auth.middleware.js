const pool = require('../config/db')
const { verifyAccessToken } = require('../utils/jwt')
const logger = require('../utils/logger')

const authenticate = async (req, res, next) => {

    try {
        const authHeader = req.headers.authorization

        if (!authHeader) {
            return res.status(401).json({
                status: false,
                message: "Authorization header missing"
            })
        }

        const token = authHeader.split(" ")[1]

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token not found"
            })
        }

        const decoded = verifyAccessToken(token)

        const userResult = await pool.query(
            `SELECT id,name,email,role,is_verified FROM users WHERE id = $1`,
            [decoded.id]
        )

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            })
        }

        req.user = userResult.rows[0]

        next()

    } catch (error) {
        logger.error({
            error: error.message
        }, "Authentication failed")

        return res.status(500).json({
            success: false,
            message: "Invalid access token"
        })
    }
}

module.exports = authenticate