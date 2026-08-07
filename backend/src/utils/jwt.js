const jwt = require('jsonwebtoken')

const crypto = require('crypto')

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m",
        }
    )
}

const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            jti: crypto.randomUUID(),
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: "7d",
        }
    )
}

const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET)
}

const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
}