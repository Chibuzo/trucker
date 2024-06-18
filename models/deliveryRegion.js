'use strict';

module.exports = (sequelize, DataTypes) => {
    const DeliveryRegion = sequelize.define('DeliveryRegion', {
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: true,
        tableName: 'deliveryRegions'
    });

    DeliveryRegion.associate = function (models) {
        DeliveryRegion.hasMany(models.Warehouse, { foreignKey: 'regionId' });
    }

    return DeliveryRegion;
}