import { defineStore } from 'pinia'

export interface UserInfo {
  id: number
  accountID: number
  username: string
  name: string
  photo?: string | null
  role: 'superadmin' | 'admin' | 'user' | 'teacher' | 'student'
  permissions?: Array<{ link?: string, create?: boolean, edit?: boolean, delete?: boolean }>
}

export const useAuthStore = defineStore('auth', {
  persist: true,
  state: () => ({
    userData: null as UserInfo | null,
    accessToken: null as string | null,
  }),
  actions: {
    setSession(user: UserInfo, token: string) {
      this.userData = user
      this.accessToken = token
    },
    logout() {
      this.userData = null
      this.accessToken = null
    },
  },
})
