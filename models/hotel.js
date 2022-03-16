const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;
const Model = mongoose.model;

const imageSchema = new Schema({
    url: String,
    filename: String
});

imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } }

const hotelSchema = new Schema({
    name: String,
    images: [imageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
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
}, opts)

hotelSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="hotels/${this._id}">${this.name}</a><strong>
    <p>${this.description.substring(0,20)}...</p>`
});

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