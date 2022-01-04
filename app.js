const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Hotel = require('./models/hotel');
const city = require('./seeds/cities');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/StayDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected!");
})


const seedDB = async() => {
    await Hotel.deleteMany({});
    for (i = 0; i < 50; i++) {
        const randomLocation = Math.floor(Math.random() * 400);
        const hotel = new Hotel({
            location: `${city[randomLocation].city}, ${city[randomLocation].admin_name}`
        })
        await hotel.save();
    }
}
seedDB();

app.get('/', (req, res) => {
    res.render('home');
})

app.listen(1812, () => {
    console.log('Listening on port 1812!');
})