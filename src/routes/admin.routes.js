const express = require('express')

const router = express.Router()

const authenticate = require('../middlewares/auth.middleware')

const authorize = require('../middlewares/rbac.middleware')

const { getAdminDashboard } = require('../controllers/admin.controller')

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Access admin dashboard
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

router.get("/dashboard",authenticate,authorize("ADMIN"),getAdminDashboard)

module.exports = router