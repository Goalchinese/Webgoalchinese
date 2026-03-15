<template>
  <v-container>
    <v-row>
      <v-col cols="6" class="d-flex ga-2 align-center">
        <v-btn variant="text" icon to="/admin/classes/all" class="mr-2">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <h5 class="text-h5">Attendance</h5>
      </v-col>
      <v-col cols="6" md="4" class="ml-auto">
        <v-text-field
          v-model="search"
          placeholder="Search..."
          dense
          hide-details="auto"
          background-color="grey lighten-4"
          solo
          flat
          clearable
        />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :filter-keys="['title', 'category', 'type']"
          mobile-breakpoint="0"
          :items="items"
          :loading="isLoading"
          :server-items-length="pagination.total"
          :options.sync="pagination"
          @update:options="updatePagination"
        >
          <template #item.studyDay="{ item }">
            <v-row dense v-for="(it, i) in item.classStudy" :key="i">
              <v-col cols="">{{ it.day }}</v-col>
            </v-row>
          </template>
          <template #item.timeSlot="{ item }">
            <v-row dense v-for="(it, i) in item.classStudy" :key="i">
              <v-col cols="">{{ it.startTime }} - {{ it.endTime }}</v-col>
            </v-row>
          </template>

          <template #item.teacherLeave="{ item }">
            <v-form ref="formTeacherLeave" lazy-validation>
              <v-text-field
                v-model="item.inputTeacherLeave"
                dense
                outlined
                single-line
                hide-details="auto"
                :suffix="`/ ${item.teacherLeave}`"
                class="w-50"
                style="inline-size: 80px"
                :rules="[
                  () => item.inputTeacherLeave >= 0 || 'Required',
                  () =>
                    (item.inputTeacherLeave >= 0 &&
                      item.inputTeacherLeave <= item.teacherLeave) ||
                    'Invalid',
                ]"
                @keydown.enter.prevent="
                  updateClass(item.id, {
                    inputTeacherLeave: item.inputTeacherLeave,
                  })
                "
              ></v-text-field>
            </v-form>
          </template>

          <template #item.studentLeave="{ item }">
            <v-form ref="formStudentLeave" lazy-validation>
              <v-text-field
                v-model="item.inputStudentLeave"
                dense
                outlined
                single-line
                hide-details="auto"
                :suffix="`/ ${item.studentLeave}`"
                class="w-50"
                style="inline-size: 80px"
                :rules="[
                  () => item.inputStudentLeave >= 0 || 'Required',
                  () =>
                    (item.inputStudentLeave >= 0 &&
                      item.inputStudentLeave <= item.studentLeave) ||
                    'Invalid',
                ]"
                @keydown.enter.prevent="
                  updateClass(item.id, {
                    inputStudentLeave: item.inputStudentLeave,
                  })
                "
              ></v-text-field>
            </v-form>
          </template>

          <template #item.times="{ item }">
            <div style="width: 350px" class="text-no-wrap overflow-auto">
              <v-chip
                v-for="(time, i) in genarateTimes(item)"
                :key="i"
                class="ma-1 pa-2"
                label
                dark
                :color="resolveStatus(time.status)"
                @click.stop="showDialog(item.id, time)"
                style="cursor: pointer"
              >
                {{ i + 1 }}
              </v-chip>
            </div>
          </template>

          <template #item.action="{ item }">
            <v-menu>
              <template #activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>

              <v-list dense :lines="false">
                <v-list-item
                  v-for="(menu, i) in [
                    { title: 'View', to: `./view/${item.id}` },
                    { title: 'Edit', to: `./edit/${item.id}` },
                  ]"
                  :key="i"
                  link
                  :to="menu.to"
                >
                  <v-list-item-title>{{ menu.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-dialog v-model="dialog" max-width="350">
      <v-card>
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12">
              <label class="v-label mb-2 text-subtitle-2"> Study date </label>
              <v-menu
                ref="datePicker"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="editItem.studyDate"
                    label="study date"
                    append-icon="mdi-calendar"
                    readonly
                    dense
                    outlined
                    single-line
                    hide-details="auto"
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="editItem.studyDate"
                  @change="$refs.datePicker.save(editItem.studyDate)"
                ></v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="12">
              <v-radio-group
                v-model="editItem.status"
                column
                hide-details="auto"
                class="mt-0"
              >
                <v-list dense>
                  <v-list-item v-for="(status, i) in statusList" :key="i">
                    <v-list-item-content>
                      <v-list-item-title>
                        <v-radio
                          :label="status.text"
                          :color="status.color"
                          :value="status.value"
                        ></v-radio>
                      </v-list-item-title>
                    </v-list-item-content>

                    <v-list-item-action>
                      <v-badge inline :color="status.color"></v-badge>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-radio-group>
            </v-col>
            <v-col cols="12">
              <label class="v-label mb-2 text-subtitle-2"> Note : </label>
              <v-textarea
                v-model="editItem.note"
                dense
                outlined
                single-line
                hide-details="auto"
                placeholder="Enter note"
                rows="2"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="primary" @click="saveAttendance"> Save </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: "AttendanceClass",

  data() {
    return {
      dialog: false,
      menu2: false,
      search: "",
      isLoading: false,
      pagination: {
        page: 1,
        itemsPerPage: 10,
        total: 0,
      },
      headers: [
        {
          align: "start",
          value: "no",
          sortable: false,
          text: "Class No.",
          width: "10%",
        },
        { value: "name", text: "Class Name", width: "*" },
        { value: "studyDay", text: "Study day", width: "10%" },
        { value: "timeSlot", text: "Time slot", width: "12%" },
        { value: "teacherLeave", text: "Teacher leave", width: "5%" },
        { value: "studentLeave", text: "Student leave", width: "5%" },
        {
          value: "times",
          text: "Times",
          width: "*",
          class: "overflow-x-auto",
        },
        { value: "action", text: "Action", width: "5%" },
      ],
      items: [],
      date: new Date().toISOString().substring(0, 10),
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
      selectedStatus: "regular",
      itemsAttendance: [],
      editClassID: null,
      editTimeID: null,
      editItem: {
        studyDate: "",
        classId: null,
        status: "",
        note: "",
      },
    };
  },
  watch: {
    search() {
      this.fetchData();
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.isLoading = true;
      try {
        const { page, itemsPerPage } = this.pagination;
        // Handle -1 (All) case - use large number instead of -1
        const limit = itemsPerPage === -1 ? 1000 : itemsPerPage;
        const { data } = await this.axios.get(
          `/classes?page=${page}&limit=${limit}${
            this.search ? `&search=${this.search}` : ""
          }`
        );

        // Handle both data formats
        const items = data.data || data || [];
        const total = data.total || data.length || 0;

        this.items = items;
        this.pagination.total = total;

        console.log(
          "Attendance data loaded:",
          this.items.length,
          "of",
          total,
          "classes"
        );
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        this.$swal.fire({
          title: error.response?.data?.error || "Error",
          text:
            error.response?.data?.details || "Failed to load attendance data",
          icon: "error",
        });
      } finally {
        this.isLoading = false;
      }
    },
    updatePagination(options) {
      this.pagination.page = options.page;
      this.pagination.itemsPerPage = options.itemsPerPage;
      this.fetchData();
    },
    resolveStatus(status) {
      switch (status) {
        case "regular":
          return "green";
        case "studentMissing":
          return "pink";
        case "teacherMissing":
          return "red";
        case "other":
          return "info";
        default:
          return "grey lighten-2";
      }
    },
    showDialog(classId, item) {
      this.editClassID = classId;
      this.editItem = {
        ...item,
        studyDate: item.studyDate
          ? new Date(item.studyDate).toISOString().substring(0, 10)
          : new Date().toISOString().substring(0, 10),
      };
      this.dialog = true;
    },
    genarateTimes(item) {
      const times = [];

      // Add existing attendance with default status if missing
      if (item.attendance && item.attendance.length > 0) {
        times.push(
          ...item.attendance.map((att) => ({
            ...att,
            status: att.status || "regular", // Default to regular for completed classes
            studyDate:
              att.studyDate || new Date().toISOString().substring(0, 10),
          }))
        );
      }

      // Add remaining slots
      for (
        let i = 0;
        i < item.registeredTimes - (item.attendance?.length || 0);
        i++
      ) {
        times.push({
          studyDate: new Date().toISOString().substring(0, 10),
          classId: null,
          status: "",
        });
      }
      return times;
    },
    async saveAttendance() {
      try {
        if (this.editItem?.id) {
          await this.axios.put(`/attendances/${this.editItem?.id}`, {
            studyDate: this.editItem.studyDate,
            classId: this.editClassID,
            status: this.editItem.status,
            note: this.editItem.note,
          });
        } else {
          await this.axios.post(`/attendances`, {
            studyDate: this.editItem.studyDate,
            classId: this.editClassID,
            status: this.editItem.status,
            note: this.editItem.note,
          });
        }

        this.dialog = false;
        this.editClassID = null;
        this.editTimeID = null;
        this.editItem = {
          studyDate: "",
          classId: null,
          status: "",
        };
        this.selectedStatus = "regular";
        this.fetchData();
      } catch (error) {
        this.$swal.fire({
          title: error.response.data.error,
          text: error.response.data.details,
          icon: "error",
        });
      }
    },
    async updateClass(id, item) {
      if (item?.inputTeacherLeave) {
        if (!this.$refs.formTeacherLeave.validate()) return;
      }

      if (item?.inputStudentLeave) {
        if (!this.$refs.formStudentLeave.validate()) return;
      }

      try {
        const { data } = await this.axios.put(`/classes/${id}`, item);

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
