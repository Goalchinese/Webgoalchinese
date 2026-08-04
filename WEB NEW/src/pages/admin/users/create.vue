<template>
  <v-row>
    <v-col cols="12" class="d-flex align-center ga-2">
      <v-btn icon="tabler-arrow-left" variant="text" to="/admin/users" />
      <div>
        <h4 class="text-h4 font-weight-bold">Add User</h4>
        <p class="text-body-small text-medium-emphasis mb-0">
          Create a new user and set permissions.
        </p>
      </div>
    </v-col>
  </v-row>

  <v-form ref="formRef">
    <UserForm @input="(val) => (formInput = val)" />
  </v-form>

  <v-row justify="end" class="mt-4">
    <v-col cols="auto">
      <v-btn color="primary" class="text-none" @click="onCreate">
        <v-icon start>tabler-device-floppy</v-icon>
        Save
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref } from "vue";
import UserForm from "@/views/user/UserForm.vue";
import { useUserCreate } from "@/composables/useUserCreate";

const formRef = ref();
const { formInput, create } = useUserCreate();

const onCreate = () => create(formRef.value);
</script>

<style scoped></style>
