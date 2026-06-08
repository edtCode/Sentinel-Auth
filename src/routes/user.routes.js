const express = require('express')
const router = express.Router()
const autheticate = require('../middlewares/auth.middleware')
const { getProfile } = require('../controllers/auth.controllers')

router.get("/me",autheticate,getProfile)

module.exports = router