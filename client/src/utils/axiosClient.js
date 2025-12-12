import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.BACKEND_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;