<template>
  <v-row>
    <v-col cols="12" class="d-flex align-center ga-2 mb-4">
      <v-btn icon="tabler-arrow-left" variant="text" to="/admin/classes/all" />
      <div>
        <div class="text-h4 font-weight-bold">New Class Admission</div>
        <p class="text-body-small text-medium-emphasis mb-0">
          Create a new class and manage its schedule.
        </p>
      </div>
    </v-col>
  </v-row>

  <v-form ref="formRef" lazy-validation>
    <FormClass @input="formInput = $event" />
  </v-form>

  <v-row justify="end" class="mt-4 ga-2" no-gutters>
    <v-col cols="auto">
      <v-btn variant="outlined" class="text-none" to="/admin/classes/all">
        Cancel
      </v-btn>
    </v-col>
    <v-col cols="auto">
      <v-btn color="primary" class="text-none" @click="create">
        <v-icon start>tabler-device-floppy</v-icon>
        Save
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
import { useSwal } from "@/composables/useSwal";
import FormClass from "@/views/classes/FormClass.vue";

const { showApiError } = useSwal();
const router = useRouter();

const formRef = ref<any>(null);
const formInput = ref<Record<string, unknown>>({});

const create = async () => {
  const { valid: isValid } = await formRef.value.validate();
  if (!isValid) return;

  try {
    const { data } = await axios.post(`/classes`, formInput.value);

    Swal.fire(data?.message, "", "success");
    router.push({ name: "admin-classes-all" });
  } catch (error) {
    showApiError(error);
  }
};
</script>

<style scoped></style>
