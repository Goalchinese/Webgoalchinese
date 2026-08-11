<template>
  <div>
    <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
      <div class="d-flex align-center mb-4">
        <v-avatar size="32" color="primary" class="mr-3">
          <v-icon color="white" size="20">tabler-book-2</v-icon>
        </v-avatar>
        <span class="text-h5 font-weight-bold">Class Detail</span>
      </div>
      <v-row dense>
        <v-col cols="12" md="4">
          <AppTextField
            v-model="formInput.name"
            label="Class Name"
            density="compact"
            rounded="lg"
            :readonly="flagView"
            hide-details="auto"
            placeholder="Enter Class name"
            :rules="[(v) => !!v || 'Class name is required']"
          />
        </v-col>

        <v-col cols="12" md="2">
          <AppTextField
            v-model="formInput.no"
            label="Class No"
            density="compact"
            rounded="lg"
            :readonly="flagView"
            hide-details="auto"
            placeholder="Enter Class no"
            :rules="[(v) => !!v || 'Class no is required']"
          />
        </v-col>

        <v-col cols="12" md="2">
          <AppSelect
            v-model="formInput.branchID"
            label="Branch"
            :items="itemsOptions.branch"
            :readonly="flagView"
            density="compact"
            rounded="lg"
            item-title="name"
            item-value="id"
            hide-details="auto"
            placeholder="Select branch"
            :rules="[(v) => !!v || 'Branch is required']"
          />
        </v-col>

        <v-col cols="12" md="4">
          <AppSelect
            v-model="formInput.classTypeID"
            label="Class Type"
            :items="itemsOptions.classType"
            :readonly="flagView"
            density="compact"
            rounded="lg"
            item-title="name"
            item-value="id"
            hide-details="auto"
            placeholder="Select class type"
            :rules="[(v) => !!v || 'Class type is required']"
          />
        </v-col>

        <v-col cols="12" md="3">
          <AppTextField
            v-model.number="formInput.numberOfStudent"
            label="Number Of Student" 
            :readonly="flagView"
            density="compact"
            rounded="lg"
            hide-details="auto"
            placeholder="Enter number of student"
          :rules="[requiredValidator, integerValidator]"
          />
        </v-col>

        <v-col cols="12" md="3">
          <AppTextField
            v-model="formInput.studentFee"
            label="Study fee/person"
            :readonly="flagView"
            density="compact"
            rounded="lg"
            hide-details="auto"
            placeholder="Enter fee"
            :rules="[requiredValidator, integerValidator]"
          />
        </v-col>

        <v-col cols="12" md="3">
          <AppTextField
            v-model="formInput.discount"
            label="Discount"
            :readonly="flagView"
            density="compact"
            rounded="lg"
            hide-details="auto"
            placeholder="Enter discount"
          />
        </v-col>

        <v-col cols="12" md="3">
          <AppTextField
            v-model="formInput.discountNote"
            label="Discount Note"
            :readonly="flagView"
            density="compact"
            rounded="lg"
            hide-details="auto"
            placeholder="Enter discount note"
          />
        </v-col>

        <v-col cols="12" md="4">
          <AppTextField
            v-model="formInput.totalFeePerClass"
            label="Total fee per class"
            :readonly="flagView"
            density="compact"
            rounded="lg"
            hide-details="auto"
            placeholder="Enter total fee"
            :rules="[requiredValidator, integerValidator]"
          />
        </v-col>

        <v-col cols="12" md="3">
          <AppAutocomplete
            v-model="formInput.teacherID"
            label="Teacher Name"
            :items="itemsOptions.teacher"
            :readonly="flagView"
            :loading="isLoadingTeachers"
            item-title="name"
            item-value="id"
            density="compact"
            rounded="lg"
            hide-details="auto"
            placeholder="Select teacher"
            :rules="[(v) => !!v || 'Teacher is required']"
          />
        </v-col>

        <v-col cols="12" md="5">
          <AppAutocomplete
            v-model="selectedStudent"
            label="Student Name"
            :readonly="flagView"
            :items="itemsOptions.student"
            :loading="isLoadingStudents"
            item-title="name"
            item-value="id"
            density="compact"
            rounded="lg"
            hide-details="auto"
            placeholder="Select student"
            multiple
            :rules="[
              (v) => !!v || 'Student is required',
              (v) => v.length > 0 || 'Student is required',
            ]"
          />
        </v-col>
        <v-col cols="12" md="8">
          <v-row>
            <v-col cols="12" md="6">
              <AppSelect
                v-model="formInput.status"
                label="Class Status"
                :readonly="flagView"
                :items="['Active', 'Inactive']"
                density="compact"
                rounded="lg"
                hide-details="auto"
                placeholder="Select status"
              />
            </v-col>
            <v-col cols="12" md="6">
              <AppSelect
                v-model="formInput.materialTypeID"
                label="Material Type"
                :items="itemsOptions.materialType"
                :readonly="flagView"
                item-title="name"
                item-value="id"
                density="compact"
                rounded="lg"
                hide-details="auto"
                placeholder="Select material type"
                :rules="[(v) => !!v || 'Material type is required']"
              />
            </v-col>
            <v-col cols="12" md="4">
              <AppTextField
                v-model="formInput.registeredTimes"
                label="Number of time registered (times)"
                :readonly="flagView"
                type="number"
                density="compact"
                rounded="lg"
                hide-details="auto"
                :rules="[(v) => !!v || 'Registered time is required']"
              />
            </v-col>
            <v-col cols="12" md="4">
              <AppTextField
                v-model="formInput.teacherLeave"
                label="Teacher can leave (times)"
                :readonly="flagView"
                type="number"
                density="compact"
                rounded="lg"
                hide-details="auto"
                :rules="[(v) => !!v || 'Teacher leave is required']"
              />
            </v-col>
            <v-col cols="12" md="4">
              <AppTextField
                v-model="formInput.studentLeave"
                label="Student can leave (times)"
                :readonly="flagView"
                type="number"
                density="compact"
                rounded="lg"
                hide-details="auto"
                :rules="[(v) => !!v || 'Student leave is required']"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" md="4">
          <AppTextarea
            v-model="formInput.note"
            label="Note"
            :readonly="flagView"
            density="compact"
            rounded="lg"
            hide-details="auto"
            placeholder="Enter note details"
          />
        </v-col>
      </v-row>
    </v-card>

    <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
      <div class="d-flex align-center mb-4">
        <v-avatar size="32" color="info" class="mr-3">
          <v-icon color="white" size="20">tabler-calendar-time</v-icon>
        </v-avatar>
        <span class="text-h5 font-weight-bold">Schedule</span>
      </div>
      <v-row>
        <v-col cols="12" md="4">
          <AppDateTimePicker
            v-model="formInput.startDate"
            label="Start date"
            density="compact"
            placeholder="Select date"
            :readonly="flagView"
            :rules="[requiredValidator]"
            prepend-inner-icon="tabler-calendar"
          />
        </v-col>
        <v-col cols="12" md="4">
          <AppDateTimePicker
            v-model="formInput.endDate"
            label="End date"
            density="compact"
            placeholder="Select date"
            :readonly="flagView"
            :rules="[requiredValidator]"
            prepend-inner-icon="tabler-calendar"
          />
        </v-col>
        <v-col cols="12" md="4">
          <AppTextField
            v-model="formInput.studyTimePerTime"
            label="Study time per time"
            :readonly="flagView"
            type="number"
            density="compact"
            rounded="lg"
            hide-details="auto"
            suffix="Mins"
            :rules="[(v) => !!v || 'Study time is required']"
          />
        </v-col>
      </v-row>

      <v-row
        v-for="(item, i) in itemsTimes"
        :key="i"
        class="align-center"
        dense
      >
        <v-col cols="2" class="d-flex align-center">
          <label class="v-label text-subtitle-2" v-if="i == 0">
            Start time :
          </label>
        </v-col>
        <v-col cols="12" md="2">
          <v-checkbox
            v-model="item.checked"
            :label="item.text"
            :readonly="flagView"
            hide-details="auto"
            density="compact"
            :rules="[
              (v) =>
                itemsTimes.every((it) => it.checked === false)
                  ? !!v || 'Day is required'
                  : true,
            ]"
          ></v-checkbox>
        </v-col>
        <v-col cols="12" md="2">
          <AppDateTimePicker
            v-model="item.startTime"
            label="Time Start"
            density="compact"
            :disabled="!item.checked || flagView"
            placeholder="Select time"
            :config="{
              enableTime: true,
              noCalendar: true,
              dateFormat: 'H:i',
              time_24hr: true,
            }"
          />
        </v-col>

        <v-col cols="12" md="2">
          <AppDateTimePicker
            v-model="item.endTime"
            label="Time End"
            density="compact"
            placeholder="Select time"
            :disabled="!item.checked || flagView"
            :config="{
              enableTime: true,
              noCalendar: true,
              dateFormat: 'H:i',
              time_24hr: true,
            }"
          />
        </v-col>
        <v-col cols="" class="d-flex align-center">
          <AppTextField
            v-model="item.note"
            label="Note"
            :disabled="!item.checked"
            :readonly="flagView"
            density="compact"
            rounded="lg"
            hide-details="auto"
          />
        </v-col>
      </v-row>
    </v-card>

    <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
      <div class="d-flex align-center mb-4">
        <v-avatar size="32" color="success" class="mr-3">
          <v-icon color="white" size="20">tabler-external-link</v-icon>
        </v-avatar>
        <span class="text-h5 font-weight-bold">Study Platform</span>
      </div>
      <v-row>
        <v-col cols="12" md="3">
          <AppTextField
            v-model="formInput.studyPlatform"
            label="Study platform"
            :readonly="flagView"
            density="compact"
            rounded="lg"
            hide-details="auto"
            placeholder="Enter platform"
            :rules="[(v) => !!v || 'Platform is required']"
          />
        </v-col>
        <v-col cols="12" md="9">
          <AppTextField
            v-model="formInput.link"
            label="Link"
            :readonly="flagView"
            density="compact"
            rounded="lg"
            hide-details="auto"
            placeholder="Enter link"
            :rules="[(v) => !!v || 'Link is required']"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-row>
            <v-col cols="12">
              <AppTextField
                :value="userInfo?.username"
                label="Admin name"
                readonly
                density="compact"
                rounded="lg"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12">
              <label class="v-label mb-2 text-subtitle-2">
                Check list
              </label>

              <v-checkbox
                v-for="(item, i) in checkList"
                :key="i"
                v-model="selectedCheckList"
                :readonly="flagView"
                :label="item"
                :value="i + 1"
                hide-details="auto"
                density="compact"
                :rules="[
                  (v) => !!v || 'Check list is required',
                  (v) => v.length > 0 || 'Check list is required',
                ]"
              ></v-checkbox>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="12" md="9">
          <AppTextarea
            v-model="formInput.note"
            label="Note"
            :readonly="flagView"
            density="compact"
            rounded="lg"
            hide-details="auto"
            placeholder="Enter note"
            rows="9"
          />
        </v-col>
      </v-row>
    </v-card>

    <v-card
      v-if="
        userInfo?.role !== 'user' ||
        feePermission?.create ||
        (flagEdit && feePermission?.edit)
      "
      rounded="lg"
      elevation="1"
      class="pa-4 mb-4"
    >
      <div class="d-flex align-center mb-4">
        <v-avatar size="32" color="success-lighten-4" class="mr-3">
          <v-icon color="success" size="18">tabler-cash</v-icon>
        </v-avatar>
        <span class="text-h5 font-weight-bold">Teacher fee for the class</span>
      </div>
      <v-row dense>
        <v-col cols="12" md="4">
          <AppTextField
            v-model="formInput.name"
            label="Class Name"
            readonly
            density="compact"
            rounded="lg"
            hide-details="auto"
          />
        </v-col>

        <v-col cols="12" md="2">
          <AppTextField
            v-model="formInput.no"
            label="Class No"
            readonly
            density="compact"
            rounded="lg"
            hide-details="auto"
          />
        </v-col>

        <v-col cols="12" md="2">
          <AppSelect
            v-model="formInput.branchID"
            label="Branch"
            :items="itemsOptions.branch"
            item-title="name"
            item-value="id"
            readonly
            density="compact"
            rounded="lg"
            hide-details="auto"
          />
        </v-col>

        <v-col cols="12" md="4">
          <AppSelect
            v-model="formInput.classTypeID"
            label="Class Type"
            :items="itemsOptions.classType"
            item-title="name"
            item-value="id"
            readonly
            density="compact"
            rounded="lg"
            hide-details="auto"
          />
        </v-col>

        <v-col cols="12" md="3">
          <AppSelect
            v-model="formInput.teacherID"
            label="Teacher Name"
            :items="itemsOptions.teacher"
            item-title="name"
            item-value="id"
            readonly
            density="compact"
            rounded="lg"
            hide-details="auto"
          />
        </v-col>

        <v-col cols="12" md="5">
          <AppSelect
            v-model="selectedStudent"
            label="Student Name"
            :items="itemsOptions.student"
            item-title="name"
            item-value="id"
            readonly
            density="compact"
            rounded="lg"
            hide-details="auto"
            multiple
          />
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12" md="6">
          <v-list>
            <v-list-item v-for="(status, i) in statusList" :key="i">
              <v-row>
                <v-col cols="6" class="d-flex align-center">
                  <v-badge class="my-0" inline :color="status.color"></v-badge>
                  <span>{{ status.text }}</span>
                </v-col>
                <v-col cols="4">
                  <AppTextField
                    v-model="formInput[status.value]"
                    :readonly="flagView"
                    type="number"
                    density="compact"
                    rounded="lg"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>
            </v-list-item>
          </v-list>
        </v-col>
        <v-col cols="4">
          <AppSelect
            v-model="formInput.currencyID"
            label="Currency"
            :items="itemsOptions.currency"
            :readonly="flagView"
            item-title="name"
            item-value="id"
            density="compact"
            rounded="lg"
            hide-details="auto"
          />
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import { useClassForm, type ClassFormItem } from "@/composables/useClassForm";

defineOptions({
  name: "FormClass",
});

const props = defineProps({
  editItems: {
    type: Object as () => ClassFormItem,
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
});

const emit = defineEmits(["input"]);

const { flagEdit, flagView } = toRefs(props);

const {
  formInput,
  selectedCheckList,
  isLoadingTeachers,
  isLoadingStudents,
  checkList,
  selectedStudent,
  statusList,
  itemsTimes,
  itemsOptions,
  feePermission,
  userInfo,
} = useClassForm(props, emit);

watch(
  () => [formInput.numberOfStudent, formInput.studentFee, formInput.discount],
  () => {
    const numberOfStudent = Number(formInput.numberOfStudent) || 0;
    const studentFee = Number(formInput.studentFee) || 0;
    const discount = Number(formInput.discount) || 0;

    formInput.totalFeePerClass =
      numberOfStudent * studentFee - discount >= 0
        ? numberOfStudent * studentFee - discount
        : 0;
  },
  { immediate: true },
);
</script>

<style scoped></style>
