const express = require('express');
const router = express.Router();
const singleColectionsController = require('../../controllers/singleCollectionController')


router.route('/:id')
    .get(singleColectionsController.getCollectionPage)

    module.exports = router