import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

let storeRef = null;
export function setApiStore(store) {
  storeRef = store;
}

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    
    // Only super_admin can optionally send X-School-ID header (when managing a specific school)
    // Regular users have schoolId embedded in JWT already
    if (storeRef && storeRef.getState) {
      const state = storeRef.getState();
      const role = state?.auth?.user?.role;
      const schoolId = state?.auth?.user?.school_id || state?.auth?.schoolId;
      
      // Only add X-School-ID header for super_admin if they're viewing a specific school
      if (role === 'super_admin' && schoolId) {
        config.headers['X-School-ID'] = schoolId;
      }
    }
  } catch (e) {
    // localStorage may be unavailable (private browsing)
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const orig = err.config;
    if (err.response?.status === 401 && orig && !orig._retry) {
      orig._retry = true;
      try {
        const refresh = localStorage.getItem('refreshToken');
        if (refresh) {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken: refresh });
          if (storeRef) {
            storeRef.dispatch({
              type: 'auth/setAuth',
              payload: { accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user },
            });
          }
          orig.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(orig);
        }
      } catch (e) {
        // Refresh failed
      }
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      } catch (e) {}
    }
   return Promise.reject(err);
  }
);

export default api;
