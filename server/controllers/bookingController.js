const Booking = require("../models/Booking");

exports.createBooking = async (req, res) => {
  const { listingId, checkIn, checkOut } = req.body;

  try {
    const newBooking = new Booking({
      listingId,
      userId: req.user.id,
      checkIn,
      checkOut
    });

    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(500).json({ message: "Failed to create booking" });
  }
};
