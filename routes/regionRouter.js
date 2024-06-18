const express = require('express');
const router = express.Router();
const logger = require('../services/logService');
const authenticate = require('../middlewares/authenticate');
const regionService = require('../services/deliveryRegionService');


router.post('/', authenticate, async (req, res, next) => {
    try {
        await regionService.create(req.body);
        res.redirectt('/admin/regions');
    } catch (err) {
        logger.error('Adding new Region failed', { data: err });
        next(err);
    }
});

router.get('/', authenticate, async (req, res, next) => {
    try {
        const regions = await regionService.list();
        res.render('admin/regions', { regions });
    } catch (err) {
        logger.error('Fetching Regions failed', { data: err });
        next(err);
    }
});

router.put('/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        await regionService.update(id, req.body);
        res.redirectt('/admin/regions');
    } catch (err) {
        logger.error('Updating Region failed', { data: err });
        next(err);
    }
});

router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        await regionService.deleteOne(id);
        res.redirectt('/admin/regions');
    } catch (err) {
        logger.error('Deleting Region failed', { data: err });
        next(err);
    }
});

module.exports = router;