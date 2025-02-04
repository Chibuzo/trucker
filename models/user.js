'use strict';

const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        fullname: DataTypes.STRING(50),
        email: {
            type: DataTypes.STRING(60)
        },
        phone: DataTypes.STRING(16),
        role: {
            type: Sequelize.ENUM('trucker', 'store', 'admin'),
            defaultValue: 'store'
        },
        password: DataTypes.STRING(100),
        status: {
            type: Sequelize.ENUM('pending', 'inactive', 'active', 'blocked'),
            defaultValue: 'inactive'
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: true,
        tableName: 'users',
        indexes: [
            { unique: true, fields: ['email'] }
        ]
    });

    User.associate = function (models) {

    }

    return User;
}