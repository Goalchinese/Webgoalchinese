<template>
  <v-row justify="center" dense>
    <v-col cols="12">
      <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="d-flex align-center ga-3">
            <v-avatar size="32" color="success" variant="tonal">
              <v-icon color="success" size="18">tabler-cash</v-icon>
            </v-avatar>
            <span class="text-h5 font-weight-bold">Teacher Fee Structure</span>
          </div>
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            rounded="pill"
            prepend-icon="tabler-plus"
            @click="addFeeStructure"
            v-if="userInfo?.role !== 'user' || permission?.create"
            v-show="!flagView"
          >
            Add
          </v-btn>
        </div>
        <v-card-text class="pa-0">
          <v-card
            rounded="lg"
            variant="flat"
            class="mb-4 pa-2"
            v-for="(item, inx) in itemsFeeStruture"
            :key="inx"
          >
            <v-card-text class="py-0">
              <div
                class="d-flex justify-end position-absolute"
                style="top: 0px; right: 0px; z-index: 1"
              >
                <v-btn
                  color="info"
                  dense
                  icon
                  variant="text"
                  @click="saveFeestructure(item.id, item, inx)"
                  v-if="userInfo?.role !== 'user' || permission?.edit"
                  v-show="!flagCreate"
                >
                  <v-icon>tabler-device-floppy</v-icon>
                </v-btn>
                <v-btn
                  color="error"
                  dense
                  icon
                  variant="text"
                  @click="deleteFeeStructure(item.id, inx)"
                  v-if="userInfo?.role !== 'user' || permission?.delete"
                  v-show="!flagView"
                >
                  <v-icon>tabler-trash</v-icon>
                </v-btn>
              </div>
              <v-form ref="formFee" lazy-validation>
                <v-row>
                  <v-col cols="12" md="4">
                    <v-row dense>
                      <v-col cols="12">
                        <AppDateTimePicker
                          v-model="item.updateDate"
                          label="Update Date"
                          density="compact"
                          placeholder="Select date"
                          :readonly="flagView"
                          :rules="[requiredValidator]"
                          prepend-inner-icon="tabler-calendar"
                        />
                      </v-col>
                      <v-col cols="12">
                        <AppTextField
                          v-model="item.note"
                          label="Note"
                          density="compact"
                          rounded="lg"
                          hide-details="auto"
                          placeholder="Enter note"
                          background-color="surface"
                          :readonly="flagView"
                        />
                      </v-col>
                    </v-row>
                  </v-col>

                  <v-col cols="12" md="4">
                    <AppTextarea
                      v-model="item.salaryForGroupClass"
                      label="Salary for group class"
                      density="compact"
                      rounded="lg"
                      hide-details="auto"
                      placeholder="Enter salary for group class"
                      background-color="surface"
                      :readonly="flagView"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <AppTextarea
                      v-model="item.salaryForPrivateClass"
                      label="Salary for private class"
                      density="compact"
                      rounded="lg"
                      hide-details="auto"
                      placeholder="Enter salary for private class"
                      background-color="surface"
                      :readonly="flagView"
                    />
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useTeacherFeeStructure } from "@/composables/useTeacherFeeStructure";

defineOptions({
  name: "TeacherFeeStructure",
});

defineProps<{
  flagView?: boolean;
  flagCreate?: boolean;
}>();

const emit = defineEmits<{
  input: [value: unknown];
  refForm: [value: unknown];
}>();

const {
  userInfo,
  permission,
  itemsFeeStruture,
  formFee,
  addFeeStructure,
  saveFeestructure,
  deleteFeeStructure,
} = useTeacherFeeStructure(emit);
</script>

<style scoped></style>
