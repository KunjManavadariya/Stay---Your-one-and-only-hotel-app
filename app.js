if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const appError = require('./utils/errorClass');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const hotelRoutes = require('./routes/hotelRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');

const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session(sessionConfig));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
    res.locals.activeUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})
app.use('/hotels', hotelRoutes);
app.use('/hotels/:id/reviews', reviewRoutes);
app.use('/', userRoutes);
app.engine('ejs', ejsMate);


mongoose.connect('mongodb://localhost:27017/StayDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected!");
})

app.listen(1812, () => {
    console.log('Listening on port 1812!');
})

app.all('*', (req, res, next) => {
    next(new appError("Page not found!", 404));
})

app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong!!" } = err;
    res.status(status).render('error', { err });
})