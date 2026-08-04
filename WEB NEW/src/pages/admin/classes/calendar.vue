<script setup lang="ts">
import { onMounted, ref } from "vue";
import axios from "axios";
import { useSwal } from "@/composables/useSwal";
import Calendar from "@/components/Calendar.vue";

const { showApiError } = useSwal();
const events = ref<unknown[]>([]);

const onFetchEvents = async (branchId?: string) => {
  events.value = [];
  try {
    const { data } = await axios.get(
      `/classEvents${branchId ? `?branchId=${branchId}` : ""}`,
    );
    events.value = data || [];
  } catch (error) {
    showApiError(error);
  }
};

onMounted(() => {
  onFetchEvents();
});
</script>

<template>
  <VRow>
    <VCol cols="12">
      <div class="text-h4 font-weight-bold">Class Calendar</div>
      <p class="text-body-small text-medium-emphasis mb-0">
        Manage all classes and schedules.
      </p>
    </VCol>
    <VCol cols="12">
      <Calendar :events-items="events" is-admin @fetch-events="onFetchEvents" />
    </VCol>
  </VRow>
</template>

<style lang="scss" scoped></style>
