const { User } = require('../models');
const emailService = require('../services/emailService');
const bcrypt = require('bcryptjs');
const { Buffer } = require('buffer');
const crypto = require('crypto');
const path = require('path');
const saltRounds = 10;
const { ErrorHandler } = require('../helpers/errorHandler');


const create = async ({ fullname, email, phone = '', password, ...rest }) => {
    if (!fullname) throw new ErrorHandler(400, 'Name is required');
    // if (!phone) throw new ErrorHandler(400, 'Phone number is required');
    if (!email) throw new ErrorHandler(400, 'Email is required');
    if (!password) throw new ErrorHandler(400, 'Password is required');

    const existingEmail = await User.findOne({ where: { email } });

    if (existingEmail) throw new ErrorHandler(400, `A user already exist with this email`);

    const passwordHash = await bcrypt.hash(password, saltRounds);
    const data = {
        fullname,
        email,
        phone,
        password: passwordHash,
        ...rest
    };
    const newUser = await User.create(data);
    emailService.sendConfirmationEmail(newUser);
    delete newUser.password;
    return newUser;
}


const login = async ({ email, password }) => {
    const user = await User.findOne({
        where: { email }
    });
    if (!user) throw new ErrorHandler(404, 'Email or password is incorrect');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new ErrorHandler(400, 'Email and password doesn\'t match');

    if (user.status === 'inactive') {
        throw new ErrorHandler(400, 'User inactive')
    }

    if (user.status === 'blocked') {
        throw new ErrorHandler(400, 'You\'ve been denied access from using this system');
    }
    return sanitize(user);
}

const findOne = async criteria => {
    return User.findOne({ where: criteria });
}

const view = async criteria => {
    const user = await findOne(criteria);
    if (!user) throw new ErrorHandler(404, 'User not found');
    return sanitize(user);
}

const activateAccount = async (email_hash, hash_string) => {
    if (!email_hash || !hash_string) {
        throw new ErrorHandler(400, 'Email or hash not found');
    }
    const email = Buffer.from(email_hash, 'base64').toString('ascii');
    const user = await view({ email });

    const hash = crypto.createHash('md5').update(user.email + 'okirikwenEE129Okpkenakai').digest('hex');
    if (hash_string !== hash) {
        throw new ErrorHandler(400, 'Invalid hash. couldn\'t verify your email');
    }
    await User.update({ status: 'active' }, { where: { email } });
    return { ...user, status: 'active' };
}

const verifyPasswordResetLink = async (email_hash, hash_string) => {
    if (!email_hash || !hash_string) {
        throw new ErrorHandler(400, 'Email or hash not found');
    }
    const email = Buffer.from(email_hash, 'base64').toString('ascii');
    const user = await User.findOne({ where: { email } }, { raw: true });
    if (!user) throw new ErrorHandler(400, 'User not found');

    const hash = crypto.createHash('md5').update(user.email + 'okirikwenEE129Okpkenakai').digest('hex');
    if (hash_string !== hash) {
        throw new ErrorHandler(400, 'Invalid hash. couldn\'t verify your email');
    }
    return { id: user.id, status: true };
}

const changePassword = async (newPassword, user_id) => {
    if (!newPassword) throw new ErrorHandler(400, 'Password can not be empty');
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    return User.update({ password: passwordHash }, { where: { id: user_id } });
}

const list = async (criteria = {}) => {
    const users = await User.findAll({
        where: { ...criteria, deleted: false },
        order: [
            ['createdAt', 'DESC']
        ]
    });
    return users.map(user => sanitize(user));
}

const updateUser = async (userData, id) => {
    return User.update({ ...userData }, { where: { id } });
}


const removeUser = async user_id => {
    return updateUser({ deleted: true }, user_id);
}


const sanitize = user => {
    delete user.password;
    return {
        ...user.toJSON()
    };
}

const createAdmin = async () => {
    const password = await bcrypt.hash('untold', saltRounds);
    const admin = {
        fullname: 'Osman Admin',
        email: 'admin@admin.com',
        role: 'admin',
        password,
        status: 'active'
    }
    return User.create(admin);
}

module.exports = {
    create,
    login,
    activateAccount,
    list,
    view,
    updateUser,
    verifyPasswordResetLink,
    changePassword,
    removeUser,
    createAdmin
}