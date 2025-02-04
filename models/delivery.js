'use strict';

const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Delivery = sequelize.define('Delivery', {
        orderSize: {
            type: DataTypes.STRING,
        },
        orderNo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        cost: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        deliveryRegionId: DataTypes.INTEGER,
        paid: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        percentage: DataTypes.INTEGER,
        status: {
            type: Sequelize.ENUM('pending', 'complete', 'cancelled', 'picked up', 'delivered'),
            defaultValue: 'pending'
        }
    }, {
        timestamps: true,
        tableName: 'deliveries',
        indexes: [
            {
                unique: true, fields: ['orderNo']
            }
        ]
    });

    Delivery.associate = function (models) {
        Delivery.belongsTo(models.User, { foreignKey: 'storeId', as: 'store' });
        Delivery.belongsTo(models.User, { foreignKey: 'truckerId', as: 'trucker' });
        Delivery.belongsTo(models.Warehouse, { foreignKey: 'warehouseId' });
    }

    return Delivery;
}