const express = require("express");

const router = express.Router();

const {
    googleAuth,
    googleCallback,
    githubAuth,
    githubCallback,
    oauthFailure,
} = require("../controllers/oauth.controller");

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Start Google OAuth login
 *     tags:
 *       - OAuth
 *     responses:
 *       302:
 *         description: Redirect to Google consent screen
 */
router.get("/google", googleAuth);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags:
 *       - OAuth
 *     responses:
 *       200:
 *         description: Returns access & refresh tokens
 *       401:
 *         description: OAuth authentication failed
 */
router.get("/google/callback", googleCallback);

/**
 * @swagger
 * /api/auth/github:
 *   get:
 *     summary: Start GitHub OAuth login
 *     tags:
 *       - OAuth
 *     responses:
 *       302:
 *         description: Redirect to GitHub authorize screen
 */
router.get("/github", githubAuth);

/**
 * @swagger
 * /api/auth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback
 *     tags:
 *       - OAuth
 *     responses:
 *       200:
 *         description: Returns access & refresh tokens
 *       401:
 *         description: OAuth authentication failed
 */
router.get("/github/callback", githubCallback);

/**
 * @swagger
 * /api/auth/oauth/failure:
 *   get:
 *     summary: OAuth failure handler
 *     tags:
 *       - OAuth
 *     responses:
 *       401:
 *         description: OAuth authentication failed
 */
router.get("/oauth/failure", oauthFailure);

module.exports = router;