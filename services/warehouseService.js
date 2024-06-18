const { Warehouse, DeliveryRegion } = require('../models');
const { ErrorHandler } = require('../helpers/errorHandler');
const deliveryRegion = require('../models/deliveryRegion');


const create = async (warehouseData) => {
    return Warehouse.create(warehouseData);
}

const findOne = async (criteria) => {
    return Warehouse.findOne({ where: { ...criteria, deleted: false } });
}

const view = async criteria => {
    const warehouse = await findOne(criteria);

    if (!warehouse) {
        throw new ErrorHandler(404, 'Warehouse not found');
    }
    return warehouse;
}

const list = async criteria => {
    return Warehouse.findAll({
        where: { ...criteria, deleted: false },
        include: [{
            model: DeliveryRegion
        }],
        order: [
            ['createdAt', 'DESC']
        ],
        raw: true, nest: true
    });
}

const update = async (id, warehouseData) => {
    return Warehouse.update(warehouseData, { where: { id } });
}

const deleteOne = async id => {
    return update(id, { deleted: true });
}

module.exports = {
    create,
    view,
    list,
    update,
    deleteOne
}