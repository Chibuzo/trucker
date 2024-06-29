const { Delivery, User, Warehouse, DeliveryRegion, Percentage } = require('../models');
const { ErrorHandler, handleError } = require('../helpers/errorHandler');
const warehouseService = require('./warehouseService');


const create = async (deliveryData) => {
    const order = await findOne({ orderNo: deliveryData.orderNo });
    if (order) {
        throw new ErrorHandler(400, 'A delivery order already exist with same order number');
    }
    const [{ regionId: deliveryRegionId }, { percentage }] = await Promise.all([
        warehouseService.view({ id: deliveryData.warehouseId }),
        Percentage.findOne({})
    ]);
    return Delivery.create({ ...deliveryData, deliveryRegionId, percentage });
}

const findOne = async (criteria) => {
    return Delivery.findOne({ where: { ...criteria } });
}

const view = async criteria => {
    const delivery = await findOne(criteria);
    if (!delivery) {
        throw new ErrorHandler(404, 'Delivery order not found');
    }
    return delivery;
}

const list = async criteria => {
    return Delivery.findAll({
        where: { ...criteria },
        include: [
            {
                model: User,
                as: 'trucker'
            },
            {
                model: User,
                as: 'store'
            },
            {
                model: Warehouse,
                include: DeliveryRegion
            }
        ],
        order: [
            ['createdAt', 'DESC']
        ],
        raw: true,
        nest: true
    });
}

const update = async (id, deliveryData) => {
    const order = await Delivery.findOne({ where: { id } });
    if (!order) throw new ErrorHandler(400, 'Invalid delivery');

    // if (order.truckerId && order.truckerId != truckerId) {
    //     throw new ErrorHandler(400, 'You are not allowed to change the status of the delivery.');
    // }
    return Delivery.update(deliveryData, { where: { id } });
}

module.exports = {
    create,
    view,
    list,
    update
}