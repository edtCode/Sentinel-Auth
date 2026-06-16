const pool = require('../config/db')

const { hashPassword, comparePassword } = require('../utils/hash')

const logger = require('../utils/logger')

const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt')

const crypto = require("crypto")

const register = async (req, res) => {
    try {

        const { name, email, password } = req.body

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
            'INSERT INTO users ( name,email,password,is_verified ) VALUES ( $1,$2,$3,$4 ) RETURNING id,name,email,role,is_verified,created_at',
            [name, email, hashedPassword, false]
        )

        const verificationToken = crypto.randomBytes(32).toString("hex")

        await pool.query(
            `INSERT INTO email_verification_tokens( user_id, token, expires_at) VALUES ( $1,$2 , NOW() + INTERVAL '24 hours')`,
            [ newUser.rows[0].id,verificationToken ]
        )

        logger.info({
            user_id: newUser.rows[0].id,
            email
        },"Email verification token generated")

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            verificationToken,
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
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );

        if (userResult.rows.length === 0) {

            await pool.query(
                'INSERT INTO failed_login_logs (email,  ip_address, user_agent, reason) VALUES ($1, $2, $3, $4)',

                [email, req.ip, req.get("User-Agent"), "User not found"]
            )

            logger.warn(
                { email },
                "Login failed: User not found"
            );

            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const user = userResult.rows[0];

        if(!user.is_verified){

            logger.warn({
                userId: user.id,
                email: user.email
            }<"Login failed : Email is not verified")

            return res.status(401).json({
                success: false,
                message: "Please verify you login first"
            })
        }

        if (
            user.account_locked_until &&
            new Date(user.account_locked_until) >
            new Date()
        ) {

            await pool.query(
                `INSERT INTO failed_login_logs ( email, ip_address, user_agent, reason) VALUES ( $1, $2, $3, $4)`,

                [email, req.ip, req.get("User-Agent"), "Account locked"]
            )
            logger.warn(
                {
                    userId: user.id,
                    email: user.email,
                },
                "Login blocked: Account locked"
            );

            return res.status(423).json({
                success: false,
                message:
                    "Account is temporarily locked",
            });
        }

        const passwordValid =
            await comparePassword(
                password,
                user.password
            );

        if (!passwordValid) {
            const failedAttempts =
                user.failed_attempts + 1;


            await pool.query(
                `INSERT INTO failed_login_logs ( email, ip_address, user_agent, reason) VALUES ( $1, $2, $3, $4)`,

                [email, req.ip, req.get("User-Agent"), "Invalid password"]
            )

            await pool.query(

                `UPDATE users SET failed_attempts = $1 WHERE id = $2`,

                [failedAttempts, user.id,]
            );

            if (failedAttempts >= 5) {
                await pool.query(

                    ` UPDATE users SET failed_attempts = 0, account_locked_until = NOW() + INTERVAL '15 minutes' WHERE id = $1 `,
                    [user.id]

                );

                logger.warn(
                    {
                        userId: user.id,
                        email: user.email,
                    },
                    "Account locked due to failed logins"
                );

                return res.status(423).json({
                    success: false,
                    message:
                        "Account locked for 15 minutes",
                });
            }

            logger.warn(
                {
                    userId: user.id,
                    email: user.email,
                    failedAttempts,
                },
                "Invalid password"
            );

            return res.status(401).json({
                success: false,
                message:
                    "Invalid credentials",
            });
        }

        await pool.query(

            `UPDATE users SET failed_attempts = 0, account_locked_until = NULL WHERE id = $1 `,
            [user.id]

        );

        const accessToken = generateAccessToken(user)

        const refreshToken = generateRefreshToken(user)

        await pool.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'7 days\')',
            [user.id, refreshToken]
        )

        await pool.query(
            `INSERT INTO login_logs (user_id, ip_address, user_agent) VALUES($1,$2,$3)`,

            [user.id, req.ip, req.get("User-Agent")]
        )

        logger.info({
            userId: user.id,
            email,
            ip: req.ip,

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
        });
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
};

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

