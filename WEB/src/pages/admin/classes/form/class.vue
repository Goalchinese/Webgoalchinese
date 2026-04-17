<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-card outlined>
          <v-card-title primary-title> Class Detail </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <label class="v-label mb-2 text-subtitle-2">
                  <span class="red--text mr-2">*</span>Class Name :
                </label>
                <v-text-field
                  v-model="formInput.name"
                  dense
                  outlined
                  single-line
                  :readonly="flagView"
                  hide-details="auto"
                  placeholder="Enter Class name"
                  :rules="[(v) => !!v || 'Class name is required']"
                />
              </v-col>

              <v-col cols="12" md="2">
                <label class="v-label mb-2 text-subtitle-2"
                  ><span class="red--text mr-2">*</span>Class No :
                </label>
                <v-text-field
                  v-model="formInput.no"
                  dense
                  outlined
                  :readonly="flagView"
                  single-line
                  hide-details="auto"
                  placeholder="Enter Class no"
                  :rules="[(v) => !!v || 'Class no is required']"
                />
              </v-col>

              <v-col cols="12" md="2">
                <label class="v-label mb-2 text-subtitle-2"
                  ><span class="red--text mr-2">*</span>Branch :
                </label>
                <v-select
                  v-model="formInput.branchID"
                  :items="itemsOptions.branch"
                  :readonly="flagView"
                  dense
                  outlined
                  item-text="name"
                  item-value="id"
                  single-line
                  hide-details="auto"
                  placeholder="Select branch"
                  :rules="[(v) => !!v || 'Branch is required']"
                />
              </v-col>

              <v-col cols="12" md="4">
                <label class="v-label mb-2 text-subtitle-2"
                  ><span class="red--text mr-2">*</span>Class Type :
                </label>
                <v-select
                  v-model="formInput.classTypeID"
                  :items="itemsOptions.classType"
                  :readonly="flagView"
                  dense
                  item-text="name"
                  item-value="id"
                  outlined
                  single-line
                  hide-details="auto"
                  placeholder="Select class type"
                  :rules="[(v) => !!v || 'Class type is required']"
                />
              </v-col>

              <v-col cols="12" md="3">
                <label class="v-label mb-2 text-subtitle-2">
                  <span class="red--text mr-2">*</span>Number Of Student :
                </label>
                <v-text-field
                  v-model.number="formInput.numberOfStudent"
                  :readonly="flagView"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                  placeholder="Enter number of student"
                  :rules="[
                    (v) => !!v || 'Number of student is required',
                    (v) => /^[0-9]*$/.test(v) || 'Number is invalid',
                  ]"
                />
              </v-col>

              <v-col cols="12" md="3">
                <label class="v-label mb-2 text-subtitle-2">
                  <span class="red--text mr-2">*</span>Study fee/person :
                </label>
                <v-text-field
                  v-model="formInput.studentFee"
                  :readonly="flagView"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                  placeholder="Enter fee"
                  :rules="[
                    (v) => !!v || 'Fee is required',
                    (v) => /^[0-9]*$/.test(v) || 'Number is invalid',
                  ]"
                />
              </v-col>

              <v-col cols="12" md="3">
                <label class="v-label mb-2 text-subtitle-2">Discount : </label>
                <v-text-field
                  v-model="formInput.discount"
                  :readonly="flagView"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                  placeholder="Enter discount"
                />
              </v-col>

              <v-col cols="12" md="3">
                <label class="v-label mb-2 text-subtitle-2">
                  Discount Note :
                </label>
                <v-text-field
                  v-model="formInput.discountNote"
                  :readonly="flagView"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                  placeholder="Enter discount note"
                />
              </v-col>

              <v-col cols="12" md="4">
                <label class="v-label mb-2 text-subtitle-2">
                  <span class="red--text mr-2">*</span>Total fee per class :
                </label>
                <v-text-field
                  v-model="formInput.totalFeePerClass"
                  :readonly="flagView"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                  placeholder="Enter total fee"
                  :rules="[(v) => !!v || 'Total fee is required']"
                />
              </v-col>

              <v-col cols="12" md="3">
                <label class="v-label mb-2 text-subtitle-2"
                  ><span class="red--text mr-2">*</span>Teacher Name :
                </label>
                <v-autocomplete
                  v-model="formInput.teacherID"
                  :items="itemsOptions.teacher"
                  :readonly="flagView"
                  :loading="isLoadingTeachers"
                  item-text="name"
                  item-value="id"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                  placeholder="Select teacher"
                  :rules="[(v) => !!v || 'Teacher is required']"
                />
              </v-col>

              <v-col cols="12" md="5">
                <label class="v-label mb-2 text-subtitle-2"
                  ><span class="red--text mr-2">*</span>Student Name :
                </label>
                <v-autocomplete
                  v-model="selectedStudent"
                  :readonly="flagView"
                  :items="itemsOptions.student"
                  :loading="isLoadingStudents"
                  dense
                  item-text="name"
                  item-value="id"
                  outlined
                  single-line
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
                    <label class="v-label mb-2 text-subtitle-2"
                      ><span class="red--text mr-2">*</span>Class Status :
                    </label>
                    <v-select
                      v-model="formInput.status"
                      :readonly="flagView"
                      dense
                      :items="['Active', 'Inactive']"
                      outlined
                      single-line
                      hide-details="auto"
                      placeholder="Select status"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <label class="v-label mb-2 text-subtitle-2">
                      <span class="red--text mr-2">*</span>Material Type :
                    </label>
                    <v-select
                      v-model="formInput.materialTypeID"
                      :items="itemsOptions.materialType"
                      :readonly="flagView"
                      dense
                      item-text="name"
                      item-value="id"
                      outlined
                      single-line
                      hide-details="auto"
                      placeholder="Select material type"
                      :rules="[(v) => !!v || 'Material type is required']"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <label class="v-label mb-2 text-subtitle-2">
                      <span class="red--text mr-1">*</span>Number of time
                      registered (times):
                    </label>
                    <v-text-field
                      v-model="formInput.registeredTimes"
                      :readonly="flagView"
                      dense
                      type="number"
                      outlined
                      hide-details="auto"
                      :rules="[(v) => !!v || 'Registered time is required']"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <label class="v-label mb-2 text-subtitle-2">
                      <span class="red--text mr-2">*</span>Teacher can leave
                      (times) :
                    </label>

                    <v-text-field
                      v-model="formInput.teacherLeave"
                      :readonly="flagView"
                      dense
                      type="number"
                      outlined
                      hide-details="auto"
                      :rules="[(v) => !!v || 'Teacher leave is required']"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <label class="v-label mb-2 text-subtitle-2">
                      <span class="red--text mr-2">*</span> Student can leave
                      (times) :
                    </label>
                    <v-text-field
                      v-model="formInput.studentLeave"
                      :readonly="flagView"
                      dense
                      type="number"
                      outlined
                      hide-details="auto"
                      :rules="[(v) => !!v || 'Student leave is required']"
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" md="4">
                <label class="v-label mb-2 text-subtitle-2"> Note : </label>
                <v-textarea
                  v-model="formInput.note"
                  :readonly="flagView"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                  placeholder="Enter note details"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="4">
                <label class="v-label mb-2 text-subtitle-2">
                  <span class="red--text mr-2">*</span>Start date :
                </label>
                <v-menu
                  ref="refStartDate"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="formInput.startDate"
                      label="Select date"
                      append-icon="mdi-calendar"
                      dense
                      outlined
                      single-line
                      :disabled="flagView"
                      hide-details="auto"
                      readonly
                      :rules="[(v) => !!v || 'Start date is required']"
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="formInput.startDate"
                    @change="$refs.refStartDate.save(formInput.startDate)"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" md="4">
                <label class="v-label mb-2 text-subtitle-2"> End date : </label>
                <v-menu
                  ref="refEndDate"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="formInput.endDate"
                      label="Select date"
                      append-icon="mdi-calendar"
                      dense
                      outlined
                      single-line
                      :disabled="flagView"
                      hide-details="auto"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="formInput.endDate"
                    :min="formInput.startDate"
                    @change="$refs.refEndDate.save(formInput.endDate)"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" md="4">
                <label class="v-label mb-2 text-subtitle-2">
                  <span class="red--text mr-2">*</span> Study time per time :
                </label>
                <v-text-field
                  v-model="formInput.studyTimePerTime"
                  :readonly="flagView"
                  dense
                  type="number"
                  outlined
                  single-line
                  hide-details="auto"
                  suffix="Mins"
                  :rules="[(v) => !!v || 'Study time is required']"
                />
              </v-col>
            </v-row>

            <v-row v-for="(item, i) in itemsTimes" :key="i">
              <v-col cols="2" class="d-flex align-center">
                <label class="v-label text-subtitle-2" v-if="i == 0">
                  <span class="red--text mr-2">*</span>Start time :
                </label>
              </v-col>
              <v-col cols="12" md="2">
                <v-checkbox
                  v-model="item.checked"
                  :label="item.text"
                  :value="item.checked"
                  :readonly="flagView"
                  hide-details="auto"
                  class="mt-1"
                  :rules="[
                    (v) =>
                      itemsTimes.every((it) => it.checked === false)
                        ? !!v || 'Day is required'
                        : true,
                  ]"
                ></v-checkbox>
              </v-col>
              <v-col cols="12" md="2">
                <v-menu
                  ref="timeStartRef"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="item.startTime"
                      label="--:--"
                      readonly
                      dense
                      outlined
                      single-line
                      :disabled="!item.checked || flagView"
                      :filled="!item.checked"
                      hide-details="auto"
                      v-bind="attrs"
                      v-on="on"
                      :rules="[
                        (v) =>
                          item.checked ? !!v || 'Start time is required' : true,
                      ]"
                    ></v-text-field>
                  </template>
                  <v-time-picker
                    v-model="item.startTime"
                    full-width
                    @click:minute="$refs.timeStartRef[i].save(item.startTime)"
                    format="24hr"
                  ></v-time-picker>
                </v-menu>
              </v-col>
              <v-col cols="auto" md="auto" class="d-flex align-center">
                <label class="v-label mb-2 text-subtitle-2"> To </label>
              </v-col>
              <v-col cols="12" md="2">
                <v-menu
                  ref="timeEndRef"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="item.endTime"
                      label="--:--"
                      readonly
                      dense
                      outlined
                      single-line
                      :disabled="!item.checked || flagView"
                      :filled="!item.checked"
                      hide-details="auto"
                      v-bind="attrs"
                      v-on="on"
                      :rules="[
                        (v) =>
                          item.checked ? !!v || 'End time is required' : true,
                      ]"
                    ></v-text-field>
                  </template>
                  <v-time-picker
                    v-model="item.endTime"
                    :min="item.startTime"
                    @click:minute="$refs.timeEndRef[i].save(item.endTime)"
                    format="24hr"
                  ></v-time-picker>
                </v-menu>
              </v-col>
              <v-col cols="" class="d-flex align-center">
                <label class="v-label mr-2 text-subtitle-2"> Note : </label>
                <v-text-field
                  v-model="item.note"
                  dense
                  :disabled="!item.checked"
                  :filled="!item.checked"
                  :readonly="flagView"
                  outlined
                  hide-details="auto"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="3">
                <label class="v-label mb-2 text-subtitle-2">
                  <span class="red--text mr-2">*</span>Study platform :
                </label>
                <v-text-field
                  v-model="formInput.studyPlatform"
                  :readonly="flagView"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                  placeholder="Enter platform"
                  :rules="[(v) => !!v || 'Platform is required']"
                />
              </v-col>
              <v-col cols="12" md="9">
                <label class="v-label mb-2 text-subtitle-2">
                  <span class="red--text mr-2">*</span>Link :
                </label>
                <v-text-field
                  v-model="formInput.link"
                  :readonly="flagView"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                  placeholder="Enter link"
                  :rules="[(v) => !!v || 'Link is required']"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-row>
                  <v-col cols="12">
                    <label class="v-label mb-2 text-subtitle-2">
                      <span class="red--text mr-2">*</span>Admin name :
                    </label>
                    <v-text-field
                      :value="userInfo?.username"
                      filled
                      readonly
                      dense
                      outlined
                      single-line
                      hide-details="auto"
                    />
                  </v-col>
                  <v-col cols="12">
                    <label class="v-label mb-2 text-subtitle-2">
                      <span class="red--text mr-2">*</span>Check list :
                    </label>

                    <v-checkbox
                      v-for="(item, i) in checkList"
                      :key="i"
                      v-model="selectedCheckList"
                      :readonly="flagView"
                      :label="item"
                      :value="i + 1"
                      hide-details="auto"
                      :rules="[
                        (v) => !!v || 'Check list is required',
                        (v) => v.length > 0 || 'Check list is required',
                      ]"
                    ></v-checkbox>
                  </v-col>
                </v-row>
              </v-col>

              <v-col cols="12" md="9">
                <label class="v-label mb-2 text-subtitle-2"> Note : </label>
                <v-textarea
                  v-model="formInput.note"
                  :readonly="flagView"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                  placeholder="Enter note"
                  rows="9"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row
      v-if="
        userInfo?.role !== 'user' ||
        feePermission?.create ||
        (flagEdit && feePermission?.edit)
      "
    >
      <v-col cols="12">
        <v-card outlined>
          <v-card-title primary-title> Teacher fee for the class </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <label class="v-label mb-2 text-subtitle-2">
                  Class Name :
                </label>
                <v-text-field
                  v-model="formInput.name"
                  filled
                  readonly
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12" md="2">
                <label class="v-label mb-2 text-subtitle-2">Class No : </label>
                <v-text-field
                  v-model="formInput.no"
                  filled
                  readonly
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12" md="2">
                <label class="v-label mb-2 text-subtitle-2">Branch : </label>
                <v-select
                  v-model="formInput.branchID"
                  dense
                  :items="itemsOptions.branch"
                  item-text="name"
                  item-value="id"
                  filled
                  readonly
                  outlined
                  single-line
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12" md="4">
                <label class="v-label mb-2 text-subtitle-2"
                  >Class Type :
                </label>
                <v-select
                  v-model="formInput.classTypeID"
                  :items="itemsOptions.classType"
                  item-text="name"
                  item-value="id"
                  filled
                  readonly
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12" md="3">
                <label class="v-label mb-2 text-subtitle-2"
                  >Teacher Name :
                </label>
                <v-select
                  v-model="formInput.teacherID"
                  :items="itemsOptions.teacher"
                  item-text="name"
                  item-value="id"
                  filled
                  readonly
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12" md="5">
                <label class="v-label mb-2 text-subtitle-2"
                  >Student Name :
                </label>
                <v-select
                  v-model="selectedStudent"
                  dense
                  :items="itemsOptions.student"
                  item-text="name"
                  item-value="id"
                  filled
                  readonly
                  outlined
                  single-line
                  hide-details="auto"
                  multiple
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-list>
                  <v-list-item v-for="(status, i) in statusList" :key="i">
                    <v-list-item-content>
                      <v-list-item-title>
                        <v-row>
                          <v-col cols="6" class="d-flex align-center">
                            <v-badge
                              class="my-0"
                              inline
                              :color="status.color"
                            ></v-badge>
                            <span>{{ status.text }}</span>
                          </v-col>
                          <v-col cols="4">
                            <v-text-field
                              v-model="formInput[status.value]"
                              :readonly="flagView"
                              dense
                              type="number"
                              outlined
                              single-line
                              hide-details="auto"
                            />
                          </v-col>
                        </v-row>
                        <v-spacer></v-spacer>
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="4">
                <label class="v-label mb-2 text-subtitle-2">Currency : </label>
                <v-select
                  v-model="formInput.currencyID"
                  dense
                  :items="itemsOptions.currency"
                  :readonly="flagView"
                  item-text="name"
                  item-value="id"
                  outlined
                  single-line
                  hide-details="auto"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useAppStore } from "@/stores/app";
