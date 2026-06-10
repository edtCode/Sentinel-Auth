const express = require('express');

const router = express.Router();

const { register, login, refreshToken, logout } = require('../controllers/auth.controllers')

const validate = require('../middlewares/validate.middleware')

const { registerSchema, loginSchema, logoutSchema, refreshTokenSchema } = require('../validators/auth.validator')

const { loginLimiter } = require('../middlewares/rateLimit.middleware')

router.post("/register", validate(registerSchema), register);

router.post("/login",loginLimiter, validate(loginSchema), login)

router.post("/refresh-token",validate(refreshTokenSchema),refreshToken)

router.post("/logout",validate(logoutSchema),logout)

module.exports = router;