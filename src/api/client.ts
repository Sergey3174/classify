import axios from 'axios'

const configuredUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '') ?? ''

/** All backend endpoints share the /api prefix; external services use their own client. */
export const apiClient = axios.create({
  baseURL: configuredUrl.endsWith('/api') ? configuredUrl : `${configuredUrl}/api`,
  timeout: 15000,
  headers: { Accept: 'application/json' },
})

// Kept for this app session; a reload starts a fresh Telegram authorization.
let authorization: string | null = null

apiClient.interceptors.request.use((config) => {
  if (config.url === '/auth') {
    authorization = null
    config.headers.delete('Authorization')
  } else if (authorization) {
    config.headers.set('Authorization', authorization)
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    if (response.config.url === '/auth') {
      const header = Object.entries(response.headers).find(([name]) => name.toLowerCase() === 'authorization')?.[1]
      authorization = typeof header === 'string' && header.trim() ? header.trim() : null
    }
    return response
  },
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      authorization = null
    }
    return Promise.reject(error)
  },
)
