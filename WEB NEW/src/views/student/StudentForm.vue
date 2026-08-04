<template>
  <div>
    <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
      <div class="d-flex align-center mb-4">
        <v-avatar size="32" color="primary" class="mr-3">
          <v-icon color="white" size="20">tabler-user</v-icon>
        </v-avatar>
        <span class="text-h5 font-weight-bold">Personal Detail</span>
      </div>
      <v-row dense> 
        <v-col cols="12" md="4">
          <AppTextField
            v-model="formInput.name"
            label="Student Name"
            placeholder="Enter Student name"
            density="compact"
            :readonly="flagView"
            :rules="[requiredValidator]"
            prepend-inner-icon="tabler-user"
          />
        </v-col>
        <v-col cols="12" md="auto">
          <label class="v-label text-subtitle-2"
            >Gender
          </label>
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
          />
        </v-col>

        <v-col cols="12" md="4">
          <AppDateTimePicker
            v-model="formInput.dateOfBirth"
            label="Date of Birth"
            density="compact"
            placeholder="Select date"
            :readonly="flagView"
            :rules="[requiredValidator]"
            prepend-inner-icon="tabler-calendar"
          />
        </v-col>

        <v-col cols="12" md="4">
          <AppTextarea
            v-model="formInput.address"
            label="Address"
            hide-details="auto"
            placeholder="Enter address"
            rows="1"
            density="compact"
            auto-grow
            :readonly="flagView"
            prepend-inner-icon="tabler-map-pin"
          />
        </v-col>
        <v-col cols="12" md="4">
          <AppTextField
            v-model="formInput.phone"
            label="Phone"
            rounded="lg"
            density="compact"
            hide-details="auto"
            placeholder="Enter phone number"
            :readonly="flagView"
            prepend-inner-icon="tabler-phone"
          />
        </v-col>

        <v-col cols="12" md="4">
          <AppTextField
            v-model="formInput.schoolName"
            label="School name"
            rounded="lg"
            density="compact"
            hide-details="auto"
            placeholder="Enter school name"
            :rules="[(v) => !!v || 'School name is required']"
            :readonly="flagView"
            prepend-inner-icon="tabler-school"
          />
        </v-col>
      </v-row>
    </v-card>

    <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
      <div class="d-flex align-center mb-4">
        <v-avatar size="32" color="info" class="mr-3">
          <v-icon color="white" size="20">tabler-lock</v-icon>
        </v-avatar>
        <span class="text-h5 font-weight-bold">Account Detail</span>
      </div>
      <v-row>
        <v-col cols="12" md="4">
          <AppTextField
            v-model="formInput.username"
            label="Username"
            rounded="lg"
            type="email"
            :filled="flagEdit"
            density="compact"
            hide-details="auto"
            placeholder="Enter username"
            persistent-hint
            :disabled="flagEdit || flagView"
            :rules="[
              (v) => !!v || 'Username is required'
            ]"
            :readonly="flagView"
            prepend-inner-icon="tabler-user"
          />
        </v-col>
        <v-col cols="12" md="4">
          <AppTextField
            v-model="formInput.password"
            label="Password"
            rounded="lg"
            density="compact"
            :type="showPassword ? 'text' : 'password'"
            hide-details="auto"
            placeholder="Enter password"
            :append-inner-icon="showPassword ? 'tabler-eye-off' : 'tabler-eye'"
            @click:append-inner="showPassword = !showPassword"
            :readonly="flagView"
            :rules="[(v) => (flagEdit ? true : !!v || 'Password is required')]"
            prepend-inner-icon="tabler-lock"
          />
        </v-col>
        <v-col cols="12" md="4">
          <div class="d-flex justify-space-between align-end">
            <label class="v-label mb-2 text-subtitle-2">
              Account exit date
            </label>
            <v-checkbox
              v-model="notExpired"
              :readonly="flagView"
              label="not yet"
              density="compact"
              hide-details="auto"
              class="my-0 py-0"
              @input="() => {
                if (notExpired) {
                  formInput.expireDate = null;
                }
              }"
            />
          </div>
          <AppDateTimePicker
            v-model="formInput.expireDate"
            label="Expire Date"
            placeholder="Select date"
            :readonly="flagView"
            density="compact"
            :rules="notExpired ? [] : [requiredValidator]"
            prepend-inner-icon="tabler-calendar"
          />
        </v-col>
      </v-row>
    </v-card>

    <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
      <div class="d-flex align-center mb-4">
        <v-avatar size="32" color="success" class="mr-3">
          <v-icon color="white" size="20">tabler-clipboard-text</v-icon>
        </v-avatar>
        <span class="text-h5 font-weight-bold">Admission Detail</span>
      </div>
      <v-row>
        <v-col cols="12" md="4">
          <AppDateTimePicker
            v-model="formInput.addmissionDate"
            label="Addmission Date"
            placeholder="Select date"
            density="compact"
            :readonly="flagView"
            :rules="[requiredValidator]"
            prepend-inner-icon="tabler-calendar"
          />
        </v-col>
        <v-col cols="12" md="4">
          <AppSelect
            v-model="formInput.studentTypeID"
            label="Student type"
            :items="itemsOptions.studentType"
            item-title="name"
            item-value="id"
            density="compact"
            rounded="lg"
            hide-details="auto"
            placeholder="Select class"
            :rules="[(v) => !!v || 'Student type is required']"
            :readonly="flagView"
          />
        </v-col>
        <v-col cols="12" md="4">
          <AppSelect
            v-model="formInput.classTypeID"
            label="Class Type"
            :items="itemsOptions.classType"
            item-title="name"
            item-value="id"
            density="compact"
            rounded="lg"
            hide-details="auto"
            placeholder="Select class"
            :rules="[(v) => !!v || 'Class type is required']"
            :readonly="flagView"
          />
        </v-col>

        <v-col cols="12" md="4">
          <AppDateTimePicker
            v-model="formInput.endClassDate"
            label="End Class Date"
            placeholder="Select date"
            density="compact"
            :readonly="flagView"
            :rules="[requiredValidator]"
            prepend-inner-icon="tabler-calendar"
          />
        </v-col>
        <v-col cols="12" md="4">
          <AppTextField
            v-model="formInput.addmissionNo"
            label="Admission No."
            density="compact"
            rounded="lg"
            hide-details="auto"
            placeholder="Enter addmission number"
            :rules="[(v) => !!v || 'Addmission number is required']"
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
                label="Choose a file..."
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

        <v-col cols="12" md="4">
          <v-col cols="12">
            <AppSelect
              v-model="formInput.status"
              label="Student Status"
              :items="['Active', 'Inactive']"
              density="compact"
              rounded="lg"
              hide-details="auto"
              placeholder="Select class"
              :rules="[(v) => !!v || 'Status is required']"
              :readonly="flagView"
            />
          </v-col>
          <v-col cols="12">
            <AppSelect
              v-model="formInput.branchID"
              label="Branch"
              :items="itemsOptions.branch"
              density="compact"
              rounded="lg"
              item-title="name"
              item-value="id"
              hide-details="auto"
              placeholder="Select branch"
              :readonly="flagView"
            />
          </v-col>
        </v-col>

        <v-col cols="12" md="4">
          <AppTextarea
            v-model="formInput.note"
            label="extra note details"
            density="compact"
            rounded="lg"
            hide-details="auto"
            placeholder="Enter note details"
            :readonly="flagView"
          />
        </v-col>
      </v-row>
    </v-card>

    <StudentFeeStructure
      v-show="userInfo?.role !== 'user' || feePermission?.view"
      :flag-view="flagView"
      :flag-create="flagCreate"
      @input="formFeeStructure = $event"
      @ref-form="(ref) => (refFormFee = ref)"
    />
    <StudentScoreStructure
      v-show="userInfo?.role !== 'user' || pointPermission?.view"
      :flag-create="flagCreate"
      :flag-view="flagView"
      @input="formScoreStructure = $event"
      @ref-form="(ref) => (refFormScore = ref)"
    />
  </div>
</template>

<script setup lang="ts">
import StudentFeeStructure from "./StudentFeeStructure.vue";
import StudentScoreStructure from "./StudentScoreStructure.vue";
import { useStudentForm } from "@/composables/useStudentForm";

defineOptions({
  name: "StudentForm",
});

const props = withDefaults(
  defineProps<{
    editItems?: Record<string, unknown>;
    flagEdit?: boolean;
    flagView?: boolean;
    flagCreate?: boolean;
  }>(),
  {
    editItems: () => ({}),
    flagEdit: false,
    flagView: false,
    flagCreate: false,
  },
);

const emit = defineEmits<{
  input: [value: unknown];
  refFormFee: [value: unknown];
  dataFormFee: [value: unknown];
  refFormScore: [value: unknown];
  dataFormScore: [value: unknown];
}>();

const {
  pickerDOB,
  menuExpiredOpen,
  menuAddmissionOpen,
  menuEndClassOpen,
  age,
  showPassword,
  notExpired,
  formInput,
  itemsOptions,
  formFeeStructure,
  refFormFee,
  formScoreStructure,
  refFormScore,
  pointPermission,
  feePermission,
  userInfo,
  deletePhoto,
} = useStudentForm(props, emit);
</script>

<style scoped></style>
