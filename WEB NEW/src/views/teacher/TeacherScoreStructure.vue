<template>
  <v-row justify="center" dense>
    <v-col cols="12">
      <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="d-flex align-center ga-3">
            <v-avatar size="32" color="warning" variant="tonal">
              <v-icon color="warning" size="18">tabler-star</v-icon>
            </v-avatar>
            <span class="text-h5 font-weight-bold"
              >Teacher Score Structure</span
            >
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
        <v-card-text class="pa-0">
          <v-card
            rounded="lg"
            variant="flat"
            class="mb-4 pa-2"
            v-for="(item, inx) in itemsScoreStruture"
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
                  @click="saveScorestructure(item.id, item, inx)"
                  v-show="!flagCreate"
                  v-if="userInfo?.role !== 'user' || permission?.edit"
                >
                  <v-icon>tabler-device-floppy</v-icon>
                </v-btn>
                <v-btn
                  color="error"
                  dense
                  icon
                  variant="text"
                  @click="deleteScoreStructure(item.id, inx)"
                  v-show="!flagView"
                  v-if="userInfo?.role !== 'user' || permission?.delete"
                >
                  <v-icon>tabler-trash</v-icon>
                </v-btn>
              </div>
              <v-form ref="formPoint" lazy-validation>
                <v-row dense>
                  <v-col cols="12" md="4">
                    <AppDateTimePicker
                      v-model="item.updateDate"
                      label="Update score Date"
                      density="compact"
                      placeholder="Select date"
                      :readonly="flagView"
                      :rules="[requiredValidator]"
                      prepend-inner-icon="tabler-calendar"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-row>
                      <v-col cols="12" md="">
                        <AppTextField
                          v-model="item.totalPoint"
                          label="Total score"
                          density="compact"
                          rounded="lg"
                          hide-details="auto"
                          background-color="surface"
                          :readonly="flagView"
                        />
                      </v-col>

                      <v-col cols="12" md="">
                        <AppTextField
                          v-model="item.pointUp"
                          label="Score up"
                          density="compact"
                          rounded="lg"
                          hide-details="auto"
                          background-color="surface"
                          :readonly="flagView"
                        />
                      </v-col>
                      <v-col cols="12" md="">
                        <AppTextField
                          v-model="item.pointDown"
                          label="Score down"
                          density="compact"
                          rounded="lg"
                          hide-details="auto"
                          background-color="surface"
                          :readonly="flagView"
                        />
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="12" md="4">
                    <AppTextField
                      v-model="item.pointAfterUpdate"
                      label="Score after update"
                      density="compact"
                      rounded="lg"
                      hide-details="auto"
                      background-color="surface"
                      :readonly="flagView"
                    />
                  </v-col>
                  <v-col cols="12" md="8">
                    <AppTextField
                      v-model="item.resonalForUpdate"
                      label="Resonal for update"
                      density="compact"
                      rounded="lg"
                      hide-details="auto"
                      background-color="surface"
                      :readonly="flagView"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <AppTextField
                      :value="userInfo?.username"
                      label="admin"
                      density="compact"
                      rounded="lg"
                      hide-details="auto"
                      readonly
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
import { useTeacherScoreStructure } from "@/composables/useTeacherScoreStructure";

defineOptions({
  name: "TeacherScoreStructure",
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
  itemsScoreStruture,
  formPoint,
  addFeeStructure,
  saveScorestructure,
  deleteScoreStructure,
} = useTeacherScoreStructure(emit);
</script>

<style scoped></style>
