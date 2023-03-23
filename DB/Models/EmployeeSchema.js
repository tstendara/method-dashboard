const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    EmployeeID: Number,
    Employee: Array,
    Payor: Array, 
    Payee: Array,
    Amount: Array 
});

schema.insertMany = function (data) {
    return this.create(data);
};
 
module.exports = schema
// module.exports = model('Employee', schema);