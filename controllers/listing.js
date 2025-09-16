const Listing = require("../models/listing");

const DEFAULT_IMAGE_URL =
  "https://media.istockphoto.com/id/1150545984/photo/upscale-modern-mansion-with-pool.jpg";

module.exports.index = async (req, res, next) => {
  try {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  } catch (err) {
    next(err);
  }
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: { path: "author" },
      })
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing you requested does not exist!");
      return res.redirect("/listings");
    }
    res.render("listings/show", { listing });
  } catch (err) {
    next(err);
  }
};

module.exports.createListing = async (req, res, next) => {
  try {
    // Ensure an image is uploaded
    if (!req.file) {
      throw new Error("Image upload is required");
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };

    await newListing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings");
  } catch (err) {
    console.error("Error creating listing:", err);
    next(err); // pass to Express error handler
  }
};

module.exports.renderEditForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }
    let originalImageurl=listing.image.url;
    originalImageurl=originalImageurl.replace("/upload","/upload/h_300,w_250")
    res.render("listings/edit.ejs", { listing ,originalImageurl});
  } catch (err) {
    next(err);
  }
};

module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

    // If a new image is uploaded, update it
    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    await listing.save();
    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error("Error updating listing:", err);
    next(err);
  }
};

module.exports.destroyListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
  } catch (err) {
    console.error("Error deleting listing:", err);
    next(err);
  }
};
