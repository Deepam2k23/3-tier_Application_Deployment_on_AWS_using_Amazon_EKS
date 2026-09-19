import axios from 'axios';

// In production this is served through the same domain (CloudFront -> ALB -> backend service),
// so calls go to a relative /api path. For local dev, override with REACT_APP_API_URL.
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/students';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const getAllStudents = () => api.get('');
export const getStudentById = (id) => api.get(`/${id}`);
export const createStudent = (student) => api.post('', student);
export const updateStudent = (id, student) => api.put(`/${id}`, student);
export const deleteStudent = (id) => api.delete(`/${id}`);
export const searchStudents = (keyword) => api.get(`/search`, { params: { keyword } });

export default api;
