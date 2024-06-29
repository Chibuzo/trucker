const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const authenticateAdmin = require('../middlewares/authenticateAdmin');
const userService = require('../services/userService');
const emailService = require('../services/emailService');
const { ErrorHandler, handleError } = require('../helpers/errorHandler');
const deliveryService = require('../services/deliveryService');
const regionService = require('../services/deliveryRegionService');
const warehouseService = require('../services/warehouseService');
const logger = require('../services/logService');
const { Percentage } = require('../models');

router.get('/', async (req, res, next) => {
    try {
        res.render('login', { title: 'Login' });
    } catch (err) {
        next(err);
    }
});


router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

router.get('/register', (req, res) => {
    res.render('signup', { title: 'Register' });
});

router.post('/register', async (req, res, next) => {
    try {
        const customer = await userService.create(req.body);
        res.render('confirmation');
    } catch (err) {
        next(err);
    }
});

router.post('/trucker/create', async (req, res, next) => {
    try {
        const customer = await userService.create({ ...req.body, role: 'trucker' });
        res.redirect('/truckers');
    } catch (err) {
        next(err);
    }
});


router.post('/login', async (req, res, next) => {
    try {
        const user = await userService.login(req.body);
        req.session.user = user;
        return res.json({ status: 'success', role: user.role });
    } catch (err) {
        res.json({ status: 'failed', message: err.message });
    }
});

router.get('/request-delivery', authenticate, async (req, res, next) => {
    try {
        const warehouses = await warehouseService.list();
        res.render('delivery-request', { title: 'Request Delivery', warehouses });
    } catch (err) {
        next(err);
    }
});


router.post('/request-delivery', authenticate, async (req, res, next) => {
    try {
        const { id: storeId } = req.session.user;
        await deliveryService.create({ ...req.body, storeId });
        res.redirect('delivery-orders');
    } catch (err) {
        next(err);
    }
});

router.get('/delivery-orders', authenticate, async (req, res, next) => {
    try {
        const { id, role } = req.session.user
        const { status } = req.query;
        // const criteria = role == 'store' ? { storeId: id } : { [Op.or]: [{ status: 'pending' }, { status: 'in progress' }] };
        const userCriteria = {
            store: { storeId: id },
            trucker: { status: 'pending' },
            admin: {}
        }
        if (status) userCriteria[role].status = status;
        const orders = await deliveryService.list(userCriteria[role]);
        res.render('delivery-orders', { title: 'Delivery Requests', orders, page: 'orders' });
    } catch (err) {
        next(err);
    }
});

router.get('/my-trips', authenticate, async (req, res, next) => {
    try {
        const { id: truckerId } = req.session.user
        const orders = await deliveryService.list({ truckerId });
        res.render('delivery-orders', { title: 'My Deliveries', orders, page: 'trips' });
    } catch (err) {
        next(err);
    }
});

router.post('/update-order', authenticate, async (req, res, next) => {
    try {
        const { action, order_id } = req.body;
        const order = await deliveryService.update(order_id, { status: action, truckerId });
        res.json({ status: 'success' });
    } catch (err) {
        res.json({ status: 'error', message: err.message });
    }
});

router.get('/settings', authenticateAdmin, async (req, res, next) => {
    try {
        const [regions, warehouses, percentage] = await Promise.all([
            regionService.list(),
            warehouseService.list(),
            Percentage.findOne({})
        ]);
        const incentive = percentage ? percentage.percentage : 0;
        res.render('setting', { title: 'App Settings', regions, warehouses, percentage: incentive });
    } catch (err) {
        next(err);
    }
});


router.post('/save-warehouse', authenticateAdmin, async (req, res, next) => {
    try {
        await warehouseService.create(req.body);
        res.redirect('/settings');
    } catch (err) {
        next(err);
    }
});

router.post('/save-region', authenticateAdmin, async (req, res, next) => {
    try {
        await regionService.create(req.body);
        res.redirect('/settings');
    } catch (err) {
        next(err);
    }
});

