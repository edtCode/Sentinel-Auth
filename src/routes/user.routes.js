const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/auth.middleware')
const { getProfile } = require('../controllers/auth.controllers')

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get("/me",authenticate,getProfile)

module.exports = router