const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  price: Number,
  images: [String],
  host: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Listing", ListingSchema);
