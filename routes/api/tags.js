const express = require('express');
const router = express.Router();
const tagsController = require('../../controllers/tagsController')
const ROLES_LIST = require('../../config/roles_list')
const verifyRoles = require('../../middleware/verifyRoles')
const {isLoggedin} = require('../../config/passportConfig')

isLoggedin()

router.route('/:name')
    .get(verifyRoles(ROLES_LIST.USER, ROLES_LIST.ADMIN), tagsController.handleSearchTag)

router.route('/')
    .post(verifyRoles(ROLES_LIST.USER, ROLES_LIST.ADMIN), tagsController.handleAddTag)


    
module.exports = router