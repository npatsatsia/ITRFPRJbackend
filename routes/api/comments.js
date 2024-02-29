const express = require('express');
const router = express.Router();
const commentsController = require('../../controllers/commentsController')
const ROLES_LIST = require('../../config/roles_list')
const verifyRoles = require('../../middleware/verifyRoles')
const {isLoggedin} = require('../../config/passportConfig')

isLoggedin()

router.route('/:itemId')
    .get(commentsController.handleGetComments)
    .put(verifyRoles(ROLES_LIST.USER, ROLES_LIST.ADMIN), commentsController.handlePutComment)
    .delete(verifyRoles(ROLES_LIST.USER, ROLES_LIST.ADMIN), commentsController.handleDeleteComment)

    
module.exports = router