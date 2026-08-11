<template>
  <v-row>
    <v-col cols="12" class="d-flex align-center ga-2">
      <v-btn icon="tabler-arrow-left" variant="text" to="/admin/student/all" />
      <div>
        <h4 class="text-h4 font-weight-bold">Edit Student</h4>
        <p class="text-body-small text-medium-emphasis mb-0">
          Update student information and admission details.
        </p>
      </div>
    </v-col>
  </v-row>
  <v-form ref="formRef" lazy-validation>
    <StudentForm
      :edit-items="editItems"
      :flag-edit="true"
      @input="formInput = $event"
    />
  </v-form>

  <v-row justify="end" class="mt-4 ga-2" no-gutters>
    <v-col cols="auto">
      <v-btn variant="outlined" class="text-none" to="/admin/student/all">
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
import StudentForm from "@/views/student/StudentForm.vue";

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
      addmissionDate: new Date(data.addmissionDate)
        .toISOString()
        .substring(0, 10),
      endClassDate: new Date(data.endClassDate).toISOString().substring(0, 10),
      username: data?.user?.username,
      password: null,
      expireDate: data?.user?.expireDate
        ? new Date(data?.user?.expireDate).toISOString().substring(0, 10)
        : "",
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
    router.push({ name: "admin-student-all" });
  } catch (error) {
    showApiError(error);
  }
};

onMounted(() => {
  fetchDataById();
});
</script>

<style scoped></style>
