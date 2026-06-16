const exprees = require('express')

const router = exprees.Router()

const { getManagerDashboard } = require('../controllers/manager.controller')

const authorize = require('../middlewares/rbac.middleware')

const authenticate = require('../middlewares/auth.middleware')

/**
 * @swagger
 * /api/manager/dashboard:
 *   get:
 *     summary: Access manager dashboard
 *     tags:
 *       - Manager
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Manager dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Manager access required
 */

router.get("/dashboard",authenticate,authorize("ADMIN","MANAGER"),getManagerDashboard)

module.exports = router