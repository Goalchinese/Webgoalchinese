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
import { onMounted, ref } from "vue";
import axios from "axios";
import { useAuth } from "@/composables/useAuth";
import { useSwal } from "@/composables/useSwal";

const { userInfo } = useAuth();
const { showApiError } = useSwal();
const events = ref<any[]>([]);

const onFetchEvents = async () => {
  try {
    const { data } = await axios.get(
      `/classEvents?teacherId=${userInfo.value?.accountID}`,
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

<style lang="scss" scoped></style>
