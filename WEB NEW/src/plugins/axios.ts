import axios from 'axios'
import type { App } from 'vue'
import { router } from '@/plugins/1.router'
import { useAuthStore } from '@/stores/auth'

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

axios.interceptors.request.use(
  config => {
    const { accessToken } = useAuthStore()

    if (accessToken)
      config.headers.Authorization = `Bearer ${accessToken}`

    return config
  },
  error => Promise.reject(error),
)

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      useAuthStore().logout()
      router.replace({ name: 'login' })
    }

    return Promise.reject(error)
  },
)

export { axios }

// No app-level registration needed — this module's side effects (interceptors) run on import
export default function (_app: App) {}
