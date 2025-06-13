const router = require("express").Router();
const Listing = require("../models/Listing");
const { auth, role } = require("../middleware/auth");
const multer = require("multer");
const { storage } = require("../utils/cloudinary");
const cloudinary = require("cloudinary").v2;

const upload = multer({ storage });

// Utility to extract Cloudinary public_id from image URL
function extractPublicId(url) {
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  return filename.split(".")[0]; // remove extension
}

// GET /api/listings
// All listings (with optional filters)
router.get("/", async (req, res) => {
  try {
    const { location, min, max } = req.query;
    const filter = {};

    if (location) filter.location = { $regex: location, $options: "i" };
    if (min || max) filter.price = {};
    if (min) filter.price.$gte = Number(min);
    if (max) filter.price.$lte = Number(max);

    const listings = await Listing.find(filter).populate("host", "name");
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

// GET /api/listings/:id
// Listing by ID
router.get("/:id", async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("host", "name");
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  res.json(listing);
});

// POST /api/listings
// Create listing (host only, with image upload)
router.post("/", auth, role("host"), upload.array("images", 5), async (req, res) => {
  try {
    const imageUrls = req.files.map(file => file.path);
    const newListing = await Listing.create({
      ...req.body,
      images: imageUrls,
      host: req.user._id
    });
    res.status(201).json(newListing);
  } catch (err) {
    res.status(400).json({ error: "Failed to create listing" });
  }
});

// GET /api/listings/host/my-listings
// Get all listings by the current host
router.get("/host/my-listings", auth, role("host"), async (req, res) => {
  try {
    const listings = await Listing.find({ host: req.user._id });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch host listings" });
  }
});

// PUT /api/listings/:id
// Update listing (host only)
router.put("/:id", auth, role("host"), upload.array("images", 5), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Append new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      listing.images.push(...newImages);
    }

    // Update other fields
    Object.assign(listing, req.body);

    await listing.save();
    res.json(listing);
  } catch {
    res.status(400).json({ error: "Failed to update listing" });
  }
});

// DELETE /api/listings/:id
// Delete listing (host only, with Cloudinary image cleanup)
router.delete("/:id", auth, role("host"), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Delete each image from Cloudinary
    for (const url of listing.images) {
      const publicId = extractPublicId(url);
      await cloudinary.uploader.destroy(publicId);
    }

    await listing.deleteOne();
    res.json({ message: "Listing deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete listing" });
  }
});

module.exports = router;
