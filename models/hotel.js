const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;
const Model = mongoose.model;

const hotelSchema = new Schema({
    name: String,
    images: [{
        url: String,
        filename: String
    }],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
})

hotelSchema.post('findOneAndDelete', async(hotel) => {
    if (hotel) {
        await Review.deleteMany({
            _id: {
                $in: hotel.reviews
            }
        })
    }
})

module.exports = Model('Hotel', hotelSchema);