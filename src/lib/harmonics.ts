import api from './api';

export async function getHarmonics() {
  const response = await api.get('/harmonics');
  return response.data;
}
