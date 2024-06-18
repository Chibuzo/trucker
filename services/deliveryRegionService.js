const { DeliveryRegion } = require('../models');
const { ErrorHandler } = require('../helpers/errorHandler');


const create = async (deliveryRegionData) => {
    return DeliveryRegion.create(deliveryRegionData);
}

const findOne = async (criteria) => {
    return DeliveryRegion.findOne({ where: { ...criteria, deleted: false } });
}

const view = async criteria => {
    const deliveryRegion = await findOne(criteria);

    if (!deliveryRegion) {
        throw new ErrorHandler(404, 'Region not found');
    }
    return deliveryRegion;
}

const list = async criteria => {
    return DeliveryRegion.findAll({ where: { ...criteria, deleted: false } });
}

const update = async (id, deliveryRegionData) => {
    return DeliveryRegion.update(deliveryRegionData, { where: { id } });
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