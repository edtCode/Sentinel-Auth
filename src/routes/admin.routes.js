const express = require('express')

const router = express.Router()

const authenticate = require('../middlewares/auth.middleware')

const authorize = require('../middlewares/rbac.middleware')

const { getAdminDashboard } = require('../controllers/admin.controller')

router.get("/dashboard",authenticate,authorize("ADMIN"),getAdminDashboard)

module.exports = router