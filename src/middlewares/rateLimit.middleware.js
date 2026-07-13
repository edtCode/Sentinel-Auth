const rateLimit = require("express-rate-limit")
const logger = require('../utils/logger')

const loginLimiter =
    rateLimit({
        windowMs: 15 * 60 * 1000,

        max: 5,

        message: {
            success: false,
            message: "Too much login attempts . Try again later"
        },

        standardHeaders: true,

        legacyHeaders: false,

        handler: (req, res, next, options) => {

            logger.warn(
                {
                    ip: req.ip,
                    url: req.originalUrl,
                },
                "Rate limit exceeded"
            );

            res.status(options.statusCode).json(
                options.message
            );
        }

    })

const registerLimiter =
    rateLimit({
        windowMs: 60 * 60 * 1000,

        max: 10,

        message: {
            success: false,
            message: "Too many registration attempts . Try again later"
        },
        standardHeaders: true,

        legacyHeaders: false,

        handler: (req, res, next, options) => {

            logger.warn(
                {
                    ip: req.ip,
                    url: req.originalUrl,
                },
                "Rate limit exceeded"
            );

            res.status(options.statusCode).json(
                options.message
            );
        }
    })

const refreshTokenLimiter =
    rateLimit({
        windowMs: 15 * 60 * 1000,

        max: 20,

        message: {
            success: false,
            message: "Too many refresh request. Try again later"
        },

        standardHeaders: true,

        legacyHeaders: false,

        handler: (req, res, next, options) => {

            logger.warn(
                {
                    ip: req.ip,
                    url: req.originalUrl,
                },
                "Rate limit exceeded"
            );

            res.status(options.statusCode).json(
                options.message
            );
        }
    })

module.exports =
{
    loginLimiter,
    registerLimiter,
    refreshTokenLimiter
}