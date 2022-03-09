const Hotel = require('../models/hotel');
const Review = require('../models/review');

module.exports.createReview = async(req, res) => {
    const hotelReviewed = await Hotel.findById(req.params.id);
    const review = new Review(req.body);
    review.author = req.user._id;
    hotelReviewed.reviews.push(review);
    await review.save();
    await hotelReviewed.save();
    req.flash('success', 'Successfully posted your review!');
    res.redirect(`/hotels/${hotelReviewed._id}`);
}

module.exports.deleteReview = async(req, res) => {
    const { id, reviewId } = req.params;
    await Hotel.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted your review!');
    res.redirect(`/hotels/${id}`);
}