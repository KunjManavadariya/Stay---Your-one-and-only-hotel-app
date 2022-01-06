const mongoose = require('mongoose');
const Hotel = require('../models/hotel');
const { description, places } = require('./names');
const city = require('./cities');

mongoose.connect('mongodb://localhost:27017/StayDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected!");
})

const names = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Hotel.deleteMany({});
    for (i = 0; i < 50; i++) {
        const Random = Math.floor(Math.random() * 400);
        const hotel = new Hotel({
            name: `${names(description)} ${names(places)}`,
            location: `${city[Random].city}, ${city[Random].admin_name}`
        })
        await hotel.save();
    }
}
seedDB();