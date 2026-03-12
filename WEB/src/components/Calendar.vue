<template>
  <div class="fill-height">
    <v-row>
      <v-col>
        <v-row>
          <v-btn outlined class="mr-4" color="grey darken-2" @click="setToday">
            Today
          </v-btn>
          <v-menu bottom right class="mr-4">
            <template v-slot:activator="{ on, attrs }">
              <v-btn outlined color="grey darken-2" v-bind="attrs" v-on="on">
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right> mdi-menu-down </v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Day</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Week</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Month</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-title>4 days</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-row>
      </v-col>
      <v-col>
        <v-toolbar-title v-if="$refs.calendar">
          {{ $refs.calendar.title }}
        </v-toolbar-title>
      </v-col>
      <v-col>
        <v-row>
          <v-select
            v-if="isAdmin"
            label="Branch"
            v-model="branch"
            :items="itemsOptions.branch"
            item-text="name"
            item-value="id"
            outlined
            dense
            hide-details
            clearable
          ></v-select>
          <v-btn fab icon small color="grey darken-2" @click="prev">
            <v-icon small> mdi-chevron-left </v-icon>
          </v-btn>
          <v-btn fab icon small color="grey darken-2" @click="next">
            <v-icon small> mdi-chevron-right </v-icon>
          </v-btn>
        </v-row>
      </v-col>
    </v-row>

    <v-calendar
      class="mt-4"
      ref="calendar"
      v-model="focus"
      color="primary"
      :events="events"
      :event-color="getEventColor"
      :type="type"
      @click:event="showEvent"
      @click:more="viewMore"
      @click:date="viewDay"
      @change="getEvents"
    >
      <!-- @change="getEvents" -->
      <template #event="{ event }">
        <div class="px-1">{{ event?.name }}</div>
      </template>
    </v-calendar>

    <v-menu
      v-model="selectedOpenDay"
      :close-on-content-click="false"
      :activator="selectedElementDay"
      offset-x
    >
      <v-card min-width="450px" flat>
        <v-card-title>
          {{ dateToYMD(selectedEventDay?.date) }}
          <v-spacer></v-spacer>
          <v-btn
            v-if="isAdmin && (userInfo?.role !== 'user' || permission?.create)"
            @click.stop="openDialog"
            color="primary"
            x-small
            fab
            depressed
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="event in selectedEventDay.events"
              :key="event.name"
              @click="showEvent({ nativeEvent: $event, event })"
            >
              <v-list-item-content>
                <div class="d-flex flex-row">
                  <div class="d-flex flex-column">
                    <h6 class="subtitle-1">
                      {{
                        new Date(event.start).toLocaleTimeString("en-US", {
                          hourCycle: "h23",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      }}
                    </h6>
                    <span class="body-2">
                      {{
                        new Date(event.end).toLocaleTimeString("en-US", {
                          hourCycle: "h23",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      }}
                    </span>
                  </div>
                  <v-divider
                    vertical
                    :class="['mx-4']"
                    :style="`border: 3px solid; color: ${event.color};`"
                  ></v-divider>
                  <div class="d-flex flex-column" style="max-width: 250px">
                    <h6 class="subtitle-1 d-inline-block text-truncate">
                      {{ event.name }}
                    </h6>
                    <small class="text-caption text-truncate">
                      {{ event?.class?.studyPlatform }} , {{ event?.link }}
                    </small>
                  </div>
                </div>
              </v-list-item-content>
              <v-list-item-action>
                <v-avatar :color="event.color" size="30">
                  <span class="white--text subtitle-1 text-uppercase">
                    {{ event?.updatedBy?.name[0] }}
                  </span>
                </v-avatar>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-menu>

    <v-menu
      v-model="selectedOpen"
      :close-on-content-click="false"
      :activator="selectedElement"
      offset-x
    >
      <v-card width="350px" flat>
        <v-card-title class="pb-0">
          <v-spacer></v-spacer>
          <v-menu v-if="isAdmin">
            <template #activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on" small>
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list dense :lines="false">
              <template
                v-for="(menu, i) in [
                  {
                    title: 'Edit',
                    show: userInfo?.role !== 'user' || permission?.edit,
                    onClick: () => onEditEvent(),
                  },
                  {
                    title: 'Copy to multiple dates',
                    show: true,
                    onClick: () => (dialogCopyClass = true),
                  },
                  {
                    title: 'Delete',
                    show: userInfo?.role !== 'user' || permission?.delete,
                    onClick: onDeleteEvent,
                  },
                ]"
              >
                <v-list-item
                  :key="i"
                  link
                  @click="menu.onClick"
                  v-if="menu?.show"
                >
                  <v-list-item-title>{{ menu.title }}</v-list-item-title>
                </v-list-item>
              </template>
            </v-list>
          </v-menu>
        </v-card-title>

        <v-card-text>
          <v-row justify="center" dense>
            <v-col cols="auto">
              <h6 class="text-h6">{{ selectedEvent.name }}</h6>
            </v-col>
          </v-row>
          <v-row justify="center" align="center" dense>
            <v-col cols="auto">
              <h6 class="subtitle-1">
                {{ dateToYMDShort(selectedEvent?.start) }}
              </h6>
              <h4 class="text-h5">
                {{
                  new Date(selectedEvent.start)?.toLocaleTimeString("en-US", {
                    hourCycle: "h23",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }}
              </h4>
            </v-col>
            <v-col cols="auto">
              <v-icon color="primary" large>mdi-chevron-right</v-icon>
            </v-col>
            <v-col cols="auto">
              <h6 class="subtitle-1">
                {{ dateToYMDShort(selectedEvent?.end) }}
              </h6>
              <h4 class="text-h5">
                {{
                  new Date(selectedEvent.end)?.toLocaleTimeString("en-US", {
                    hourCycle: "h23",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }}
              </h4>
            </v-col>
          </v-row>
          <v-divider class="my-4"></v-divider>
          <v-row dense>
            <v-col cols="12" class="d-flex align-center">
              <v-icon color="primary">mdi-monitor-cellphone</v-icon>

              <span class="subtitle-2 mx-2">Platform :</span>

              <span>{{ selectedEvent?.class?.studyPlatform }}</span>
            </v-col>
            <v-col cols="12" class="align-center">
              <v-row dense>
                <v-col cols="auto">
                  <v-icon color="primary">mdi-link</v-icon>
                  <span class="subtitle-2 mx-2">Link :</span>
                </v-col>
                <v-col cols="">
                  <span>{{ selectedEvent?.link }}</span>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" class="d-flex align-center">
              <v-icon color="primary">mdi-clock-time-five-outline</v-icon>

              <span class="subtitle-2 mx-2">Teacher in class :</span>

              <span>{{ selectedEvent?.class?.teacher?.name }}</span>
            </v-col>
            <v-col cols="12" class="d-flex flex-wrap align-center">
              <v-icon color="primary">mdi-timer-edit-outline</v-icon>

              <span class="subtitle-2 mx-2">Student in class :</span>

              <template v-if="selectedEvent?.class?.classStudent?.length === 1">
                <v-chip small color="primary" outlined class="ml-2">
                  {{ selectedEvent.class.classStudent[0].account.name }}
                </v-chip>
              </template>
              <template v-else>
                <div class="mt-2">
                  <v-chip
                    v-for="(student, index) in selectedEvent?.class
                      ?.classStudent"
                    :key="index"
                    class="ma-1"
                    small
                    color="primary"
                    outlined
                  >
                    {{ student.account.name }}
                  </v-chip>
                </div>
              </template>
            </v-col>
          </v-row>

          <v-row justify="center" dense>
            <v-col cols="auto">
              <small>{{ selectedEvent?.note }}</small>
            </v-col>
          </v-row>

          <v-row justify="center" dense>
            <v-col cols="auto">
              <small>{{ dateToYMDShort(selectedEvent.updatedAt, true) }}</small>
            </v-col>
          </v-row>
          <v-row justify="center" dense>
            <v-col cols="auto">
              <v-avatar :color="selectedEvent.color" size="20">
                <span class="white--text subtitle-1 text-uppercase">
                  {{ selectedEvent?.updatedBy?.name[0] }}
                </span>
              </v-avatar>
              <small class="pl-2">Event created</small>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-menu>

    <v-dialog v-model="dialog" max-width="550">
      <v-card>
        <v-card-text class="pa-6">
          <v-form ref="formCreateClass" lazy-validation>
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  v-model="formInput.title"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                  placeholder="Enter title"
                  :rules="[(v) => !!v || 'Title is required']"
                />
              </v-col>
              <v-col cols="12" class="d-flex align-center">
                <v-icon color="primary">mdi-hours-24</v-icon>

                <span class="subtitle-2 mx-2">Class No :</span>

                <v-autocomplete
                  :items="itemsOptions.class"
                  v-model="selectedClass"
                  :item-text="(item) => `${item.name}`"
                  return-object
                  placeholder="Select class"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                  :rules="[(v) => !!v || 'Class is required']"
                />
              </v-col>
              <v-col cols="12" class="d-flex align-center">
                <v-icon color="primary">mdi-calendar</v-icon>

                <span class="subtitle-2 mx-2">Starts :</span>

                <div class="ml-auto d-flex align-center">
                  <v-chip class="mx-2" small label>
                    {{ dateToYMDShort(formInput.startDate, true) }}
                  </v-chip>
                  <v-menu
                    ref="menu"
                    v-model="menu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    :return-value.sync="formInput.startTime"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="formInput.startTime"
                        label="time"
                        readonly
                        dense
                        outlined
                        single-line
                        hide-details="auto"
                        v-bind="attrs"
                        v-on="on"
                        style="max-width: 100px"
                        :rules="[(v) => !!v || 'Start time is required']"
                      ></v-text-field>
                    </template>
                    <v-time-picker
                      v-if="menu"
                      v-model="formInput.startTime"
                      full-width
                      @click:minute="$refs.menu.save(formInput.startTime)"
                      format="24hr"
                    ></v-time-picker>
                  </v-menu>
                </div>
              </v-col>
              <v-col cols="12" class="d-flex align-center">
                <v-icon color="primary">mdi-calendar</v-icon>

                <span class="subtitle-2 mx-2">End :</span>

                <div class="ml-auto d-flex align-center">
                  <v-chip class="mx-2" small label>
                    {{ dateToYMDShort(formInput.endDate, true) }}
                  </v-chip>
                  <!-- <v-chip class="mx-2" small label> 9:30 PM </v-chip> -->
                  <v-menu
                    ref="menu2"
                    v-model="menu2"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    :return-value.sync="formInput.endTime"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="formInput.endTime"
                        label="time"
                        readonly
                        dense
                        outlined
                        single-line
                        hide-details="auto"
                        v-bind="attrs"
                        v-on="on"
                        style="max-width: 100px"
                        :rules="[(v) => !!v || 'End time is required']"
                      ></v-text-field>
                    </template>
                    <v-time-picker
                      v-if="menu2"
                      v-model="formInput.endTime"
                      :min="formInput.startTime"
                      full-width
                      @click:minute="$refs.menu2.save(formInput.endTime)"
                      format="24hr"
                    ></v-time-picker>
                  </v-menu>
                </div>
              </v-col>
              <v-col cols="12" class="d-flex align-center">
                <v-icon color="primary">mdi-home</v-icon>

                <span class="subtitle-2 mx-2">Branch :</span>

                <span>{{ selectedClass?.branch?.name }}</span>
              </v-col>
              <v-col cols="12" class="d-flex align-center">
                <v-icon color="primary">mdi-monitor-cellphone</v-icon>

                <span class="subtitle-2 mx-2">Platform :</span>

                <span>{{ selectedClass?.studyPlatform }}</span>
              </v-col>
              <v-col cols="12" class="d-flex align-center">
                <v-icon color="primary">mdi-link</v-icon>

                <span class="subtitle-2 mx-2">Link :</span>
                <v-text-field
                  v-model="formInput.link"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                  :rules="[(v) => !!v || 'Link is required']"
                />
              </v-col>
              <v-col cols="12" class="d-flex align-center">
                <v-icon color="primary">mdi-clock-time-five-outline</v-icon>

                <span class="subtitle-2 mx-2">Teacher in class :</span>

                <span>{{ selectedClass?.teacher?.name }}</span>
              </v-col>
              <v-col cols="12" class="d-flex align-center">
                <v-icon color="primary">mdi-timer-edit-outline</v-icon>

                <span class="subtitle-2 mx-2">Student in class :</span>

                <!-- Show loading state while fetching -->
                <div v-if="loadingStudents" class="mt-2">
                  <v-chip small color="grey" outlined>
                    <v-progress-circular
                      indeterminate
                      size="12"
                      width="2"
                      class="mr-2"
                    ></v-progress-circular>
                    Loading students...
                  </v-chip>
                </div>
                <!-- Show students when available -->
                <template
                  v-else-if="getStudentsInClass(selectedClass).length > 0"
                >
                  <div class="mt-2">
                    <v-chip
                      v-for="(student, index) in getStudentsInClass(
                        selectedClass
                      )"
                      :key="index"
                      class="ma-1"
                      small
                      color="primary"
                      outlined
                    >
                      {{ student.account.name }}
                    </v-chip>
                  </div>
                </template>
                <!-- Show no students when not loading and no data -->
                <template v-else>
                  <span style="color: grey">No students in this class</span>
                </template>
              </v-col>
              <v-col cols="12" class="d-flex align-center">
                <v-icon color="primary">mdi-tag</v-icon>

                <span class="subtitle-2 mx-2">Coral pink :</span>

                <v-item-group v-model="formInput.color">
                  <v-item
                    v-for="(color, i) in listColors"
                    :key="i"
                    v-slot="{ active, toggle }"
                    :value="color"
                  >
                    <v-chip
                      class="ma-1"
                      :color="color"
                      :input-value="active"
                      @click="toggle"
                      dark
                      small
                    >
                      <v-icon small v-if="active">mdi-check</v-icon>
                    </v-chip>
                  </v-item>
                </v-item-group>
              </v-col>
              <v-col cols="12">
                <span>
                  <v-avatar :color="formInput.color" size="30">
                    <span class="white--text subtitle-1 text-uppercase">
                      {{ this.userInfo?.username[0] }}
                    </span>
                  </v-avatar>
                </span>
              </v-col>
              <v-col cols="12">
                <label class="v-label mb-2 text-subtitle-2"> Note : </label>
                <v-textarea
                  v-model="formInput.note"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                  placeholder="Enter note"
                  rows="2"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="primary" @click="createClassEvent"> Save </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      ref="dialogCopyClass"
      v-model="dialogCopyClass"
      persistent
      width="290px"
    >
      <v-date-picker
        v-model="selectedDate"
        multiple
        scrollable
        :min="new Date().toISOString().substring(0, 10)"
      >
        <v-spacer></v-spacer>
        <v-btn text color="error" @click="dialogCopyClass = false">
          Cancel
        </v-btn>
        <v-btn
          :disabled="!selectedDate?.length"
          text
          color="primary"
          @click="copyClassEvent"
        >
          OK
        </v-btn>
      </v-date-picker>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useAppStore } from "@/stores/app";

export default {
  name: "CalendarComponent",
  props: {
    eventsItems: {
      type: Array,
      default: () => [],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    permission: {},
    menu: false,
    menu2: false,
    branch: null,
    focus: "",
    type: "month",
    typeToLabel: {
      month: "Month",
      week: "Week",
      day: "Day",
      "4day": "4 Days",
    },
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    selectedOpenDay: false,
    selectedElementDay: null,
    selectedEventDay: {},
    events: [],
    colors: [
      "blue",
      "indigo",
      "deep-purple",
      "cyan",
      "green",
      "orange",
      "grey darken-1",
    ],
    names: [
      "Meeting",
      "Holiday",
      "PTO",
      "Travel",
      "Event",
      "Birthday",
      "Conference",
      "Party",
    ],
    dialog: false,
    dialogCopyClass: false,
    selectedDate: [],
    listColors: [
      "#2ecc87",
      "#3dc2c8",
      "#47b2f7",
      // "#948078",
      // "#212121",
      "#e73b3b",
      "#f35f8c",
      "#fb7f77",
      "#fdc02d",
      "#b38bdc",
    ],
    itemsOptions: {
      class: [],
      branch: [],
    },
    selectedClass: null,

    formInput: {
      title: "",
      class: "",
      startDate: new Date().toISOString().substring(0, 10),
      startTime: new Date().getHours() + ":" + new Date().getMinutes(),
      endDate: new Date().toISOString().substring(0, 10),
      endTime: "",
      branch: "",
      platform: "",
      link: "",
      teacher: "",
      student: "",
      color: "",
      note: "",
    },
    flagCreate: true,
    classStudents: {}, // Cache for students by class ID
    loadingStudents: false, // Loading state for students
  }),
  computed: {
    ...mapState(useAppStore, {
      userInfo: "getUserinfo",
    }),
  },
  watch: {
    selectedClass: {
      immediate: true,
      async handler(newClass) {
        // Update form input
        this.formInput.title = newClass?.name;
        this.formInput.link = newClass?.link;

        // Fetch students when class is selected and wait for completion
        if (newClass && newClass.id) {
          await this.fetchStudentsForClass(newClass.id);
        }
      },
    },
    eventsItems: {
      immediate: true,
      handler(val) {
        console.log(
          "Calendar eventsItems changed:",
          val?.length || 0,
          "events"
        );
        if (val) this.getEvents();
      },
    },
    branch(val) {
      if (val) this.$emit("fetchEvents", val);
    },
    dialog(val) {
      if (!val) {
        this.$refs.formCreateClass.reset();
        this.selectedClass = {};
        this.selectedOpen = false;
      }
    },
  },
  mounted() {
    if (this.isAdmin) this.fetchOption();
    this.permission = this.userInfo.permissions.find(
      (it) => it.link === this.$route.path
    );
  },
  methods: {
    async fetchOption() {
      try {
        // Get all classes without pagination for dropdown
        const { data: dataClass } = await this.axios.get(`/classes?limit=1000`);
        this.itemsOptions.class = dataClass.data || dataClass;

        const { data: dataBranch } = await this.axios.get(`/branch`);
        this.itemsOptions.branch = dataBranch;
      } catch (error) {
        this.$swal.fire({
          title: error.response.data.error,
          text: error.response.data.details,
          icon: "error",
        });
      }
    },

    openDialog() {
      this.flagCreate = true;
      this.formInput = {
        title: "",
        startDate: this.selectedEventDay.date,
        startTime: new Date().getHours() + ":" + new Date().getMinutes(),
        endDate: this.selectedEventDay.date,
        endTime: "",
        link: "",
        color: this.listColors[0],
        note: "",
      };
      this.dialog = true;
    },

    onEditEvent() {
      this.formInput = {};
      this.selectedClass = this.selectedEvent.class;

      setTimeout(() => {
        this.formInput = {
          title: this.selectedEvent.name,
          startDate: this.selectedEvent.start,
          startTime: new Date(this.selectedEvent.start).toLocaleTimeString(
            "en-GB",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          ),
          endDate: this.selectedEvent.end,
          endTime: new Date(this.selectedEvent.end).toLocaleTimeString(
            "en-GB",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          ),
          link: this.selectedEvent.link,
          color: this.selectedEvent.color,
          note: this.selectedEvent.note,
        };
      }, 100);
      this.dialog = true;
      this.flagCreate = false;
    },

    async createClassEvent() {
      if (!this.$refs.formCreateClass.validate()) return;

      try {
        let response = null;
        if (this.flagCreate) {
          const body = {
            ...this.formInput,
            classId: this.selectedClass.id,
            startDate: `${this.formInput.startDate} ${this.formInput.startTime}`,
            endDate: `${this.formInput.endDate} ${this.formInput.endTime}`,
            updateBy: this.userInfo.accountID,
          };
          response = await this.axios.post(`/classEvents`, body);
        } else {
          const body = {
            ...this.formInput,
            classId: this.selectedClass.id,
            startDate: `${this.formInput.startDate.substring(0, 10)} ${
              this.formInput.startTime
            }`,
            endDate: `${this.formInput.endDate.substring(0, 10)} ${
              this.formInput.endTime
            }`,
            updateBy: this.userInfo.accountID,
          };
          response = await this.axios.put(
            `/classEvents/${this.selectedEvent?.id}`,
            body
          );
        }

        this.$swal(response?.data?.message, "", "success");

        this.dialog = false;
        this.selectedOpen = false;

        this.$emit("fetchEvents");
        this.$refs.calendar.checkChange();
      } catch (error) {
        this.$swal.fire({
          title: error.response.data.error,
          text: error.response.data.details,
          icon: "error",
        });
      }
    },

    async copyClassEvent() {
      try {
        const { data } = await this.axios.post(
          `/classEvents/copy/${this.selectedEvent.id}`,
          {
            dates: this.selectedDate,
          }
        );

        this.$swal(data?.message, "", "success");
        this.dialogCopyClass = false;
        this.selectedDate = [];
        this.$emit("fetchEvents");
        this.$refs.calendar.checkChange();
      } catch (error) {
        this.$swal.fire({
          title: error.response.data.error,
          text: error.response.data.details,
          icon: "error",
        });
      }
    },

    viewDay({ nativeEvent, date }) {
      const open = () => {
        const findEvent = this.events.filter((event) => {
          return (
            new Date(event.start) <= new Date(`${date} 23:59:59`) &&
            new Date(`${date} 00:00:00`) <= new Date(event.end)
          );
        });

        this.selectedEventDay = {
          date: date,
          events: findEvent,
        };

        this.selectedElementDay = nativeEvent.target;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => (this.selectedOpenDay = true))
        );
      };

      if (this.selectedOpenDay) {
        this.selectedOpenDay = false;
        requestAnimationFrame(() => requestAnimationFrame(() => open()));
      } else {
        open();
      }

      nativeEvent.stopPropagation();
    },
    viewMore({ date }) {
      this.focus = date;
      this.type = "day";
    },
    getEventColor(event) {
      return event.color;
    },
    setToday() {
      this.focus = "";
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.target;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => (this.selectedOpen = true))
        );
      };

      if (this.selectedOpen) {
        this.selectedOpen = false;
        requestAnimationFrame(() => requestAnimationFrame(() => open()));
      } else {
        open();
      }

      nativeEvent.stopPropagation();
    },
    formatDateTime(date, timeZone = "UTC") {
      const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone, // Default: UTC, can be adjusted to a specific timezone
      };

      return new Intl.DateTimeFormat("en-CA", options)
        .format(date)
        .replace(", ", " ");
    },

    getEvents() {
      let temp = this.eventsItems;
      console.log("Calendar getEvents called with:", temp.length, "events");
      console.log("First event:", temp[0]);

      // if (this.eventsItems.length === 0) return;
      for (let i = 0; i < temp.length; i++) {
        const event = temp[i];
        event.name = event.title;
        event.start = this.formatDateTime(new Date(event.startDate));
        event.end = this.formatDateTime(new Date(event.endDate));
        event.timed = true;
      }
      this.events = temp;
      console.log("Calendar events set to:", this.events.length);
      this.$nextTick(() => {
        this.$refs.calendar.checkChange();
      });
    },
    dateToYMD(dateParam) {
      const date = new Date(dateParam);
      const options = {
        weekday: "long",
        month: "long",
        day: "numeric",
      };

      return date.toLocaleDateString("en-US", options);
    },
    dateToYMDShort(dateParam, year = false) {
      const date = new Date(dateParam);
      const options = {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: year ? "numeric" : undefined,
      };

      return date.toLocaleDateString("en-US", options);
    },
    async onDeleteEvent() {
      // confirm delete
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
          `/classEvents/${this.selectedEvent.id}`
        );
        this.$swal(data?.message, "", "success");
        this.selectedEvent = {};
        this.$emit("fetchEvents");
      } catch (error) {
        this.$swal.fire({
          title: error.response.data.error,
          text: error.response.data.details,
          icon: "error",
        });
      }
    },

    getStudentsInClass(selectedClass) {
      if (!selectedClass) return [];

      const students = this.classStudents[selectedClass.id];
      if (!students || students.length === 0) return [];

      return students.filter((student) => student.account?.name);
    },

    async fetchStudentsForClass(classId) {
      if (!classId) return;

      // Set loading state
      this.loadingStudents = true;

      try {
        const { data } = await this.axios.get(`/classes/${classId}`);
        this.classStudents[classId] = data.classStudent || [];
        // Force re-render to update UI immediately
        this.$forceUpdate();
      } catch (error) {
        console.error("Error fetching students for class:", error);
      } finally {
        // Clear loading state
        this.loadingStudents = false;
      }
    },
  },
};
</script>
