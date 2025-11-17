// Conteúdo de: src/lib/api.ts

import axios from 'axios';

const api = axios.create({
  // URL base do seu servidor Go, sem /api
  baseURL: 'http://localhost:8080',
});

export default api;