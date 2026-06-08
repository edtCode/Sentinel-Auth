const pool = require('../config/db')

const { hashPassword, comparePassword } = require('../utils/hash')

const logger = require('../utils/logger');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { date, success } = require('zod');

const register = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email],
        )

        if (existingUser.rows.length > 0) {
            logger.warn(
                {
                    email,
                },
                "Email is already exist"
            )

            return res.status(409).json({
                success: false,
                message: "Email already exist"
            })
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await pool.query(
            'INSERT INTO users ( name,email,password ) VALUES ( $1,$2,$3 ) RETURNING id,name,email,role,is_verified,created_at',
            [name, email, hashedPassword]
        )

        logger.info({
            user_id: newUser.rows[0].id,
            email
        })

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: newUser.rows[0]
        })


    } catch (error) {

        logger.error({
            error: error.message
        },
            "Registration failed")

        return res.status(500).json({
            success: false,
            message: "Internal Server error"
        })

    }

}

const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        const userResult = await pool.query(

            'SELECT * FROM users WHERE email = $1',
            [email]

        )

        if (userResult.rows[0].length === 0) {

            logger.warn(

                { email }, "Login failed : User not found"

            )

            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            })
        }

        const user = userResult.rows[0];

        if ((user.account_locked_until) && new date(user.account_locked_until) > new date()) {
            logger.warn({
                userId: user.id,
                email: user.email
            }, "Login failed : Account is blocked")

            return res.status(423).json({
                success: false,
                message: "Account is temporarily locked"
            })
        }

        const passwordValid = await comparePassword(password, user.password)

        if (!passwordValid) {
            const failedAttempts = user.failed_attempts + 1

            if (failedAttempts >= 5) {
                await pool.query(
                    `UPDATE users SET failed_attempts = 0,
                account_locked_until = NOW() + INTERVAL '15 minutes' WHERE id = $1
                `,
                    [user.id]
                )

                logger.warn({
                    userId: user.id,
                    email: user.email
                }, "Account locked due to too many login attempts")

                return res.status(423).json({
                    success: false,
                    message: "Account locked for 15 minutes"
                })
            }
        }

        await pool.query(
            `UPDATE users SET failed_attempts = $1 WHERE id = $2`,
            [failedAttempts, user, id]
        )
        logger.warn({
            userId: user.id,
            email: user.id,
            failedAttempts
        }, "Invalid password")

        return res.status(401).json({
            success: false,
            message: "Invalid cretentials",
        })

        await pool.query(
        ` UPDATE users SET failed_attempts = 0,account_locked_until = NULL WHERE id = $1
         `,
            [user.id]
        );
        
        const accessToken = generateAccessToken(user)

        const refreshToken = generateRefreshToken(user)

        await pool.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'7 days\')',
            [user.id, refreshToken]
        )

        logger.info({
            userId: user.id,
            email,
        }, "User logged in successfully")

        return res.status(200).json({
            success: true,
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        })

    } catch (error) {
        logger.error(
            {
                error: error.message,
            },
            "Login failed"
        );

        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
        });
    }
}

const refreshToken = async (req, res) => {
    try {

        const { refreshToken } = req.body

        if (!refreshToken) {

            return res.status(401).json({
                success: false,
                message: "Refresh token is required"
            })

        }

        const decoded = verifyRefreshToken(refreshToken)

        const tokenResult = await pool.query(
            `SELECT * FROM refresh_tokens WHERE token = $1`,
            [refreshToken]
        )

        if (tokenResult.rows.length === 0) {

            logger.warn(
                'Refresh token not found'
            )

            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            })

        }

        const userResult = await pool.query(

            `SELECT * FROM users WHERE id = $1`,
            [decoded.id]

        )

        if (userResult.rows.length === 0) {

            return res.status(401).json({
                success: false,
                message: "User not found"

            })
        }

        const user = userResult.rows[0]

        const accessToken = generateAccessToken(user)

        logger.info(
            'Access token refreshed'
        )

        return res.status(200).json({
            success: true,
            accessToken,
        })

    } catch (error) {
        logger.error({
            error: error.message
        }, "Refresh token failed"
        )
        return res.status(401).json({
            success: false,
            message: "Invalid refersh token"
        })

    }
}

const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body

        const result = await pool.query(
            `DELETE FROM refresh_tokens WHERE token = $1 RETURNING id`,
            [refreshToken]
        )

        if (result.rows.length === 0) {

            logger.warn(
                "logout failed : Token not found"
            )

            return res.status(404).json({
                success: false,
                message: "Refresh token not found"
            })
        }

        logger.info(
            "Logout successfully"
        )

        return res.status(200).json({
            message: true,
            message: "User logout successfully"

        })

    } catch (error) {

        logger.error({
            error: error.message
        }, "Logout failed")


        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })

    }
}

const getProfile = async (req, res) => {
    try {
        logger.info(
            {
                userId: req.user.id
            }, "Profile fetched"
        )

        return res.status(200).json({
            success: true,
            user: req.user,
        })
    } catch (error) {
        logger.error({
            error: error.message
        }, "Profile fetched failed")

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    getProfile
}
