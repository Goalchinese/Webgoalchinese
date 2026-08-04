<script setup>
const logisticData = ref([
  {
    icon: "tabler-heart-rate-monitor",
    color: "primary",
    title: "Total classes online",
    value: 42,
    isHover: false,
  },
  {
    icon: "tabler-users-group",
    color: "warning",
    title: "Total Students online",
    value: 8,
    isHover: false,
  },
  {
    icon: "tabler-hourglass-low",
    color: "error",
    title: "Expiring Classes online",
    value: 27,
    isHover: false,
  },
  {
    icon: "tabler-currency-dollar",
    color: "info",
    title: "Monthly income online THB",
    value: 13,
    isHover: false,
  },
]);
</script>

<template>
  <VRow>
    <VCol
      v-for="(data, index) in logisticData"
      :key="index"
      cols="12"
      md="3"
      sm="6"
    >
      <div>
        <VCard
          class="logistics-card-statistics cursor-pointer"
          :style="
            data.isHover
              ? `border-inline-start-color: rgb(var(--v-theme-${data.color}))`
              : `border-inline-start-color: rgba(var(--v-theme-${data.color}),0.38)`
          "
          @mouseenter="data.isHover = true"
          @mouseleave="data.isHover = false"
        >
          <VCardText>
            <div class="d-flex align-center gap-x-4 mb-1">
              <VAvatar
                variant="tonal"
                :color="data.color"
                rounded="pill"
                size="48"
              >
                <VIcon :icon="data.icon" size="28" />
              </VAvatar>
              <div class="d-flex flex-column">
                <h4 class="text-h4">
                  {{ data.value }}
                </h4>
                <div class="text-subtitle-2 mb-1">
                  {{ data.title }}
                </div>
              </div>
            </div>

            <!-- <div class="d-flex gap-x-2 align-center">
              <h6 class="text-h6">
                {{ (data.change > 0) ? '+' : '' }} {{ data.change }}%
              </h6>
              <div class="text-sm text-disabled">
                than last week
              </div>
            </div> -->
          </VCardText>
        </VCard>
      </div>
    </VCol>
  </VRow>
</template>

<style lang="scss" scoped>
@use "@core/scss/base/mixins" as mixins;

.logistics-card-statistics {
  border-inline-start-style: solid;
  border-inline-start-width: 2px;

  &:hover {
    border-inline-start-width: 3px;
    margin-inline-start: -1px;

    @include mixins.elevation(8);

    transition: all 0.1s ease-out;
  }
}

.skin--bordered {
  .logistics-card-statistics {
    border-inline-start-width: 2px;

    &:hover {
      border-inline-start-width: 3px;
      margin-inline-start: -2px;
      transition: all 0.1s ease-out;
    }
  }
}
</style>
