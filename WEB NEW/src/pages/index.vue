<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

definePage({
  meta: {
    public: true,
  },
})

const router = useRouter()
const { userInfo, homeRoute } = useAuth()

router.replace(userInfo.value ? { path: homeRoute(userInfo.value.role) } : { name: 'login' })
</script>

<template>
  <div />
</template>
