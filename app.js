const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const multer = require("multer");
require("dotenv").config();


const User = require("./models/user");
const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");

const ExpressError = require("./utils/ExpressError");

const dbUrl=process.env.ATLASDB_URL
// DB Connection
main().then(() => {
  console.log("Connected to DB");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

// Multer Setup for File Uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve uploaded files


const store= MongoStore.create({
  mongoUrl:dbUrl,
crypto:{
  secret:process.env.SECRET,
},
touchAfter:24 *3600,
});
store.on("error",()=>{
  console.log("ERROR in Mongo session store", err);
});

// Session
const sessionOptions = {
  store,
  secret:process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};


app.use(session(sessionOptions));
app.use(flash());

// Passport Config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash & Current User Middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// // Routes
// app.get("/", (req, res) => {
//   res.send("Heyy, I am root");
// });

app.use("/listings", listingRouter); // make sure your routes use `upload.single("image")` for POST
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Error Middleware
// Error Middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  console.error("Full error:", err); // ✅ Log full error to console
  res.status(statusCode).render("error.ejs", { message, err }); // pass err object
});




// Start Server
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
