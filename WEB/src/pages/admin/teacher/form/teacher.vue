<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-card outlined>
          <v-card-title primary-title> Personal Detail </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <label class="v-label mb-2 text-subtitle-2">
                  <span class="red--text mr-2">*</span>Personal Name :
                </label>
                <v-text-field
                  v-model="formInput.name"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                  placeholder="Enter name"
                  :rules="[(v) => !!v || 'Name is required']"
                  :readonly="flagView"
                />
              </v-col>
              <v-col cols="12" md="auto">
                <label class="v-label text-subtitle-2"
                  ><span class="red--text mr-2">*</span>Gender :
                </label>
                <v-radio-group
                  row
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
                <label class="v-label mb-2 text-subtitle-2"
                  ><span class="red--text mr-2">*</span>Age :
                </label>
                <v-text-field
                  v-model="age"
                  dense
                  outlined
                  single-line
                  readonly
                  hide-details="auto"
                  persistent-placeholder
                />
              </v-col>

              <v-col cols="12" md="4">
                <label class="v-label mb-2 text-subtitle-2">
                  <span class="red--text mr-2">*</span>Date of Birth :
                </label>
                <v-menu
                  ref="menu"
                  v-model="pickerDOB"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="formInput.dateOfBirth"
                      placeholder="Birthday date"
                      append-icon="mdi-calendar"
                      dense
                      outlined
                      single-line
                      hide-details="auto"
                      :rules="[(v) => !!v || 'Birthday is required']"
                      readonly
                      :disabled="flagView"
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="formInput.dateOfBirth"
                    :active-picker.sync="activePicker"
                    :max="
                      new Date(
                        Date.now() - new Date().getTimezoneOffset() * 60000
                      )
                        .toISOString()
                        .substring(0, 10)
                    "
                    min="1950-01-01"
                    @change="$refs.menu.save(formInput.dateOfBirth)"
                  ></v-date-picker>
                </v-menu>
              </v-col>

              <v-col cols="12" md="4">
                <label class="v-label mb-2 text-subtitle-2">
                  <span class="red--text mr-2">*</span>User Name :
                </label>
                <v-text-field
                  v-model="formInput.username"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                  placeholder="Enter user name"
                  :disabled="flagEdit"
                  :rules="[(v) => !!v || 'User Name is required']"
                  :readonly="flagView"
                />
              </v-col>
              <v-col cols="12" md="4">
                <label class="v-label mb-2 text-subtitle-2">
                  <span class="red--text mr-2">*</span>Password :
                </label>
                <v-text-field
                  v-model="formInput.password"
                  dense
                  outlined
                  single-line
                  :type="showPassword ? 'text' : 'password'"
                  hide-details="auto"
                  placeholder="Enter password"
                  :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append="showPassword = !showPassword"
                  :readonly="flagView"
                  :rules="[
                    (v) => (flagEdit ? true : !!v || 'Password is required'),
                  ]"
                />
              </v-col>
              <v-col cols="0" md="4" />
              <v-col cols="12" md="4">
                <label class="v-label mb-2 text-subtitle-2">Address : </label>
                <v-textarea
                  v-model="formInput.address"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                  placeholder="Enter address"
                  :readonly="flagView"
                  rows="2"
                />
              </v-col>
              <v-col cols="12" md="4">
                <label class="v-label mb-2 text-subtitle-2"> Phone : </label>
                <v-text-field
                  v-model="formInput.phone"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                  placeholder="Enter phone number"
                  :readonly="flagView"
                />
              </v-col>

              <v-col cols="12" md="4">
                <label class="v-label mb-2 text-subtitle-2">
                  <span class="red--text mr-2">*</span>Resume No :
                </label>
                <v-text-field
                  v-model="formInput.resumeNo"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                  placeholder="Enter resume number"
                  :rules="[(v) => !!v || 'Resume No is required']"
                  :readonly="flagView"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row justify="center" dense class="mt-6">
      <v-col cols="12">
        <v-card outlined>
          <v-card-title primary-title> Admission Detail </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <label class="v-label mb-2 text-subtitle-2">
                  <span class="red--text mr-2">*</span>Register Date :
                </label>
                <v-menu
                  ref="menuAddmissionDate"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="formInput.registerDate"
                      placeholder="Register date"
                      append-icon="mdi-calendar"
                      dense
                      outlined
                      single-line
                      hide-details="auto"
                      :rules="[(v) => !!v || 'Birthday is required']"
                      readonly
                      :disabled="flagView"
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="formInput.registerDate"
                    @change="
                      $refs.menuAddmissionDate.save(formInput.dateOfBirth)
                    "
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" md="4">
                <label class="v-label mb-2 text-subtitle-2">
                  <span class="red--text mr-2">*</span>Score for kids :
                </label>
                <v-text-field
                  v-model="formInput.scoreForKids"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                  placeholder="Enter Score"
                  :rules="[
                    (v) => {
                      if (!v && v !== 0) return 'Score is required';
                      if (isNaN(v)) return 'Please enter a number';
                      if (v < 0 || v > 9) return 'Score must be between 0 and 9';
                      return true;
                    },
                  ]"
                  :readonly="flagView"
                />
              </v-col>
              <v-col cols="12" md="4">
                <label class="v-label mb-2 text-subtitle-2">
                  <span class="red--text mr-2">*</span>Score for Adult :
                </label>
                <v-text-field
                  v-model="formInput.scoreForAdult"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                  placeholder="Enter Score"
                  :rules="[
                    (v) => {
                      if (!v && v !== 0) return 'Score is required';
                      if (isNaN(v)) return 'Please enter a number';
                      if (v < 0 || v > 9) return 'Score must be between 0 and 9';
                      return true;
                    },
                  ]"
                  :readonly="flagView"
                />
              </v-col>

              <v-col cols="12" md="4">
                <label class="v-label mb-2 text-subtitle-2">
                  <span class="red--text mr-2">*</span>Teacher type :
                </label>
                <v-select
                  v-model="formInput.teacherTypeID"
                  :items="itemsOptions.teacherType"
                  item-text="name"
                  item-value="id"
                  dense
                  outlined
                  hide-details="auto"
                  placeholder="Select teacher type"
                  :rules="[(v) => !!v || 'Teacher type is required']"
                  :readonly="flagView"
                />
              </v-col>
              <v-col cols="12" md="4">
                <label class="v-label mb-2 text-subtitle-2">
                  <span class="red--text mr-2">*</span>Teacher No :
                </label>
                <v-text-field
                  v-model="formInput.teacherNo"
                  dense
                  outlined
                  single-line
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
                      Upload Photo :
                    </label>
                    <v-file-input
                      v-model="formInput.photo"
                      dense
                      outlined
                      hide-details="auto"
                      :readonly="flagView"
                    />
                  </v-col>
                  <v-col cols="auto" v-if="!flagCreate && formInput.photo">
                    <v-btn color="error" icon @click="deletePhoto">
                      <v-icon>mdi-trash-can</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" md="8">
                <v-row>
                  <v-col cols="12" md="6">
                    <label class="v-label mb-2 text-subtitle-2">
                      <span class="red--text mr-2">*</span>Available for class:
                    </label>
                    <v-select
                      v-model="formInput.avaliableForClass"
                      :items="['Kids', 'Adult', 'Kids & Adult']"
                      dense
                      outlined
                      hide-details="auto"
                      placeholder="Select class"
                      :readonly="flagView"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <label class="v-label mb-2 text-subtitle-2">
                      Language :
                    </label>
                    <v-text-field
                      v-model="formInput.language"
                      dense
                      outlined
                      single-line
                      hide-details="auto"
                      placeholder="Enter language"
                      :readonly="flagView"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <label class="v-label mb-2 text-subtitle-2">
                      <span class="red--text mr-2">*</span>Teacher status:
                    </label>
                    <v-select
                      v-model="formInput.status"
                      :items="['Active', 'Inactive']"
                      dense
                      outlined
                      hide-details="auto"
                      placeholder="Select class"
                      :rules="[(v) => !!v || 'Status is required']"
                      :readonly="flagView"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <v-col cols="12" md="4">
                <label class="v-label mb-2 text-subtitle-2">
                  Interview note details :
                </label>
                <v-textarea
                  v-model="formInput.note"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                  placeholder="Enter note details"
                  :readonly="flagView"
                  rows="2"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <FeeStructureComponent
      :flagView="flagView"
      :flagCreate="flagCreate"
      v-model="formFeeStructure"
      @refForm="(ref) => (refFormFee = ref)"
    />

    <ScoreStructureComponent
      :flagView="flagView"
      :flagCreate="flagCreate"
      v-model="formScoreStructure"
      @refForm="(ref) => (refFormScore = ref)"
    />
  </div>
