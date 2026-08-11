<template>
  <v-row>
    <v-col cols="12" class="d-flex align-center ga-2">
      <v-btn icon="tabler-arrow-left" variant="text" to="/admin/users" />
      <div>
        <h4 class="text-h4 font-weight-bold">Edit Users</h4>
        <p class="text-body-small text-medium-emphasis mb-0">
          Update user account information and permissions.
        </p>
      </div>
    </v-col>
  </v-row>

  <v-form ref="formRef" lazy-validation>
    <UserForm
      :edit-items="editItems"
      :user-permissions="userPermission"
      :flag-edit="true"
      @input="formInput = $event"
    />
  </v-form>
  <v-row justify="end" class="mt-4 ga-2" no-gutters>
    <v-col cols="auto">
      <v-btn variant="outlined" class="text-none" to="/admin/users">
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
import UserForm from "@/views/user/UserForm.vue";

const { showApiError } = useSwal();
const route = useRoute();
const router = useRouter();

const formRef = ref<any>(null);
const formInput = ref<Record<string, unknown> | null>(null);
const editItems = ref<Record<string, unknown> | null>(null);
const userPermission = ref<any[]>([]);

const fetchDataById = async () => {
  try {
    const { data } = await axios.get(`/account/${route.params.id}`);
    editItems.value = {
      ...data,
      dateOfBirth: new Date(data.dateOfBirth).toISOString().substring(0, 10),
      username: data.user.username,
      password: "",
    };
    userPermission.value = data.permissions;
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
      if (value && key !== "permissions") {
        formData.append(key, value as string);
      } else if (key === "permissions") {
        formData.append("permissions", JSON.stringify(value));
      }
    }

    const { data } = await axios.put(`/account/${route.params.id}`, formData);

    Swal.fire(data?.message, "", "success");
    router.push({ name: "admin-users" });
  } catch (error) {
    showApiError(error);
  }
};

onMounted(() => {
  fetchDataById();
});
</script>

<style scoped></style>
