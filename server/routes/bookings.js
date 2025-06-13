const router = require("express").Router();
const Booking = require("../models/Booking");
const { auth, role } = require("../middleware/auth");

router.post("/", auth, role("user"), async (req, res) => {
  const { listing, startDate, endDate } = req.body;

  if (!listing || !startDate || !endDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({ error: "Invalid date range" });
  }

  // Check for overlapping bookings
  const conflict = await Booking.findOne({
    listing,
    $or: [
      {
        startDate: { $lte: endDate },
        endDate: { $gte: startDate }
      }
    ]
  });

  if (conflict) {
    return res.status(409).json({ error: "Listing already booked for these dates" });
  }

  // If no conflict, create booking
  const newBooking = await Booking.create({
    listing,
    user: req.user._id,
    startDate,
    endDate
  });

  res.status(201).json(newBooking);
});
// Get current user's bookings
router.get("/me", auth, role("user"), async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("listing", "title location price images")
      .sort({ startDate: -1 }); // most recent first
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});
module.exports = router;
