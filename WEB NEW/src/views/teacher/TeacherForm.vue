<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
          <div class="d-flex align-center ga-3 mb-4">
            <v-avatar size="32" color="primary">
              <v-icon color="white" size="20">tabler-user</v-icon>
            </v-avatar>
            <span class="text-h5 font-weight-bold">Personal Detail</span>
          </div>
          <v-card-text class="pa-0">
            <v-row dense>
              <v-col cols="12" md="4">
                <AppTextField
                  v-model="formInput.name"
                  label="Personal Name"
                  density="compact"
                  rounded="lg"
                  hide-details="auto"
                  placeholder="Enter name"
                  :rules="[(v) => !!v || 'Name is required']"
                  :readonly="flagView"
                  prepend-inner-icon="tabler-user"
                />
              </v-col>
              <v-col cols="12" md="auto">
                <label class="v-label text-subtitle-2">Gender </label>
                <v-radio-group
                  inline
                  density="compact"
                  hide-details="auto"
                  v-model="formInput.gender"
                  :readonly="flagView"
                >
                  <v-radio label="Male" value="Male" />
                  <v-radio label="Female" value="Female" />
                  <v-radio label="Other" value="Other" />
                </v-radio-group>
              </v-col>
              <v-col cols="12" md="">
                <AppTextField
                  v-model="age"
                  label="Age"
                  density="compact"
                  readonly
                  hide-details="auto"
                  persistent-placeholder
                />
              </v-col>

              <v-col cols="12" md="4">
                <AppDateTimePicker
                  v-model="formInput.dateOfBirth"
                  label="Date of Birth"
                  placeholder="Select date"
                  density="compact"
                  :readonly="flagView"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-calendar"
                />
              </v-col>

              <v-col cols="12" md="4">
                <AppTextField
                  v-model="formInput.username"
                  label="User Name"
                  density="compact"
                  rounded="lg"
                  hide-details="auto"
                  placeholder="Enter user name"
                  :disabled="flagEdit"
                  :rules="[(v) => !!v || 'User Name is required']"
                  :readonly="flagView"
                  prepend-inner-icon="tabler-user"
                />
              </v-col>
              <v-col cols="12" md="4">
                <AppTextField
                  v-model="formInput.password"
                  label="Password"
                  density="compact"
                  rounded="lg"
                  :type="showPassword ? 'text' : 'password'"
                  hide-details="auto"
                  placeholder="Enter password"
                  :append-inner-icon="
                    showPassword ? 'tabler-eye-off' : 'tabler-eye'
                  "
                  @click:append-inner="showPassword = !showPassword"
                  :readonly="flagView"
                  :rules="[
                    (v) => (flagEdit ? true : !!v || 'Password is required'),
                  ]"
                  prepend-inner-icon="tabler-lock"
                />
              </v-col>
              <v-col cols="0" md="4" />
              <v-col cols="12" md="4">
                <AppTextarea
                  v-model="formInput.address"
                  label="Address"
                  density="compact"
                  placeholder="Enter address"
                  :readonly="flagView"
                  rows="1"
                  auto-grow
                  prepend-inner-icon="tabler-map-pin"
                />
              </v-col>
              <v-col cols="12" md="4">
                <AppTextField
                  v-model="formInput.phone"
                  label="Phone"
                  density="compact"
                  rounded="lg"
                  hide-details="auto"
                  placeholder="Enter phone number"
                  :readonly="flagView"
                  prepend-inner-icon="tabler-phone"
                />
              </v-col>

              <v-col cols="12" md="4">
                <AppTextField
                  v-model="formInput.resumeNo"
                  label="Resume No"
                  density="compact"
                  rounded="lg"
                  hide-details="auto"
                  placeholder="Enter resume number"
                  :rules="[(v) => !!v || 'Resume No is required']"
                  :readonly="flagView"
                  prepend-inner-icon="tabler-file-text"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row justify="center" dense>
      <v-col cols="12">
        <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
          <div class="d-flex align-center ga-3 mb-4">
            <v-avatar size="32" color="purple" variant="tonal">
              <v-icon color="purple" size="18">tabler-clipboard-text</v-icon>
            </v-avatar>
            <span class="text-h5 font-weight-bold">Admission Detail</span>
          </div>
          <v-card-text class="pa-0">
            <v-row dense>
              <v-col cols="12" md="4">
                <AppDateTimePicker
                  v-model="formInput.registerDate"
                  label="Register Date"
                  placeholder="Select date"
                  density="compact"
                  :readonly="flagView"
                  :rules="[requiredValidator]"
                  prepend-inner-icon="tabler-calendar"
                />
              </v-col>
              <v-col cols="12" md="4">
                <AppTextField
                  v-model="formInput.scoreForKids"
                  label="Score for kids"
                  density="compact"
                  rounded="lg"
                  hide-details="auto"
                  placeholder="Enter Score"
                  :rules="[
                    requiredValidator,
                    betweenValidator(formInput.scoreForKids, 1, 9),
                  ]"
                  :readonly="flagView"
                />
              </v-col>
              <v-col cols="12" md="4">
                <AppTextField
                  v-model="formInput.scoreForAdult"
                  label="Score for Adult"
                  density="compact"
                  rounded="lg"
                  hide-details="auto"
                  placeholder="Enter Score"
                  :rules="[
                    requiredValidator,
                    betweenValidator(formInput.scoreForAdult, 1, 9),
                  ]"
                  :readonly="flagView"
                />
              </v-col>

              <v-col cols="12" md="4">
                <AppSelect
                  v-model="formInput.teacherTypeID"
                  label="Teacher type "
                  :items="itemsOptions.teacherType"
                  item-title="name"
                  item-value="id"
                  density="compact"
                  rounded="lg"
                  hide-details="auto"
                  placeholder="Select teacher type"
                  :rules="[(v) => !!v || 'Teacher type is required']"
                  :readonly="flagView"
                />
              </v-col>
              <v-col cols="12" md="4">
                <AppTextField
                  v-model="formInput.teacherNo"
                  label="Teacher No "
                  density="compact"
                  rounded="lg"
                  hide-details="auto"
                  placeholder="Enter register number"
                  :rules="[(v) => !!v || 'Teacher No is required']"
                  :readonly="flagView"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-row align="center">
                  <v-col cols="">
                         <label class="v-label mb-2 text-subtitle-2">
                Upload Photo
              </label>
                    <v-file-input
                      v-model="formInput.photo"
                      variant="outlined"
                      density="compact"
                      rounded="lg"
                      hide-details="auto"
                      :readonly="flagView"
                    />
                  </v-col>
                  <v-col cols="auto" v-if="!flagCreate && formInput.photo">
                    <v-btn color="error" icon @click="deletePhoto">
                      <v-icon>tabler-trash</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" md="8">
                <v-row dense>
                  <v-col cols="12" md="6">
                    <AppSelect
                      v-model="formInput.avaliableForClass"
                      label="Available for class "
                      :items="['Kids', 'Adult', 'Kids & Adult']"
                      density="compact"
                      rounded="lg"
                      hide-details="auto"
                      placeholder="Select class"
                      :readonly="flagView"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <AppTextField
                      v-model="formInput.language"
                      label="Language"
                      density="compact"
                      rounded="lg"
                      hide-details="auto"
                      placeholder="Enter language"
                      :readonly="flagView"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <AppSelect
                      v-model="formInput.status"
                      label="Teacher status "
                      :items="['Active', 'Inactive']"
                      density="compact"
                      rounded="lg"
                      hide-details="auto"
                      placeholder="Select class"
                      :rules="[(v) => !!v || 'Status is required']"
                      :readonly="flagView"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <v-col cols="12" md="4">
                <AppTextarea
                  v-model="formInput.note"
                  label="Interview note details"
                  density="compact"
                  rounded="lg"
                  hide-details="auto"
                  placeholder="Enter note details"
                  :readonly="flagView"
                  rows="1"
                  auto-grow
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <TeacherFeeStructure
      :flag-view="flagView"
      :flag-create="flagCreate"
      @input="formFeeStructure = $event"
      @ref-form="(ref) => (refFormFee = ref)"
    />

    <TeacherScoreStructure
      :flag-view="flagView"
      :flag-create="flagCreate"
      @input="formScoreStructure = $event"
      @ref-form="(ref) => (refFormScore = ref)"
    />
  </div>
</template>

<script setup lang="ts">
import TeacherFeeStructure from "./TeacherFeeStructure.vue";
import TeacherScoreStructure from "./TeacherScoreStructure.vue";
import { useTeacherForm } from "@/composables/useTeacherForm";

defineOptions({
  name: "TeacherForm",
});

const props = defineProps({
  editItems: {
    type: Object,
    default: () => ({}),
  },
  flagEdit: {
    type: Boolean,
    default: false,
  },
  flagView: {
    type: Boolean,
    default: false,
  },
  flagCreate: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "input",
  "refFormFee",
  "dataFormFee",
  "refFormScore",
  "dataFormScore",
]);

const {
  pickerDOB,
  menuRegisterDateOpen,
  isSelectAll,
  age,
  showPassword,
  formInput,
  itemsOptions,
  formFeeStructure,
  refFormFee,
  formScoreStructure,
  refFormScore,
  fetchOption,
  deletePhoto,
} = useTeacherForm(props, emit);
</script>

<style scoped></style>
