// client/src/api/listings.js
import axiosClient from './axiosClient';

export const getAllListings = () => axiosClient.get('/listings');
export const getListingById = (id) => axiosClient.get(`/listings/${id}`);
export const createListing = (data) => axiosClient.post('/listings', data);
export const updateListing = (id, data) => axiosClient.put(`/listings/${id}`, data);
export const deleteListing = (id) => axiosClient.delete(`/listings/${id}`);
