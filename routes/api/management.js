const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/managementController')
const ROLES_LIST = require('../../config/roles_list')
const verifyRoles = require('../../middleware/verifyRoles');
const {isLoggedin} = require('../../config/passportConfig')


isLoggedin()

router.route('/').get(verifyRoles(ROLES_LIST.ADMIN), usersController.getAllUsers)
router.route('/block').put(verifyRoles(ROLES_LIST.ADMIN), usersController.blockUser)
router.route('/unblock').put(verifyRoles(ROLES_LIST.ADMIN), usersController.unblockUser)
router.route('/makeadmin').put(verifyRoles(ROLES_LIST.ADMIN), usersController.addToAdmins)
router.route('/removeadmin').put(verifyRoles(ROLES_LIST.ADMIN), usersController.removeFromAdmins)
router.route('/:userId').delete(verifyRoles(ROLES_LIST.ADMIN), usersController.deleteUser)

    
module.exports = router