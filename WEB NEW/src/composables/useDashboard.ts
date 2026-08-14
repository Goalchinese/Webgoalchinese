import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import { axios } from '@/plugins/axios'
import { useSwal } from '@/composables/useSwal'

interface TotalListItem {
  name: string
  value: number
  icon: string
  color: string
}

interface SummaryTile {
  name: string
  value: number
  icon: string
  color: string
}

interface DashboardData {
  summaryUser?: {
    totalOnlineStudent?: number
    totalOfflineStudent?: number
    totalTeacher?: number
    totalAdmin?: number
  }
  summaryBranch?: Array<{
    studentTypeName: string
    totalClass?: number
    totalStudent?: number
    totalExpireClass?: number
    totalIncomeClass?: number
  }>
  summaryIncome?: Array<{ totalIncome?: number }>
}

const CACHE_DURATION_MS = 60 * 1000

export function useDashboard() {
  const { showApiError } = useSwal()

  const target = ref(0)
  const editTarget = ref(false)
  const totalIncome = ref(0)
  const isLoading = ref(true)

  const totalList = reactive<TotalListItem[]>([
    { name: 'Total Student', value: 0, icon: 'tabler-users', color: 'warning' },
    { name: 'Total Teacher', value: 0, icon: 'tabler-users-group', color: 'info' },
    { name: 'Total Admin', value: 0, icon: 'tabler-user-bolt', color: 'success' },
  ])

  const summaryList = ref<SummaryTile[]>([])

  let dashboardCache: DashboardData | null = null
  let cacheTimestamp: number | null = null
  let refreshInterval: ReturnType<typeof setInterval> | undefined

  const summaryTileIcon = (label: string) => {
    if (label.startsWith('Total classes'))
      return { icon: 'tabler-device-desktop', color: 'purple' }
    if (label.startsWith('Total Student'))
      return { icon: 'tabler-users-group', color: 'green' }
    if (label.startsWith('Expiring Classes'))
      return { icon: 'tabler-hourglass', color: 'orange' }
    if (label.startsWith('Monthly income'))
      return { icon: 'tabler-wallet', color: 'red' }

    return { icon: 'tabler-info-circle', color: 'grey' }
  }

  const processDashboardData = (data: DashboardData) => {
    summaryList.value = []

    if (data.summaryUser) {
      totalList.forEach(it => {
        if (it.name === 'Total Student') {
          it.value
            = (data.summaryUser?.totalOnlineStudent || 0)
            + (data.summaryUser?.totalOfflineStudent || 0)
        }
        else if (it.name === 'Total Teacher') {
          it.value = data.summaryUser?.totalTeacher || 0
        }
        else if (it.name === 'Total Admin') {
          it.value = data.summaryUser?.totalAdmin || 0
        }
      })
    }

    if (data.summaryBranch?.length) {
      data.summaryBranch.forEach(branch => {
        const tiles: Array<[string, number]> = [
          [`Total classes ${branch.studentTypeName}`, branch.totalClass || 0],
          [`Total Student ${branch.studentTypeName}`, branch.totalStudent || 0],
          [`Expiring Classes ${branch.studentTypeName}`, branch.totalExpireClass || 0],
          [`Monthly income ${branch.studentTypeName}`, branch.totalIncomeClass || 0],
        ]

        tiles.forEach(([name, value]) => {
          summaryList.value.push({ name, value, ...summaryTileIcon(name) })
        })
      })
    }

    if (data.summaryIncome?.length)
      totalIncome.value = data.summaryIncome[0].totalIncome || 0
  }

  const fetchDashboardData = async () => {
    try {
      if (
        dashboardCache
        && cacheTimestamp
        && Date.now() - cacheTimestamp < CACHE_DURATION_MS
      ) {
        processDashboardData(dashboardCache)

        return
      }

      const { data } = await axios.get('/dashboard/getData')

      dashboardCache = data
      cacheTimestamp = Date.now()
      processDashboardData(data)
    }
    catch (error) {
      dashboardCache = null
      cacheTimestamp = null
      summaryList.value = []
      showApiError(error)
    }
  }

  const fetchSetting = async () => {
    try {
      const { data } = await axios.get('/setting')

      target.value = data.length ? data[0].target || 0 : 0
    }
    catch (error) {
      showApiError(error)
    }
  }

  const saveSetting = async () => {
    try {
      const formData = new FormData()

      formData.append('target', String(target.value))
      await axios.post('/setting', formData)
      await fetchSetting()
      editTarget.value = false
    }
    catch (error) {
      showApiError(error)
    }
  }

  const events = ref<unknown[]>([])
  const onFetchEvents = async (payload?: { branchId?: string; start?: string; end?: string }) => {
    try {
      const { data } = await axios.get('/classEvents', {
        params: {
          branchId: payload?.branchId,
          start: payload?.start,
          end: payload?.end,
        },
      })

      events.value = data || []
    }
    catch (error) {
      showApiError(error)
    }
  }

  onMounted(async () => {
    isLoading.value = true
    try {
      await Promise.all([fetchSetting(), fetchDashboardData()])
      setTimeout(() => onFetchEvents(), 100)
      refreshInterval = setInterval(fetchDashboardData, 30 * 1000)
    }
    finally {
      isLoading.value = false
    }
  })

  onBeforeUnmount(() => {
    if (refreshInterval)
      clearInterval(refreshInterval)
  })

  return {
    target,
    editTarget,
    totalIncome,
    isLoading,
    totalList,
    summaryList,
    events,
    saveSetting,
    onFetchEvents,
  }
}
