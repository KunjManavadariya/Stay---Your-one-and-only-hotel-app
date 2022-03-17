const Hotel = require('../models/hotel');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

function Location(body) {
    body.location = `${body.city}, ${body.state}`;
    const { city, state, ...newObj } = body;
    return newObj;
}

module.exports.index = async(req, res) => {
    const hotels = await Hotel.find({});
    res.render('hotels/index', { hotels });
}

module.exports.renderNewForm = (req, res) => {
    res.render('hotels/new');
}

module.exports.showHotel = async(req, res) => {
    const { id } = req.params;
    const foundHotel = await Hotel.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!foundHotel) {
        req.flash('error', 'Can not find that Hotel!');
        return res.redirect('/hotels');
    }
    res.render('hotels/show', { foundHotel });
}

module.exports.renderUpdateForm = async(req, res) => {
    const { id } = req.params;
    const foundHotel = await Hotel.findById(id);
    if (!foundHotel) {
        req.flash('error', 'Can not find that Hotel!');
        return res.redirect('/hotels');
    }
    if (!foundHotel.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/hotels/${id}`);
    }
    const location = foundHotel.location;
    let city = '',
        state = '',
        c = '';
    for (let i = 0; i < location.length; i++) {
        if (location[i] == ',') {
            for (i = i + 2; i < location.length; i++) {
                c = location[i];
                state += c;
            }
            break;
        }
        c = location[i];
        city += c;
    }
    foundHotel.city = city;
    foundHotel.state = state;
    res.render('hotels/edit', { foundHotel });
}

module.exports.createHotel = async(req, res) => {
    const newObj = Location(req.body);
    const geoData = await geocoder.forwardGeocode({
            query: newObj.location,
            limit: 1
        }).send()
        // ['city', 'state'].forEach(e => delete req.body[e]);
    const newHotel = new Hotel(newObj);
    newHotel.geometry = geoData.body.features[0].geometry;
    newHotel.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    newHotel.author = req.user._id;
    await newHotel.save();
    req.flash('success', 'Successfully added a Hotel!');
    res.redirect(`/hotels/${newHotel._id}`);
}

module.exports.updateHotel = async(req, res, next) => {
    const newObj = Location(req.body);
    const { id } = req.params;
    const updatedHotel = await Hotel.findByIdAndUpdate(id, newObj, { runValidators: true });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    updatedHotel.images.push(...imgs);
    await updatedHotel.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await updatedHotel.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated Hotel!');
    res.redirect(`/hotels/${id}`);
}

module.exports.deleteHotel = async(req, res) => {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);
    if (!hotel.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/hotels/${id}`);
    }
    await Hotel.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Hotel!');
    res.redirect('/hotels');
}