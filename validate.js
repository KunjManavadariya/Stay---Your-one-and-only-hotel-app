const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const joi = BaseJoi.extend(extension)
const { number } = require('joi');

module.exports.hotelSchema = joi.object({
    name: joi.string().required().escapeHTML(),
    price: joi.number().required().min(0),
    description: joi.string().required().escapeHTML(),
    city: joi.string().required().escapeHTML(),
    state: joi.string().required().escapeHTML(),
    deleteImages: joi.array()
})

module.exports.reviewSchema = joi.object({
    rating: joi.number().required().min(1).max(5),
    body: joi.string().required().escapeHTML()
})