</template>

<script>
import FeeStructureComponent from "./feeStructure.vue";
import ScoreStructureComponent from "./scoreStructure.vue";
export default {
  name: "FormTeacher",
  components: {
    FeeStructureComponent,
    ScoreStructureComponent,
  },
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
    flagCreate: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      pickerDOB: false,
      activePicker: null,
      isSelectAll: false,
      age: 0,
      showPassword: false,
      formInput: {
        name: "",
        gender: "Male",
        dateOfBirth: "",
        username: "",
        password: "",
        phone: "",
        address: "",
        resumeNo: "",
        registerDate: "",
        scoreForKids: null,
        scoreForAdult: null,
        teacherTypeID: null,
        teacherNo: "",
        photo: null,
        avaliableForClass: "",
        language: "",
        note: "",
        status: "Active",
      },

      itemsOptions: {
        teacherType: [],
      },
      formFeeStructure: [],
      refFormFee: null,
      formScoreStructure: [],
      refFormScore: null,
    };
  },
  watch: {
    pickerDOB(val) {
      val && setTimeout(() => (this.activePicker = "YEAR"));
    },
    "formInput.dateOfBirth": {
      handler() {
        if (this.formInput.dateOfBirth) {
          this.age = this.calulateAge(this.formInput.dateOfBirth);
        }
      },
    },
    formInput: {
      handler() {
        this.$emit("input", this.formInput);
        this.$emit("refFormFee", this.refFormFee);
        this.$emit("dataFormFee", this.formFeeStructure);
        this.$emit("refFormScore", this.refFormScore);
        this.$emit("dataFormScore", this.formScoreStructure);
      },
      deep: true,
    },
    editItems: {
      handler() {
        if (Object.keys(this.editItems).length !== 0) {
          this.formInput = { ...this.editItems };
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.fetchOption();
  },
  methods: {
    async fetchOption() {
      try {
        const { data } = await this.axios.get(`/teacherType`);
        this.itemsOptions.teacherType = data;
      } catch (error) {
        this.$swal.fire({
          title: error.response.data.error,
          text: error.response.data.details,
          icon: "error",
        });
      }
    },
    async deletePhoto() {
      const { isDismissed } = await this.$swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this data!",
        icon: "warning",
        buttons: true,
      });

      if (isDismissed) return;

      //delete data from api
      try {
        const { data } = await this.axios.delete(
          `/account/image/${this.$route.params.id}`
        );
        this.$swal(data?.message, "", "success");
        this.fetchData();
      } catch (error) {
        this.$swal.fire({
          title: error.response.data.error,
          text: error.response.data.details,
          icon: "error",
        });
      }
    },
  },
};
</script>

<style scoped></style>
