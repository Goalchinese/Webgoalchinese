interface SettingResponse {
  logo?: string | null
  academyName?: string
}

export function useLoginForm() {
  const logo = ref<string | null>(null)
  const academyName = ref('')

  const fetchSiteInfo = async () => {
    try {
      const data = await $api<SettingResponse[]>('/setting')
      const setting = data[0]

      logo.value = setting?.logo
        ? `${import.meta.env.VITE_APP_API_IMAGE}${setting.logo}`
        : null
      academyName.value = setting?.academyName || ''
    }
    catch {
      logo.value = null
      academyName.value = ''
    }
  }

  onMounted(fetchSiteInfo)

  return { logo, academyName, fetchSiteInfo }
}
