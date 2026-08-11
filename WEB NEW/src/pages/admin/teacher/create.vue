<template>
  <v-row>
    <v-col cols="12" class="d-flex align-center ga-2">
      <v-btn icon="tabler-arrow-left" variant="text" to="/admin/teacher/all" />
      <div>
        <div class="text-h4 font-weight-bold">New Teacher</div>
        <p class="text-body-small text-medium-emphasis mb-0">
          Add new teacher information and manage their teaching details.
        </p>
      </div>
    </v-col>
  </v-row>

  <v-form ref="formRef">
    <TeacherForm
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
      <v-btn
        variant="outlined"
        color="primary"
        class="text-none"
        rounded="lg"
        to="/admin/teacher/all"
      >
        Cancel
      </v-btn>
    </v-col>
    <v-col cols="auto">
      <v-btn
        v-if="userInfo?.role !== 'user' || permission?.create"
        color="primary"
        variant="flat"
        rounded="lg"
        class="text-none ms-2"
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
import TeacherForm from "@/views/teacher/TeacherForm.vue";
import { useTeacherCreate } from "@/composables/useTeacherCreate";

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
} = useTeacherCreate();

const onCreate = () => create(formRef.value);
</script>

<style scoped></style>
