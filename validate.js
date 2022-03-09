const joi = require("joi");
module.exports.hotelSchema = joi.object({
    name: joi.string().required(),
    price: joi.number().required().min(0),
    description: joi.string().required(),
    city: joi.string().required(),
    state: joi.string().required()
})

module.exports.reviewSchema = joi.object({
    rating: joi.number().required().min(1).max(5),
    body: joi.string().required()
})