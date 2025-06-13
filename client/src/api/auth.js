// client/src/api/auth.js
import axiosClient from './axiosClient';

export const registerUser = (data) => axiosClient.post('/auth/register', data);
export const loginUser = (data) => axiosClient.post('/auth/login', data);
