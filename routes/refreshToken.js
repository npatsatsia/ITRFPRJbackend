const express = require('express')
const router = express.Router()
const refreshTokenController = require('../controllers/refreshTokenController')
const {isLoggedin} = require('../config/passportConfig')

isLoggedin()

router.get('/', refreshTokenController.handleRefreshToken);

module.exports = router;