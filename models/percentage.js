'use strict';

module.exports = (sequelize, DataTypes) => {
    const Percentage = sequelize.define('Percentage', {
        percentage: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        timestamps: true,
        tableName: 'percentage'
    });

    return Percentage;
}