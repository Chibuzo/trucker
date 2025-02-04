'use strict';

module.exports = (sequelize, DataTypes) => {
    const Percentage = sequelize.define('Percentage', {
        percentage: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: true,
        tableName: 'percentage'
    });

    return Percentage;
}