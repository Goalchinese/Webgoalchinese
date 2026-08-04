import { storeToRefs } from 'pinia'
import type { UserInfo } from '@/stores/auth'
import { useAuthStore } from '@/stores/auth'

export type { UserInfo }

export const HOME_ROUTE_BY_ROLE: Record<string, string> = {
  superadmin: '/admin/dashboard',
  admin: '/admin/dashboard',
  user: '/admin/dashboard',
  teacher: '/teacher/class',
  student: '/student/class',
}

export function useAuth() {
  const authStore = useAuthStore()
  const { userData, accessToken } = storeToRefs(authStore)

  const isLoggedIn = computed(() => !!accessToken.value && !!userData.value)
  const userInfo = computed(() => userData.value)

  const setSession = (user: UserInfo, token: string) => authStore.setSession(user, token)

  const logout = () => authStore.logout()

  const homeRoute = (role?: string) => HOME_ROUTE_BY_ROLE[role || ''] || '/login'

  return { userData, accessToken, isLoggedIn, userInfo, setSession, logout, homeRoute }
}
