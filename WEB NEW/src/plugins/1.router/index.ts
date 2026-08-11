import type { App } from 'vue'

import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash)
      return { el: to.hash, behavior: 'smooth', top: 60 }

    return { top: 0 }
  },
  routes: setupLayouts(routes),
})

router.beforeEach(to => {
  if (to.meta.public)
    return true

  const userData = useAuthStore().userData
  const allowedRoles = to.meta.auth?.roles as string[] | undefined

  if (!userData)
    return { name: 'login', query: { to: to.fullPath } }

  if (allowedRoles && !allowedRoles.includes(userData.role || ''))
    return { name: '403' }

  return true
})

export { router }

export default function (app: App) {
  app.use(router)
}
