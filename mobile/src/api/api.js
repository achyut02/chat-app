import axios from 'axios';
const API = axios.create({ baseURL: 'http://192.168.0.110:4000' }); // replaced 10.0.2.2 with LAN IP

export const setToken = token => {
  if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete API.defaults.headers.common['Authorization'];
};

export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getUsers = () => API.get('/users');
export const getMessages = (convId) => API.get(`/conversations/${convId}/messages`);
