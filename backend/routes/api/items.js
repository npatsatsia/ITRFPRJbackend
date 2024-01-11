const express = require('express');
const router = express.Router();
const itemsController = require('../../controllers/itemsController')
const ROLES_LIST = require('../../config/roles_list')
const verifyRoles = require('../../middleware/verifyRoles')

router.route('/')
    .get(verifyRoles(ROLES_LIST.USER, ROLES_LIST.ADMIN), itemsController.getAllItems)
    .post(verifyRoles(ROLES_LIST.USER, ROLES_LIST.ADMIN), itemsController.addItem)
    .put(verifyRoles(ROLES_LIST.USER, ROLES_LIST.ADMIN), itemsController.editItem)
    .delete(verifyRoles(ROLES_LIST.USER, ROLES_LIST.ADMIN), itemsController.deleteItem)
    
module.exports = router