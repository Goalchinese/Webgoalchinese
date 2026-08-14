<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import { useSwal } from "@/composables/useSwal";
import Calendar from "@/components/Calendar.vue";

const { showApiError } = useSwal();
const events = ref<unknown[]>([]);

const onFetchEvents = async (payload?: {
  branchId?: string;
  start?: string;
  end?: string;
}) => {
  try {
    const { data } = await axios.get("/classEvents", {
      params: {
        branchId: payload?.branchId,
        start: payload?.start,
        end: payload?.end,
      },
    });
    events.value = data || [];
  } catch (error) {
    showApiError(error);
  }
};
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
