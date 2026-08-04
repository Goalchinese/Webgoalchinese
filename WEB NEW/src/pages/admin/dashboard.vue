<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { useDashboard } from '@/composables/useDashboard'



const route = useRoute()
const { userInfo } = useAuth()

const permission = computed(() =>
  userInfo.value?.permissions?.find((it: { link?: string }) => it.link === route.path),
)

const {
  target,
  editTarget,
  totalIncome,
  isLoading,
  totalList,
  summaryList,
  events,
  saveSetting,
  onFetchEvents,
} = useDashboard()
</script>

<template>
    <VOverlay :model-value="isLoading" contained scroll-strategy="none" class="align-center justify-center">
      <div class="text-center">
        <VProgressCircular indeterminate size="80" width="8" color="primary" />
        <div class="mt-4 text-white text-h6">
          Loading Dashboard...
        </div>
      </div>
    </VOverlay>

    <VRow>
      <VCol cols="12">
        <div class="mb-2">
          <div class="text-h4 font-weight-bold mb-0">
            {{ userInfo?.name }}
          </div>
          <div class="text-body-1 text-medium-emphasis mb-0">
            Here's what's happening with your classes today.
          </div>
        </div>
      </VCol>
    </VRow>

    <VRow>
      <VCol cols="12" md="4">
        <VCard rounded="lg" elevation="1" class="pa-4 h-100">
          <div class="d-flex align-center mb-2">
            <VAvatar color="primary" size="45" class="mr-3" variant="tonal">
              <VIcon color="primary" icon="tabler-wallet" size="28" />
            </VAvatar>
            <div class="text-body-1 text-medium-emphasis">
              Total Income [{{ new Date().getFullYear() }}]
            </div>
          </div>
          <div class="d-flex align-end justify-center">
            <span class="text-h2 text-primary">
              {{ Number(totalIncome)?.toLocaleString() }}
            </span>
            <span class="text-body-2 text-medium-emphasis ml-2">THB</span>
          </div>
        </VCard>
      </VCol>

      <VCol cols="12" md="4">
        <VCard rounded="lg" elevation="1" class="pa-4 h-100">
          <div class="d-flex justify-space-between align-center mb-2">
            <div class="d-flex align-center">
              <VAvatar color="info" size="46" class="mr-3" variant="tonal">
                <VIcon color="info" icon="tabler-target" size="28" />
              </VAvatar>
              <div class="text-body-1 text-medium-emphasis">
                Total Target [{{ new Date().getFullYear() }}]
              </div>
            </div>
            <VIcon
              v-if="userInfo?.role !== 'user' || permission?.edit"
              icon="tabler-edit"
              size="20"
              @click="editTarget = true"
            />
          </div>
          <div v-if="!editTarget" class="d-flex align-end justify-center">
            <span class="text-h2 text-info">
              {{ target.toLocaleString() }}
            </span>
            <span class="text-body-1 text-medium-emphasis ml-2">THB</span>
          </div>
          <div v-else class="d-flex align-center ga-2">
            <VTextField
              v-model.number="target"
              type="number"
              density="compact"
              variant="outlined"
              single-line
              hide-details="auto"
            />
            <VBtn color="primary" @click="saveSetting">
              Save
            </VBtn>
          </div>
        </VCard>
      </VCol>

      <VCol cols="12" md="4">
        <VCard rounded="lg" elevation="1" class="pa-4 h-100">
          <div v-for="total in totalList" :key="total.name" class="d-flex align-center mb-2">
            <VAvatar :color="total.color" size="32" class="mr-3" variant="tonal">
              <VIcon :color="total.color" :icon="total.icon" size="20" />
            </VAvatar>
            <span class="text-body-1 text-medium-emphasis flex-grow-1">{{ total.name }}</span>
            <span class="text-body-1">{{ total.value }}</span>
          </div>
        </VCard>
      </VCol>

      <VCol v-for="(item, i) in summaryList" :key="i" cols="6" md="3">
        <StatTile :icon="item.icon" :color="item.color" :label="item.name" :value="item.value" />
      </VCol>
    </VRow>

    <VRow>
      <VCol cols="12">
        <Calendar class="mt-2" :events-items="events" is-admin @fetch-events="onFetchEvents" />
      </VCol>
    </VRow>
</template>
