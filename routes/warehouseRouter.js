const express = require('express');
const router = express.Router();
const logger = require('../services/logService');
const authenticate = require('../middlewares/authenticate');
const warehouseService = require('../services/warehouseService');


router.post('/', authenticate, async (req, res, next) => {
    try {
        await warehouseService.create(req.body);
        res.redirectt('/admin/warehouses');
    } catch (err) {
        logger.error('Adding new Warehouse failed', { data: err });
        next(err);
    }
});

router.get('/', authenticate, async (req, res, next) => {
    try {
        const warehouses = await warehouseService.list();
        res.render('admin/warehouses', { warehouses });
    } catch (err) {
        logger.error('Fetching Warehouse failed', { data: err });
        next(err);
    }
});

router.put('/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        await warehouseService.update(id, req.body);
        res.redirectt('/admin/warehouses');
    } catch (err) {
        logger.error('Updating Warehouse failed', { data: err });
        next(err);
    }
});

router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        await warehouseService.deleteOne(id);
        res.json({ status: 'success' });
    } catch (err) {
        res.json({ status: 'error', message: err.message });
    }
});

module.exports = router;