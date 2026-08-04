<template>
  <VCard
    rounded="lg"
    elevation="1"
    class="stat-tile pa-4"
    :style="{ borderLeft: `4px solid rgb(var(--v-theme-${color}))` }"
  >
    <div class="d-flex align-center">
      <VAvatar :color="color" size="46" class="mr-3" variant="tonal">
        <VIcon :icon="icon" size="28" />
      </VAvatar>
      <div>
        <div class="text-h5 font-weight-bold">
          {{ displayValue }}
        </div>
        <div class="text-body-small text-medium-emphasis">
          {{ label }}
        </div>
      </div>
    </div>
  </VCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  icon: string
  label: string
  value: number | string
  color?: string
  unit?: string
}>()

const displayValue = computed(() => {
  const numeric = Number(props.value)
  const formatted = Number.isNaN(numeric)
    ? props.value
    : numeric.toLocaleString()

  return props.unit ? `${formatted} ${props.unit}` : formatted
})
</script>

<style scoped>
.stat-tile {
  height: 100%;
}
</style>
