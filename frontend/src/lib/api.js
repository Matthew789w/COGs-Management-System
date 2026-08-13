import axios from 'axios'

axios.defaults.withCredentials = true
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
axios.defaults.headers.common.Accept = 'application/json'
axios.defaults.xsrfCookieName = 'XSRF-TOKEN'
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN'

let unauthorizedHandler = null

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute =
      error.config?.url?.includes('/api/auth/login') ||
      error.config?.url?.includes('/api/auth/me')

    if (error.response?.status === 401 && !isAuthRoute && unauthorizedHandler) {
      unauthorizedHandler()
    }

    return Promise.reject(error)
  },
)

export async function ensureCsrfCookie() {
  await axios.get('/sanctum/csrf-cookie')
}

export default axios
