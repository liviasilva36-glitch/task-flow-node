import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // Porta em que a taskflow-api está rodando
});

export default api;