const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Hotel = require('./models/hotel');
const methodOverride = require('method-override');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

mongoose.connect('mongodb://localhost:27017/StayDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected!");
})

app.listen(1812, () => {
    console.log('Listening on port 1812!');
})

function Location(body) {
    body.location = `${body.city}, ${body.state}`;
    const { city, state, ...newObj } = body;
    return newObj;
}

app.get('/hotels', async(req, res) => {
    const hotels = await Hotel.find({});
    res.render('home', { hotels });
})

app.get('/hotels/new', (req, res) => {
    res.render('new');
})

app.get('/hotels/:id', async(req, res) => {
    const { id } = req.params;
    const foundHotel = await Hotel.findById(id);
    res.render('show', { foundHotel });
})

app.get('/hotels/:id/edit', async(req, res) => {
    const { id } = req.params;
    const foundHotel = await Hotel.findById(id);
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
    res.render('edit', { foundHotel });
})

app.post('/hotels', async(req, res) => {
    const newObj = Location(req.body);
    // ['city', 'state'].forEach(e => delete req.body[e]);
    const newHotel = new Hotel(newObj);
    await newHotel.save();
    res.redirect(`/hotels/${newHotel._id}`);
})

app.patch('/hotels/:id', async(req, res) => {
    const newObj = Location(req.body);
    const { id } = req.params;
    await Hotel.findByIdAndUpdate(id, newObj, { runValidators: true });
    res.redirect(`/hotels/${id}`);
})

app.delete('/hotels/:id', async(req, res) => {
    const { id } = req.params;
    await Hotel.findByIdAndDelete(id);
    res.redirect('/hotels');
})