const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body

        const userResult = await pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        )

        if (userResult.rows.length === 0) {

            logger.warn({
                email,
                ip: req.ip
            }, "Password reset request for non-existent email")

            return res.status(200).json({
                success: true,
                message: "If the email exists, a reset link has been sent"
            })
        }

        const user = userResult.rows[0]

        const resetToken = crypto.randomBytes(32)
            .toString("hex")

        await pool.query(
            `INSERT INTO password_reset_tokens ( user_id,token,expires_at ) VALUES ( $1, $2, NOW() + INTERVAL '1 hour')`,
            [user.id, resetToken]
        )

        logger.info({
            userId: user.id,
            email: user.email,
            ip: req.ip,
        }, "Password reset token generated")

        return res.status(200).json({
            success: true,
            message: "Password reset token generated",
            resetToken,
        })
    } catch (error) {

        logger.error({
            error: error.message
        }, "Forget password failed")

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body
    
        const tokenResult = await pool.query(
            `SELECT * FROM password_reset_tokens where token = $1`,
            [token]
        )

        if (tokenResult.rows.length === 0) {
            logger.warn({
                token,
                ip: req.ip
            })

            return res.status(400).json({
                success: false,
                message: "Invalid reset token"
            })
        }

        const resetToken = tokenResult.rows[0]

       if (new Date(resetToken.expires_at) < new Date()) {

            logger.warn({
                token
            }, "Reset token expired")
            
             return res.status(400).json({
            success: false,
            message: "Reset token expired"
        })

        }
       
        const hashedPassword = await hashPassword(newPassword)

        await pool.query(
            `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 `,
            [ hashedPassword,resetToken.user_id ]
        )

        await pool.query(
            `DELETE FROM password_reset_tokens WHERE token = $1`,
            [token]
        )

        await pool.query(
            `INSERT INTO password_change_logs ( user_id ) VALUES ( $1 )`,
            [resetToken.user_id]
        )

        logger.info({
            userId: resetToken.user_id,
            ip: req.ip
        },"Password reset successful ")

        return res.status(200).json({
            success: true,
            message: "Password reset successful"
        })


    } catch (error) {

        logger.error({
            error: error.message
        },"Reset password failed")

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const changePassword = async(req,res)=>{
    try {

        const { currentPassword,newPassword } = req.body

        const userResult = await pool.query(
            `SELECT * FROM users WHERE id = $1`,
            [req.user.id]
        )

        if(userResult.rows.length === 0){
            logger.warn({
                userId: req.user.id
            },"User not found")

            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        
        const user = userResult.rows[0]

        const passwordValid = await comparePassword(currentPassword,user.password)

        if(!passwordValid){
            logger.warn({
                userId: user.id,
                ip: req.ip,
            },"Incorrect current password")

            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            })
        }

        const hashedPassword = await hashPassword(newPassword)

        await pool.query(
            `UPDATE users SET password = $1 , updated_at = NOW() WHERE id = $2`,
            [ hashedPassword,user.id ]
        )

        await pool.query(
            `INSERT INTO password_change_logs ( user_id ) VALUES( $1 )`,
            [user.id]
        )

        logger.info({
            userId: user.id,
            ip: req.ip
        },"Password changed successfully")

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        })

    } catch (error) {

         console.error(error.stack);
        logger.error({
            error: error.message
        },"Change password failed")

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
 }

 const verifyEmail = async(req,res)=>{
    try {
        const { token } = req.body

    const tokenResult= await pool.query(
        `SELECT * FROM email_verification_tokens WHERE token = $1`,
        [token]
    )
    if(tokenResult.rows.length === 0){

        logger.warn({
            token,
        },"Invalid verification token")

        return res.status(400).json({
            success: false,
            message: "Invalid verification token"
        })
    }
        const verificationToken = tokenResult.rows[0]

        if(new Date(verificationToken.expires_at) < new Date()){
            
            logger.warn({
                token,
            },"Verification token expired")

            return res.status(400).json({
                success: false,
                message: "Verification token expired"
            })
        }

        await pool.query(
            `UPDATE users SET is_verified = true WHERE id =  $1`,
            [verificationToken.user_id]
        )

        await pool.query(
            `DELETE FROM email_verification_tokens WHERE token = $1`,
            [token]
        )

        logger.info({
            userId: verificationToken.user_id,
        },"Email verified succesfully")

        return res.status(200).json({
            success: true,
            message: "Email verified succesfully"
        })

    }
        catch (error) {
        logger.error({
            error: error.message
        },"Email verification failed")

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
 }

 const resendVerification = async(req,res)=>{
    try {
        const {email} = req.body

    const userResult = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    )

    if(userResult.rows.length === 0){
        logger.warn({
            email,
        },"Verification request from non-existing email")

        return res.status(200).json({
            success: true,
            message: "Verification email sent"
        })
    }

    const user = userResult.rows[0]
     if(user.is_verified){
        logger.info({
            userId: user.id,
            email: user.email
        },"Email already verified")

        return res.status(400).json({
            success: false,
            message: "Email is already verified"
        })
     }

     await pool.query(
        `DELETE FROM email_verification_tokens WHERE user_id = $1`,
        [user.id]
     )

     const verificationToken = crypto.randomBytes(32).toString("hex")

     await pool.query(
        `INSERT INTO email_verification_tokens (user_id,token,expires_at) VALUES ($1,$2,NOW() + INTERVAL '24 hours')`,
        [user.id,verificationToken]
     )
     logger.warn({
        userId: user.id,
        email: user.email
     },"Verification token resent")

     return res.status(200).json({
        success: true,
        message: "Verification email sent",
        verificationToken
     })
    } catch (error) {
        logger.error({
            error: error.message
        },"Resend verification failed")

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
    getProfile,
    forgetPassword,
    resetPassword,
    changePassword,
    verifyEmail,
    resendVerification
}
