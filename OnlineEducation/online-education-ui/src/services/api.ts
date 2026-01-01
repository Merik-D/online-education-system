import axios, { AxiosError, AxiosInstance } from 'axios';
const API_URL = 'https://localhost:7256/api';
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: 0,
        data: null,
      });
    }
    const { status, data } = error.response;
    switch (status) {
      case 400:
        console.error('Validation error:', data);
        break;
      case 401:
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        break;
      case 403:
        console.error('Access forbidden:', data);
        break;
      case 404:
        console.error('Resource not found:', data);
        break;
      case 500:
        console.error('Server error:', data);
        break;
      default:
        console.error('Error:', data);
    }
    return Promise.reject({
      message: (data as any)?.message || 'An error occurred',
      status,
      data,
    });
  }
);
export default api;