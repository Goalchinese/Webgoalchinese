<template>
  <v-row>
    <v-col cols="12" class="d-flex align-center ga-2 mb-4">
      <v-btn icon="tabler-arrow-left" variant="text" to="/admin/student/all" />
      <div>
        <div class="text-h4 font-weight-bold">New Student Admission</div>
        <p class="text-body-small text-medium-emphasis mb-0">
          Add new student information and admission details.
        </p>
      </div>
    </v-col>
  </v-row>

  <v-form ref="formRef">
    <StudentForm
      :flag-create="true"
      @input="(val) => (formInput = val)"
      @ref-form-fee="(ref) => (refFormFee = ref)"
      @data-form-fee="(data) => (formFeeStructure = data)"
      @ref-form-score="(ref) => (refFormScore = ref)"
      @data-form-score="(data) => (formScoreStructure = data)"
    />
  </v-form>

  <v-row justify="end" class="mt-4 ga-2" no-gutters>
    <v-col cols="auto">
      <v-btn variant="outlined" class="text-none" to="/admin/student/all">
        Cancel
      </v-btn>
    </v-col>
    <v-col cols="auto">
      <v-btn
        v-if="userInfo?.role !== 'user' || permission?.create"
        color="primary"
        class="text-none"
        @click="onCreate"
      >
        <v-icon start>tabler-device-floppy</v-icon>
        Save
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import StudentForm from "@/views/student/StudentForm.vue";
import { useStudentCreate } from "@/composables/useStudentCreate";

const { userInfo } = useAuth();
const route = useRoute();

const permission = computed(() =>
  userInfo.value?.permissions?.find(
    (it: { link?: string }) => it.link === route.path,
  ),
);

const formRef = ref();
const {
  formInput,
  refFormFee,
  formFeeStructure,
  refFormScore,
  formScoreStructure,
  create,
} = useStudentCreate();

const onCreate = () => create(formRef.value);
</script>

<style scoped></style>
