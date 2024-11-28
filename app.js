if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const helmet = require("helmet");
const mongoose = require("mongoose");
const appError = require("./utils/errorClass");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const hotelRoutes = require("./routes/hotelRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const userRoutes = require("./routes/userRoutes");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const winston = require("winston");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/StayDB";
const secret = process.env.SECRET || "thisshouldbeabettersecret";

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database Connected!");
});

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

const MongoStore = require("connect-mongo");

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
});

store.on("error", (e) => {
  console.log("Session store error", e);
});

const isProduction = process.env.NODE_ENV === "production";

const sessionConfig = {
  store,
  name: "Session",
  secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

if (isProduction) {
  app.set("trust proxy", 1);
  app.use((req, res, next) => {
    if (!req.secure) {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(session(sessionConfig));
app.use(flash());
app.use(express.static(path.join(__dirname, "public")));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
  console.log("User", req.user);
  res.locals.activeUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});
app.use("/hotels", hotelRoutes);
app.use("/hotels/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

app.engine("ejs", ejsMate);
app.use(mongoSanitize());

app.get("/", (req, res) => {
  res.render("home");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

app.all("*", (req, res, next) => {
  next(new appError("Page not found!", 404));
});

const logger = winston.createLogger({
  level: "error",
  transports: [
    new winston.transports.File({ filename: "error.log" }),
    new winston.transports.Console(),
  ],
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong!!" } = err;
  logger.error(err.stack);
  res.status(status).render("error", { err });
});