router.get('/reports', authenticateAdmin, async (req, res, next) => {
    try {
        const orders = await deliveryService.list({ status: 'complete'});
        res.render('earnings', { title: 'Earning Report', orders });
    } catch (err) {
        next(err);
    }
});

router.get('/truckers', authenticateAdmin, async (req, res, next) => {
    try {
        const truckers = await userService.list({ role: 'trucker' });
        res.render('truckers', { title: 'Manage Truckers', truckers });
    } catch (err) {
        next(err);
    }
});

router.post('/update-user', authenticateAdmin, async (req, res) => {
    try {
        const { action, user_id } = req.body;
        if (action == 'delete') {
            await userService.removeUser(user_id);
        } else {
            await userService.updateUser({ status: action }, user_id);
        }
        res.json({ status: true });
    } catch (err) {
        res.json({ status: false });
    }
});

router.post('/delete-region', authenticateAdmin, async (req, res) => {
    try {
        const { regionId } = req.body;
        await regionService.deleteOne(regionId);
        
    } catch(err) {
        res.json({ status: 'error', message: err.message });
    }
});


router.get('/logout', (req, res, next) => {
    req.session.destroy();
    res.redirect('/login');
});

router.get('/activate/:email_hash/:hash_string', async (req, res, next) => {
    try {
        const email_hash = req.params.email_hash;
        const hash_string = req.params.hash_string;
        await userService.activateAccount(email_hash, hash_string);
        res.render('login', { title: 'Login', message: 'Your email has been verified. You may now login' });
    } catch (err) {
        logger.error('Email verification failed', { data: err });
        next(err);
    }
});

// router.get('/activate-account', (req, res) => {
//     let user_status = 'active';
//     if (req.query.q && req.query.q === 'inactive') {
//         user_status = 'inactive';
//     }
//     res.render('user/activate-account', { user_status });
// });

router.get('/resend-verification-email', async (req, res) => {
    const email = req.session.temp_email || '';
    const [user] = await userService.find({ where: { email } });
    emailService.sendConfirmationEmail(user);
    res.end();
});

router.get('/reset-password', async (req, res, next) => {
    res.render('reset-password', { title: 'Reset Password' });
});

router.post('/send-reset-email', async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await userService.view(email);
        let message = 'A password reset link has been sent to your email';
        emailService.sendPasswordResetLink(email);
        if (!user) message = 'There is no account associated with this email';
        res.render('reset-password', { title: 'Reset Password', message });
    } catch (err) {
        next(err);
    }
});

router.get('/password-reset/:email_hash/:hash_string', async (req, res, next) => {
    try {
        const email_hash = req.params.email_hash;
        const hash_string = req.params.hash_string;
        const { id, user_type, status } = await userService.verifyPasswordResetLink(email_hash, hash_string);
        req.session.reset_password_id = id;
        req.session.user_type = user_type;
        res.render('password-reset-form', { title: 'Set new password', status });
    } catch (err) {
        logger.error('Could not authorize password verification', { data: err });
        next(err);
    }
});

router.post('/reset-password', async (req, res, next) => {
    try {
        if (!req.session.reset_password_id) throw new ErrorHandler(400, 'Invalid operation');
        const { password } = req.body;
        const { reset_password_id, user_type } = req.session;
        await userService.changePassword(password, reset_password_id, user_type);
        delete req.session.reset_password_id;
        delete req.session.user_type;
        res.render('login', { title: 'Login', message: 'Your password reset was successful.' });
    } catch (err) {
        logger.error('Couldn\'t reset password', { data: err });
        next(err);
    }
});

router.post('/update-incentive', authenticateAdmin, async (req, res, next) => {
    try {
        const { percentage } = req.body;
        if (isNaN(percentage)) {
            throw new handleError(400, 'Percentage must be a number');  
        }
        const percent = await Percentage.findOne({});
        if (percent) {
            await Percentage.update({ percentage }, { where: {} });
        } else {
            await Percentage.create({ percentage });
        }
        res.redirect('/reports');
    } catch (err) {
        next(err);
    }
});

router.get('/setup', async (req, res, next) => {
    try {
        await userService.createAdmin();
        res.end('Done');
    } catch (err) {
        next(err);
    }
});


module.exports = router;
