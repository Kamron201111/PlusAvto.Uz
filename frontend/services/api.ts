import axios from 'axios';

// Backend URL - Railway da VITE_API_URL environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL + '/api',
  timeout: 30000,
});

// Token avtomatik qo'shiladi
api.interceptors.request.use(config => {
  const token = localStorage.getItem('pa_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      // Token noto'g'ri - logout
      localStorage.removeItem('pa_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (phone: string, password: string) =>
    api.post('/auth/login', { phone, password }).then(r => r.data),
  register: (phone: string, password: string, name: string) =>
    api.post('/auth/register', { phone, password, name }).then(r => r.data),
  resetPassword: (phone: string, newPassword: string) =>
    api.post('/auth/reset-password', { phone, newPassword }).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data.user),
  updateProfile: (data: any) => api.put('/auth/profile', data).then(r => r.data.user),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { oldPassword, newPassword }).then(r => r.data),
};

export const topicsAPI = {
  list: () => api.get('/topics').then(r => r.data),
  create: (name: string) => api.post('/topics', { name }).then(r => r.data),
  update: (id: number, data: any) => api.put(`/topics/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/topics/${id}`).then(r => r.data),
};

export const ticketsAPI = {
  list: () => api.get('/tickets').then(r => r.data),
  create: (data: any) => api.post('/tickets', data).then(r => r.data),
  update: (id: number, data: any) => api.put(`/tickets/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/tickets/${id}`).then(r => r.data),
};

export const interimsAPI = {
  list: () => api.get('/interims').then(r => r.data),
  create: (data: any) => api.post('/interims', data).then(r => r.data),
  update: (id: number, data: any) => api.put(`/interims/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/interims/${id}`).then(r => r.data),
};

export const vazifalarAPI = {
  list: () => api.get('/vazifalar').then(r => r.data),
  create: (data: any) => api.post('/vazifalar', data).then(r => r.data),
  update: (id: number, data: any) => api.put(`/vazifalar/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/vazifalar/${id}`).then(r => r.data),
  getQuestions: (id: number) => api.get(`/vazifalar/${id}/questions`).then(r => r.data),
};

export const questionsAPI = {
  list: (params?: any) => api.get('/questions', { params }).then(r => r.data),
  random: (count: number) => api.get('/questions/random', { params: { count } }).then(r => r.data),
  create: (data: any) => api.post('/questions', data).then(r => r.data),
  bulk: (questions: any[]) => api.post('/questions/bulk', { questions }).then(r => r.data),
  update: (id: number, data: any) => api.put(`/questions/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/questions/${id}`).then(r => r.data),
};

export const mistakesAPI = {
  list: () => api.get('/mistakes').then(r => r.data),
  add: (question_id: number) => api.post('/mistakes', { question_id }).then(r => r.data),
  remove: (question_id: number) => api.delete(`/mistakes/${question_id}`).then(r => r.data),
};

export const favoritesAPI = {
  list: () => api.get('/favorites').then(r => r.data),
  toggle: (question_id: number) => api.post('/favorites/toggle', { question_id }).then(r => r.data),
};

export const coursesAPI = {
  list: () => api.get('/courses').then(r => r.data),
  create: (data: any) => api.post('/courses', data).then(r => r.data),
  update: (id: number, data: any) => api.put(`/courses/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/courses/${id}`).then(r => r.data),
};

export const premiumAPI = {
  status: () => api.get('/premium/status').then(r => r.data),
  request: (data: any) => api.post('/premium/request', data).then(r => r.data),
  requests: () => api.get('/premium/requests').then(r => r.data),
  approve: (id: number) => api.put(`/premium/requests/${id}/approve`).then(r => r.data),
  reject: (id: number) => api.put(`/premium/requests/${id}/reject`).then(r => r.data),
  deleteRequest: (id: number) => api.delete(`/premium/requests/${id}`).then(r => r.data),
  grant: (user_id: number, days: number) => api.post('/premium/grant', { user_id, days }).then(r => r.data),
  revoke: (user_id: number) => api.post('/premium/revoke', { user_id }).then(r => r.data),
};

export const usersAPI = {
  list: () => api.get('/users').then(r => r.data),
  delete: (id: number) => api.delete(`/users/${id}`).then(r => r.data),
};

export const notificationsAPI = {
  list: () => api.get('/notifications').then(r => r.data),
  unreadCount: () => api.get('/notifications/unread-count').then(r => r.data.count),
  markRead: () => api.post('/notifications/mark-read').then(r => r.data),
  create: (title: string, message: string) => api.post('/notifications', { title, message }).then(r => r.data),
  delete: (id: number) => api.delete(`/notifications/${id}`).then(r => r.data),
};

export const settingsAPI = {
  get: () => api.get('/settings').then(r => r.data),
  update: (data: any) => api.put('/settings', data).then(r => r.data),
};

export default api;
