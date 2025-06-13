// client/src/api/bookings.js
import axiosClient from './axiosClient';

export const createBooking = (data) => axiosClient.post('/bookings', data);
