const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    EmployeeID: Number,
    branches: Object,
    sourceAccs: Object,
    PaymentStatus: Object
});

schema.insert = (data) => {
    return this.create(data);
};

schema.findOne = async(id) => {
    let results = await this.findOne({EmployeeID: id}, (err, doc) => {
        if(err) throw err;
        return doc;
    })
    return results;
}

// schema.
 
module.exports = schema;