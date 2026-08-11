<template>
    <v-row>
    <v-col cols="12" class="d-flex align-center ga-2 mb-2">
      <v-btn icon="tabler-arrow-left" variant="text" to="/admin/materials/all" />
      <div>
      <div class="text-h4 font-weight-bold">Materials</div>
        <p class="text-body-small text-medium-emphasis mb-0">
         Add new learning material information.
        </p>
      </div>
    </v-col>
  </v-row>


  <v-form ref="formRef" lazy-validation>
    <MaterialForm :flag-edit="false" @input="formInput = $event" />
  </v-form>

  <v-row justify="end" class="mt-4 ga-2" no-gutters>
      <v-col cols="auto">
        <v-btn variant="outlined" class="text-none" to="/admin/materials/all">
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
import MaterialForm from "@/views/material/MaterialForm.vue";

const { showApiError } = useSwal();
const router = useRouter();

const formRef = ref<any>(null);
const formInput = ref<Record<string, unknown>>({
  title: "",
  categoryID: "",
  materialForID: "",
  materialTypeID: "",
  no: "",
  document: null,
  description: "",
  link: "",
  photo: null,
  documentType: "",
});

const create = async () => {
  const { valid: isValid } = await formRef.value.validate();
  if (!isValid) return;

  try {
    const formData = new FormData();
    for (const key in formInput.value) {
      formData.append(key, (formInput.value as Record<string, any>)[key] || "");
    }

    const { data } = await axios.post(`/materials`, formData);

    Swal.fire(data?.message, "", "success");
    router.push({ name: "admin-materials-all" });
  } catch (error) {
    showApiError(error);
  }
};
</script>

<style scoped></style>
