const rateLimit = require("express-rate-limit")
const { success } = require("zod")

const loginLimiter = 
   rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 5,

    message: {
        success: false,
        message: "Too much login attempts . Try again later"
    },

    standardHeader: true,
    
    legacyHeaders: false,

   })

   module.exports = loginLimiter