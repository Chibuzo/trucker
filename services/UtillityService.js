
module.exports = {
    formatCurrency: input => {
        return parseInt(input).toLocaleString('en-US', { style: 'decimal' });
    },


    generateUniqueValue: (length = 16, prefix = null) => {
        const pool = 'abcdefghijklmnopqrstuvwxyz1234567890';
        const uniqueValue = chance.string({ length, pool });
        return prefix ? `${prefix}_${uniqueValue}` : uniqueValue;
    },

    formatDate: date => new Date(date).toLocaleDateString('fr-CA'),

    getTime: date => {
        newDate = new Date(date);
        return `${newDate.getHours()}:${newDate.getMinutes()}`;
    }
}
