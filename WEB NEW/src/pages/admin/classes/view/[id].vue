<template>
  <v-row>
    <v-col cols="12" class="d-flex align-center ga-2">
      <v-btn icon="tabler-arrow-left" variant="text" to="/admin/classes/all" />
      <div>
        <h4 class="text-h4 font-weight-bold">Class {{ editItems?.no }}</h4>
        <p class="text-body-small text-medium-emphasis mb-0">
          View class details and schedule.
        </p>
      </div>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12">
      <ClassViewDetail :item-data="editItems" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import axios from "axios";
import { useRoute } from "vue-router";
import { useSwal } from "@/composables/useSwal";
import ClassViewDetail from "@/views/classes/ClassViewDetail.vue";

const { showApiError } = useSwal();
const route = useRoute();

const editItems = ref<Record<string, unknown> | null>(null);

const fetchDataById = async () => {
  try {
    const { data } = await axios.get(`/classes/${route.params.id}`);
    editItems.value = {
      ...data,
      endDate: new Date(data.endDate).toISOString().substring(0, 10),
      startDate: new Date(data.startDate).toISOString().substring(0, 10),
    };
  } catch (error) {
    showApiError(error);
  }
};

onMounted(() => {
  fetchDataById();
});
</script>

<style scoped></style>
