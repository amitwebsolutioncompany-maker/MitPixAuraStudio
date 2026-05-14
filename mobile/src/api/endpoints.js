import {api} from './client';

export const authApi = {
  customerLogin: (payload) => api.post('/auth/customer-login', payload),
  staffLogin: (payload) => api.post('/auth/staff-login', payload),
  adminLogin: (payload) => api.post('/auth/admin-login', payload),
  superAdminLogin: (payload) => api.post('/auth/super-admin-login', payload),
  me: () => api.get('/auth/me'),
  updateProfile: (payload) => api.patch('/auth/me', payload),
};

export const salonApi = {
  list: (params) => api.get('/salons', {params}),
  detail: (id) => api.get(`/salons/${id}`),
  create: (payload) => api.post('/salons', payload),
  update: (id, payload) => api.put(`/salons/${id}`, payload),
  remove: (id) => api.delete(`/salons/${id}`),
};

export const employeeApi = {
  list: (params) => api.get('/employees', {params}),
  create: (payload) => api.post('/employees', payload),
  update: (id, payload) => api.put(`/employees/${id}`, payload),
  remove: (id) => api.delete(`/employees/${id}`),
};

export const slotApi = {
  list: (params) => api.get('/slots', {params}),
  occupied: (id, payload) => api.patch(`/slots/${id}/occupied`, payload),
  break: (id, payload) => api.patch(`/slots/${id}/break`, payload),
  available: (id) => api.patch(`/slots/${id}/available`),
  dayBreak: (payload) => api.patch('/slots/day-break', payload),
  complete: (id, payload) => api.patch(`/slots/${id}/complete`, payload),
};

export const bookingApi = {
  create: (payload) => api.post('/bookings', payload),
  mine: (params) => api.get('/bookings/me', {params}),
  monthlyRewards: () => api.get('/bookings/rewards/monthly'),
  list: (params) => api.get('/bookings', {params}),
  update: (id, payload) => api.put(`/bookings/${id}`, payload),
  remove: (id) => api.delete(`/bookings/${id}`),
};

export const serviceApi = {
  list: (params) => api.get('/services', {params}),
  create: (payload) => api.post('/services', payload),
  update: (id, payload) => api.put(`/services/${id}`, payload),
  remove: (id) => api.delete(`/services/${id}`),
};

export const offerApi = {
  list: (params) => api.get('/offers', {params}),
  create: (payload) => api.post('/offers', payload),
  update: (id, payload) => api.put(`/offers/${id}`, payload),
  remove: (id) => api.delete(`/offers/${id}`),
};

export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard'),
  loyalCustomers: () => api.get('/analytics/loyal-customers'),
  staffStatus: () => api.get('/analytics/staff-status'),
  staffEarnings: () => api.get('/analytics/staff-earnings'),
  closeStaffEarnings: (employeeId) => api.post(`/analytics/staff-earnings/${employeeId}/complete`),
  subscription: () => api.get('/analytics/subscription'),
};

export const superAdminApi = {
  dashboard: () => api.get('/super-admin/dashboard'),
  admins: () => api.get('/super-admin/admins'),
  createAdmin: (payload) => api.post('/super-admin/admins', payload),
  updateAdmin: (id, payload) => api.put(`/super-admin/admins/${id}`, payload),
  removeAdmin: (id) => api.delete(`/super-admin/admins/${id}`),
  adminData: (id) => api.get(`/super-admin/admins/${id}/data`),
  subscriptions: () => api.get('/super-admin/subscriptions'),
  updateSubscriptions: (payload) => api.put('/super-admin/subscriptions', payload),
  updateSubscription: (plan, payload) => api.put(`/super-admin/subscriptions/${plan}`, payload),
  removeSubscription: (plan) => api.delete(`/super-admin/subscriptions/${plan}`),
  loyalCustomers: () => api.get('/super-admin/global-loyal-customers'),
};

export const contentApi = {
  get: (key) => api.get(`/content/${key}`),
  update: (key, payload) => api.put(`/content/${key}`, payload),
};

export const functionApi = {
  list: () => api.get('/functions'),
  create: (payload) => api.post('/functions', payload),
};

export const productApi = {
  list: () => api.get('/products'),
  createOrder: (payload) => api.post('/products/orders', payload),
};

export const academyApi = {
  list: () => api.get('/academy/courses'),
  enroll: (payload) => api.post('/academy/enrollments', payload),
};
