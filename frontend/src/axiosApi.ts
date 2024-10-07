import axios from 'axios';
import { API_URL } from './constans';

const axiosApi = axios.create({
  baseURL: API_URL,
});

export default axiosApi;
