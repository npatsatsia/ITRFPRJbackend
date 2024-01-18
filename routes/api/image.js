const express = require('express')
const router = express.Router()
const uploadController = require('../../controllers/imageController')

router.post('/upload', uploadController.handleImageUpload);
router.post('/delete', uploadController.handleImageDelete);

module.exports = router;