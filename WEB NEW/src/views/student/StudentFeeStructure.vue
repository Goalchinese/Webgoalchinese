<template>
  <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="d-flex align-center">
        <v-avatar size="32" color="warning" class="mr-3">
          <v-icon color="white" size="20">tabler-cash</v-icon>
        </v-avatar>
        <span class="text-h5 font-weight-bold">Student Fee Structure</span>
      </div>
      <v-btn
        color="primary"
        variant="flat"
        size="small"
        rounded="pill"
        prepend-icon="tabler-plus"
        @click="addFeeStructure"
        v-show="!flagView"
        v-if="userInfo?.role !== 'user' || permission?.create"
      >
        Add
      </v-btn>
    </div>

    <v-card
      variant="flat"
      rounded="lg"
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
            density="compact"
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
            density="compact"
            icon
            variant="text"
            @click="deleteFeeStructure(item.id, inx)"
            v-if="userInfo?.role !== 'user' || permission?.delete"
          >
            <v-icon>tabler-trash</v-icon>
          </v-btn>
        </div>
        <v-form ref="formFee" lazy-validation>
          <v-row>
            <v-col cols="12" md="4">
              <AppDateTimePicker
                v-model="item.payDate"
                label="Pay Date"
                      density="compact"
                placeholder="Select date"
                :readonly="flagView"
                :rules="[requiredValidator]"
                prepend-inner-icon="tabler-calendar"
              />
            </v-col>
            <v-col cols="12" md="2">
              <AppSelect
                v-model="item.classType"
                label="Class type"
                :items="itemsOptions.classType"
                item-title="name"
                item-value="name"
                density="compact"
                rounded="lg"
                hide-details="auto"
                placeholder="Select class"
                :readonly="flagView"
                :rules="[(v) => !!v || 'Class type is required']"
              />
            </v-col>
            <v-col cols="12" md="2">
              <AppSelect
                v-model="item.branch"
                label="Branch"
                :items="itemsOptions.branch"
                item-title="name"
                item-value="name"
                density="compact"
                rounded="lg"
                hide-details="auto"
                placeholder="Select branch"
                :readonly="flagView"
                :rules="[(v) => !!v || 'Branch is required']"
              />
            </v-col>
            <v-col cols="12" md="4">
              <AppTextField
                v-model="item.amount"
                label="Amount"
                density="compact"
                rounded="lg"
                type="number"
                hide-details="auto"
                placeholder="Enter amount"
                :readonly="flagView"
                :rules="[(v) => !!v || 'Amount is required']"
              />
            </v-col>
            <v-col cols="12" md="4">
              <AppTextField
                v-model="item.classFee"
                label="Class fee [Bath]"
                density="compact"
                rounded="lg"
                type="number"
                hide-details="auto"
                placeholder="Enter fee"
                :readonly="flagView"
                :rules="[(v) => !!v || 'Fee is required']"
              />
            </v-col>
            <v-col cols="12" md="4">
              <AppTextField
                v-model="item.discount"
                label="Discount [Bath]"
                density="compact"
                rounded="lg"
                hide-details="auto"
                placeholder="Enter discount"
                :readonly="flagView"
              />
            </v-col>
            <v-col cols="12" md="4">
              <AppTextField
                v-model="item.note"
                label="Note"
                density="compact"
                rounded="lg"
                hide-details="auto"
                placeholder="Enter note"
                :readonly="flagView"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-card>
</template>

<script setup lang="ts">
import { useStudentFeeStructure } from "@/composables/useStudentFeeStructure";

defineOptions({
  name: "StudentFeeStructure",
});

const props = defineProps<{
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
  itemsOptions,
  formFee,
  addFeeStructure,
  saveFeestructure,
  deleteFeeStructure,
} = useStudentFeeStructure(props, emit);
</script>

<style scoped></style>
