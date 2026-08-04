<template>
    <v-row>
      <v-col cols="12" class="d-flex align-center ga-2 mb-4">
        <v-btn icon="tabler-arrow-left" variant="text" to="/admin/classes/all" />
        <div>
          <h4 class="text-h4 font-weight-bold">Edit Class</h4>
          <p class="text-body-small text-medium-emphasis mb-0">
            Edit class information and schedule.
          </p>
        </div>
      </v-col>
    </v-row>

    <v-form ref="formRef" lazy-validation>
      <FormClass :edit-items="editItems" :flag-edit="true" @input="formInput = $event" />
    </v-form>

    <v-row justify="end" class="mt-4 ga-2" no-gutters>
      <v-col cols="auto">
        <v-btn variant="outlined" class="text-none" to="/admin/classes/all">
          Cancel
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" class="text-none" @click="update">
          <v-icon start>tabler-device-floppy</v-icon>
          Save
        </v-btn>
      </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useRoute, useRouter } from "vue-router";
import { useSwal } from "@/composables/useSwal";
import FormClass from "@/views/classes/FormClass.vue";


const { showApiError } = useSwal();
const route = useRoute();
const router = useRouter();

const formRef = ref<any>(null);
const formInput = ref<Record<string, unknown> | null>(null);
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

const update = async () => {
  const { valid: isValid } = await formRef.value.validate();
  if (!isValid) return;

  try {
    const { data } = await axios.put(`/classes/${route.params.id}`, formInput.value);

    Swal.fire(data?.message, "", "success");
    router.push({ name: "admin-classes-all" });
  } catch (error) {
    showApiError(error);
  }
};

onMounted(() => {
  fetchDataById();
});
</script>

<style scoped></style>
