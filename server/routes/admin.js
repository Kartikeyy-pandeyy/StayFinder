const router = require("express").Router();
const { auth, role } = require("../middleware/auth");
const User = require("../models/user");
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");
const cloudinary = require("cloudinary").v2;

// Utility to extract public_id from Cloudinary image URL
function extractPublicId(url) {
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  return filename.split(".")[0];
}

// GET /api/admin/users - Get all users (without passwords)
router.get("/users", auth, role("admin"), async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// GET /api/admin/listings - Get all listings
router.get("/listings", auth, role("admin"), async (req, res) => {
  const listings = await Listing.find().populate("host", "name email");
  res.json(listings);
});

// GET /api/admin/bookings - Get all bookings
router.get("/bookings", auth, role("admin"), async (req, res) => {
  const bookings = await Booking.find()
    .populate("user", "name email")
    .populate("listing", "title location");
  res.json(bookings);
});

// DELETE /api/admin/users/:id - Delete a user
router.delete("/users/:id", auth, role("admin"), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

// DELETE /api/admin/listings/:id - Delete listing and images
router.delete("/listings/:id", auth, role("admin"), async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ error: "Listing not found" });

  // Delete images from Cloudinary
  for (const url of listing.images) {
    const publicId = extractPublicId(url);
    await cloudinary.uploader.destroy(publicId);
  }

  await listing.deleteOne();
  res.json({ message: "Listing deleted by admin" });
});

// PUT /api/admin/users/:id/promote - Promote a user to host
router.put("/users/:id/promote", auth, role("admin"), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.role = "host";
  await user.save();
  res.json({ message: "User promoted to host", user });
});

module.exports = router;
