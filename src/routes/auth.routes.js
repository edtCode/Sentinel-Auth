const express = require('express');

const router = express.Router();

const { register, login, refreshToken, logout, forgetPassword } = require('../controllers/auth.controllers')

const validate = require('../middlewares/validate.middleware')

const { registerSchema, loginSchema, logoutSchema, refreshTokenSchema, forgetPasswordSchema } = require('../validators/auth.validator')

const { loginLimiter, registerLimiter, refreshTokenLimiter } = require('../middlewares/rateLimit.middleware')

router.post("/register",registerLimiter, validate(registerSchema), register);

router.post("/login",loginLimiter, validate(loginSchema), login)

router.post("/refresh-token",refreshTokenLimiter,validate(refreshTokenSchema),refreshToken)

router.post("/logout",validate(logoutSchema),logout)

router.post("/forget-password",validate(forgetPasswordSchema),forgetPassword)

module.exports = router;