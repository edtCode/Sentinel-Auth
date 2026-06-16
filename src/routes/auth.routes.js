const express = require('express');

const router = express.Router();

const authenticate = require('../middlewares/auth.middleware')

const { register, login, refreshToken, logout, forgetPassword, resetPassword, changePassword, verifyEmail, resendVerification } = require('../controllers/auth.controllers')

const validate = require('../middlewares/validate.middleware')

const { registerSchema, loginSchema, logoutSchema, refreshTokenSchema, forgetPasswordSchema, resetPasswordSchema, changePasswordSchema, verifyEmailSchema, resendVerificationSchema } = require('../validators/auth.validator')

const { loginLimiter, registerLimiter, refreshTokenLimiter } = require('../middlewares/rateLimit.middleware')

router.post("/register",registerLimiter, validate(registerSchema), register);

router.post("/login",loginLimiter, validate(loginSchema), login)

router.post("/refresh-token",refreshTokenLimiter,validate(refreshTokenSchema),refreshToken)

router.post("/logout",validate(logoutSchema),logout)

router.post("/forget-password",validate(forgetPasswordSchema),forgetPassword)

router.post("/reset-password",validate(resetPasswordSchema),resetPassword)

router.post("/change-password",authenticate,validate(changePasswordSchema),changePassword)

router.post("/verify-email",validate(verifyEmailSchema),verifyEmail)

router.post("/resend-verification",validate(resendVerificationSchema),resendVerification)

module.exports = router;