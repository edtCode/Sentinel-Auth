const express = require('express')

const router = express.Router()

const authenticate = require('../middlewares/auth.middleware')

const { getProfile } = require('../controllers/auth.controllers')

router.get("/me",authenticate,getProfile)

module.exports = router
