import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// ── Applications ──────────────────────────────────────────────

export const getApplications = (params = {}) =>
  api.get('/applications', { params }).then(r => r.data)

export const getApplication = (id) =>
  api.get(`/applications/${id}`).then(r => r.data)

export const createApplication = (data) =>
  api.post('/applications', data).then(r => r.data)

export const updateApplication = (id, data) =>
  api.patch(`/applications/${id}`, data).then(r => r.data)

export const updateStatus = (id, data) =>
  api.patch(`/applications/${id}/status`, data).then(r => r.data)

export const deleteApplication = (id) =>
  api.delete(`/applications/${id}`).then(r => r.data)

export const getStats = () =>
  api.get('/applications/stats').then(r => r.data)

export default api