export default {
  name: "FormStudent",
  props: {
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
  },
  data() {
    return {
      menu: false,
      menu2: false,
      menuTime: false,
      time: null,
      date: null,

      selectedCheckList: [],
      isLoadingTeachers: false,
      isLoadingStudents: false,
      checkList: [
        "Send metarials to students",
        "Send study link to students",
        "Send study link to teacher",
        "Send study link to admin",
      ],
      formInput: {
        name: "",
        no: "",
        branchID: "",
        classTypeID: "",
        numberOfStudent: null,
        studentFee: null,
        discount: null,
        discountNote: "",
        totalFeePerClass: null,
        teacherID: null,
        materialTypeID: null,
        registeredTimes: null,
        teacherLeave: null,
        studentLeave: null,
        note: "",
        status: "Active",
        startDate: null,
        endDate: null,
        studyTimePerTime: null,
        studyPlatform: null,
        link: null,
        currencyID: null,

        regular: null,
        studentMissing: null,
        teacherMissing: null,
        other: null,
      },
      selectedStudent: [],
      statusList: [
        {
          text: "Regular",
          value: "regular",
          color: "green",
        },
        {
          text: "Student missing class",
          value: "studentMissing",
          color: "pink",
        },
        {
          text: "Teacher missing class",
          value: "teacherMissing",
          color: "red",
        },
        {
          text: "Other",
          value: "other",
          color: "info",
        },
      ],
      itemsRef: [],
      itemsRef2: [],
      itemsTimes: [
        {
          checked: false,
          text: "Mon",
          value: "Mon",
          startTime: "",
          endTime: "",
          note: "",
        },
        {
          checked: false,
          text: "Tue",
          value: "Tue",
          startTime: "",
          endTime: "",
          note: "",
        },
        {
          checked: false,
          text: "Wed",
          value: "Wed",
          startTime: "",
          endTime: "",
          note: "",
        },
        {
          checked: false,
          text: "Thu",
          value: "Thu",
          startTime: "",
          endTime: "",
          note: "",
        },
        {
          checked: false,
          text: "Fri",
          value: "Fri",
          startTime: "",
          endTime: "",
          note: "",
        },
        {
          checked: false,
          text: "Sat",
          value: "Sat",
          startTime: "",
          endTime: "",
          note: "",
        },
        {
          checked: false,
          text: "Sun",
          value: "Sun",
          startTime: "",
          endTime: "",
          note: "",
        },
      ],

      itemsOptions: {
        materialType: [],
        classType: [],
        branch: [],
        teacher: [],
        student: [],
        currency: [],
      },
      feePermission: {},
    };
  },
  computed: {
    ...mapState(useAppStore, {
      userInfo: "getUserinfo",
    }),
  },
  watch: {
    formInput: {
      handler() {
        this.emitData();
      },
      deep: true,
    },
    itemsTimes: {
      handler() {
        this.emitData();
      },
      deep: true,
    },
    selectedCheckList: {
      handler() {
        this.emitData();
      },
      deep: true,
    },
    selectedStudent: {
      handler() {
        this.emitData();
      },
      deep: true,
    },
    editItems: {
      handler() {
        if (Object.keys(this.editItems).length !== 0) {
          this.formInput = { ...this.editItems };

          this.selectedCheckList = this.editItems.checkList
            .split(",")
            .map((it) => parseInt(it));

          this.selectedStudent = this.editItems.classStudent.map(
            (it) => it.accountID
          );

          this.itemsTimes.forEach((item, index) => {
            const find = this.editItems.classStudy.find(
              (it) => it.day === item.text
            );
            if (find) {
              this.itemsTimes[index] = {
                ...item,
                checked: true,
                startTime: find.startTime,
                endTime: find.endTime,
                note: find.note,
              };
            }
          });

          if (this.editItems.expireDate === "") {
            this.notExpired = true;
          }
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.fetchOption();
    this.feePermission = this.userInfo.permissions.find(
      (it) => it.link === "/admin/classes/fee"
    );
  },
  methods: {
    async fetchOption() {
      try {
        const { data: dataMaterialType } = await this.axios.get(
          `/materialType`
        );
        this.itemsOptions.materialType = dataMaterialType;

        const { data: dataClassType } = await this.axios.get(`/classType`);
        this.itemsOptions.classType = dataClassType;

        const { data: dataBranch } = await this.axios.get(`/branch`);
        this.itemsOptions.branch = dataBranch;

        const { data: dataCurrency } = await this.axios.get(`/currency`);
        this.itemsOptions.currency = dataCurrency;

        // Fetch teachers with loading state
        this.isLoadingTeachers = true;
        const { data: dataTeacher } = await this.axios.get(
          `/account?role=teacher&limit=1000`
        );
        this.itemsOptions.teacher = dataTeacher.data || [];
        this.isLoadingTeachers = false;

        // Fetch students with loading state
        this.isLoadingStudents = true;
        const { data: dataStudent } = await this.axios.get(
          `/account?role=student&limit=1000`
        );
        this.itemsOptions.student = dataStudent.data || [];
        this.isLoadingStudents = false;
      } catch (error) {
        this.isLoadingTeachers = false;
        this.isLoadingStudents = false;
        this.$swal.fire({
          title: error.response.data.error,
          text: error.response.data.details,
          icon: "error",
        });
      }
    },
    emitData() {
      const classStudyData = this.itemsTimes
        .filter(
          (item) =>
            item.checked &&
            item.startTime &&
            item.endTime &&
            item.startTime !== "00:00" &&
            item.endTime !== "00:01"
        )
        .map((item) => ({
          value: item.value,
          startTime: item.startTime,
          endTime: item.endTime,
          note: item.note,
        }));

      console.log("emitData - classStudy being sent:", classStudyData);

      this.$emit("input", {
        ...this.formInput,
        checkList: this.selectedCheckList.join(","),
        classStudy: classStudyData,
        classStudent: this.selectedStudent,
        updateBy: this.userInfo.accountID,
      });
    },
  },
};
</script>

<style scoped></style>
