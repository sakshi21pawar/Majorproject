const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../CloudConfig.js");
const upload = multer({ storage });

const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const ListingController = require("../controllers/listing.js");

// All listings: GET /listings, POST /listings
router
  .route("/")
  .get(wrapAsync(ListingController.index))
  .post(
    isLoggedIn,
    upload.single("image"), // ✅ use "image" to match your form input
    validateListing,
    wrapAsync(ListingController.createListing)
  );

// New listing form: GET /listings/new
router.get("/new", isLoggedIn, ListingController.renderNewForm);

// Single listing routes: GET, PUT, DELETE
router
  .route("/:id")
  .get(wrapAsync(ListingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("image"), // ✅ handle new image uploads
    validateListing,
    wrapAsync(ListingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(ListingController.destroyListing));

// Edit listing form: GET /listings/:id/edit
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(ListingController.renderEditForm));

module.exports = router;
