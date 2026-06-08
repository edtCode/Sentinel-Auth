const exprees = require('express')

const router = exprees.Router()

const { getManagerDashboard } = require('../controllers/manager.controller')

const authorize = require('../middlewares/rbac.middleware')

const authenticate = require('../middlewares/auth.middleware')

router.get("/dashboard",authenticate,authorize("ADMIN","MANAGER"),getManagerDashboard)

module.exports = router