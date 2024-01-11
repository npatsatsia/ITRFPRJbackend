const express = require('express');
const router = express.Router();
const colectionsController = require('../../controllers/colectionsController')
const ROLES_LIST = require('../../config/roles_list')
const verifyRoles = require('../../middleware/verifyRoles')

router.route('/')
    .get(verifyRoles(ROLES_LIST.USER, ROLES_LIST.ADMIN), colectionsController.getCollections)
    .post(verifyRoles(ROLES_LIST.USER, ROLES_LIST.ADMIN), colectionsController.createCollection)
    .put(verifyRoles(ROLES_LIST.USER, ROLES_LIST.ADMIN), colectionsController.editCollection)
    .delete(verifyRoles(ROLES_LIST.USER, ROLES_LIST.ADMIN), colectionsController.deleteCollection)
    
module.exports = router