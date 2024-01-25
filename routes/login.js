const express = require('express')
const router = express.Router()
const authController = require('../controllers/loginController')

router.post('/', authController.handleAuth);

module.exports = router;