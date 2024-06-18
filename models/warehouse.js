'use strict';

module.exports = (sequelize, DataTypes) => {
    const Warehouse = sequelize.define('Warehouse', {
        name: {
            type: DataTypes.STRING(120),
            allowNull: false,
        },
        phone: DataTypes.STRING(16),
        address: DataTypes.STRING,
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: true,
        tableName: 'warehouses'
    });

    Warehouse.associate = function (models) {
        Warehouse.hasMany(models.Delivery, { foreignKey: 'warehouseId' });
        Warehouse.belongsTo(models.DeliveryRegion, { foreignKey: 'regionId' });
    }

    return Warehouse;
}