import React, { useState } from 'react';
import '../css/BookingForm.css';
import { createBooking } from '../api/bookings';

function BookingForm({ listingId }) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBooking({ listingId, checkIn, checkOut });
      setMessage('Booking successful!');
    } catch (err) {
      console.error(err);
      setMessage('Booking failed.');
    }
  };

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <label>Check-In:</label>
      <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />

      <label>Check-Out:</label>
      <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />

      <button type="submit">Book Now</button>

      {message && <p className="message">{message}</p>}
    </form>
  );
}

export default BookingForm;
