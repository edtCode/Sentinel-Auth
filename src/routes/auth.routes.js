const express = require('express');

const router = express.Router();

const authenticate = require('../middlewares/auth.middleware')

const { register, login, refreshToken, logout, forgetPassword, resetPassword, changePassword, verifyEmail, resendVerification, logoutAllDevices } = require('../controllers/auth.controllers')

const validate = require('../middlewares/validate.middleware')

const { registerSchema, loginSchema, logoutSchema, refreshTokenSchema, forgetPasswordSchema, resetPasswordSchema, changePasswordSchema, verifyEmailSchema, resendVerificationSchema } = require('../validators/auth.validator')

const { loginLimiter, registerLimiter, refreshTokenLimiter } = require('../middlewares/rateLimit.middleware')

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */

router.post("/register",registerLimiter, validate(registerSchema), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: brij@gmail.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       423:
 *         description: Account locked
 */

router.post("/login",loginLimiter, validate(loginSchema), login)

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Generate new access token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed
 *       401:
 *         description: Invalid refresh token
 */

router.post("/refresh-token",refreshTokenLimiter,validate(refreshTokenSchema),refreshToken)

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout current session
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

router.post("/logout",validate(logoutSchema),logout)

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags:
 *       - Password Recovery
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset token generated
 */

router.post("/forget-password",validate(forgetPasswordSchema),forgetPassword)

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags:
 *       - Password Recovery
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated
 */

router.post("/reset-password",validate(resetPasswordSchema),resetPassword)

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change authenticated user's password
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: Password@123
 *               newPassword:
 *                 type: string
 *                 example: NewPassword@456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized or current password is incorrect
 */

router.post("/change-password",authenticate,validate(changePasswordSchema),changePassword)

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify email address
 *     tags:
 *       - Email Verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified
 */

router.post("/verify-email",validate(verifyEmailSchema),verifyEmail)

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     tags:
 *       - Email Verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification token resent
 */

router.post("/resend-verification",validate(resendVerificationSchema),resendVerification)

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices
 */

router.post("/logout-all",authenticate,logoutAllDevices)

module.exports = router;