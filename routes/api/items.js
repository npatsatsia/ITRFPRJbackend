const express = require('express');
const router = express.Router();
const itemsController = require('../../controllers/itemsController')
const ROLES_LIST = require('../../config/roles_list')
const verifyRoles = require('../../middleware/verifyRoles')
const {isLoggedin} = require('../../config/passportConfig')

isLoggedin()


router.route('/')
    .post(verifyRoles(ROLES_LIST.USER, ROLES_LIST.ADMIN), itemsController.addItem)
    .put(verifyRoles(ROLES_LIST.USER, ROLES_LIST.ADMIN), itemsController.editItem)
    .delete(verifyRoles(ROLES_LIST.USER, ROLES_LIST.ADMIN), itemsController.deleteItem)

router.route('/:id')
    .get(itemsController.getAllItems)
    
router.route('/item/:id')
    .get(itemsController.getSingleItem)

    
module.exports = router