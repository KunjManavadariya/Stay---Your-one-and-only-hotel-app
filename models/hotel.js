const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Model = mongoose.model;

const hotelSchema = new Schema({
    name: String,
    price: String,
    description: String,
    location: String
})

module.exports = mongoose.model('Hotel', hotelSchema);