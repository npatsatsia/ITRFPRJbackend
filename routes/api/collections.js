const express = require('express');
const router = express.Router();
const colectionsController = require('../../controllers/colectionsController')
const ROLES_LIST = require('../../config/roles_list')
const verifyRoles = require('../../middleware/verifyRoles')

router.route('/')
    .get(verifyRoles(ROLES_LIST.USER, ROLES_LIST.ADMIN), colectionsController.getPrivateCollections)
    .post(verifyRoles(ROLES_LIST.USER, ROLES_LIST.ADMIN), colectionsController.createCollection)
    .put(verifyRoles(ROLES_LIST.USER, ROLES_LIST.ADMIN), colectionsController.editCollection)
    
router.route('/admin')
    .get(verifyRoles(ROLES_LIST.ADMIN), colectionsController.getAllCollections)

router.route('/allowed')
    .get(colectionsController.allowedToManage)

router.route('/:id')
    .get(colectionsController.getCollectionPage)
    .delete(verifyRoles(ROLES_LIST.USER, ROLES_LIST.ADMIN), colectionsController.deleteCollection)

    
module.exports = router