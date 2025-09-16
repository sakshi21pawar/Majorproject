const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const DEFAULT_IMAGE_URL =
  "https://media.istockphoto.com/id/1150545984/photo/upscale-modern-mansion-with-pool.jpg";

const ListingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  image: {
   url :String,
   filename: String,
  },

  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner:{
    type : Schema.Types.ObjectId,
    ref :"User",
  },
});

// ✅ Fix: use ListingSchema instead of listingSchema
ListingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", ListingSchema);
module.exports = Listing;
