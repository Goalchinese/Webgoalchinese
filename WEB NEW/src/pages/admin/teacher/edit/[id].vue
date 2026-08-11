<template>
  <v-row>
    <v-col cols="12" class="d-flex align-center ga-2">
      <v-btn icon="tabler-arrow-left" variant="text" to="/admin/teacher/all" />
      <div>
        <h4 class="text-h4 font-weight-bold">Edit Teacher</h4>
        <p class="text-body-small text-medium-emphasis mb-0">
          Update teacher information and profile details.
        </p>
      </div>
    </v-col>
  </v-row>

  <v-form ref="formRef" lazy-validation>
    <TeacherForm
      :edit-items="editItems"
      :flag-edit="true"
      @input="formInput = $event"
    />
  </v-form>

  <v-row justify="end" class="mt-4 ga-2" no-gutters>
    <v-col cols="auto">
      <v-btn variant="outlined" class="text-none" to="/admin/teacher/all">
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
import TeacherForm from "@/views/teacher/TeacherForm.vue";

const { showApiError } = useSwal();
const route = useRoute();
const router = useRouter();

const formRef = ref<any>(null);
const formInput = ref<Record<string, unknown> | null>(null);
const editItems = ref<Record<string, unknown> | null>(null);

const fetchDataById = async () => {
  try {
    const { data } = await axios.get(`/account/${route.params.id}`);
    editItems.value = {
      ...data,
      dateOfBirth: new Date(data.dateOfBirth).toISOString().substring(0, 10),
      registerDate: new Date(data.registerDate).toISOString().substring(0, 10),
      username: data.user.username,
      password: "",
    };
  } catch (error) {
    showApiError(error);
  }
};

const update = async () => {
  const { valid: isValid } = await formRef.value.validate();
  if (!isValid) return;

  try {
    const formData = new FormData();
    for (const key in formInput.value) {
      const value = (formInput.value as Record<string, unknown>)[key];
      if (value && key !== "photo") {
        formData.append(key, value as string);
      } else if (key === "photo" && value) {
        formData.append("profile", value as Blob);
      }
    }

    const { data } = await axios.put(`/account/${route.params.id}`, formData);

    Swal.fire(data?.message, "", "success");
    router.push({ name: "admin-teacher-all" });
  } catch (error) {
    showApiError(error);
  }
};

onMounted(() => {
  fetchDataById();
});
</script>

<style scoped></style>
