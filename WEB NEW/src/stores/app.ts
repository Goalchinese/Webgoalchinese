import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  persist: true,
  state: () => ({
    userInfo: null as Record<string, any> | null,
    logo: null as string | null,
  }),
  getters: {
    getUserinfo: state => state.userInfo,
  },
  actions: {
    setUserInfo(userInfo: Record<string, any>) {
      this.userInfo = userInfo
    },
    setLogo(logo: string) {
      this.logo = logo
    },
  },
})
