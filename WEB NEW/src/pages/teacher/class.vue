<template>
  <v-row >
    <v-col cols="12">
      <h4 class="text-h4  font-weight-bold">Class</h4>
      <p class="text-body-small text-medium-emphasis mb-0">
        View your class schedule and calendar.
      </p>
    </v-col>
  </v-row>

  <v-row class="fill-height">
    <v-col>
      <Calendar @fetch-events="onFetchEvents" :events-items="events" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import { useAuth } from "@/composables/useAuth";
import { useSwal } from "@/composables/useSwal";

const { userInfo } = useAuth();
const { showApiError } = useSwal();
const events = ref<any[]>([]);

const onFetchEvents = async (payload?: { start?: string; end?: string }) => {
  try {
    const { data } = await axios.get("/classEvents", {
      params: {
        teacherId: userInfo.value?.accountID,
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

<style lang="scss" scoped></style>
