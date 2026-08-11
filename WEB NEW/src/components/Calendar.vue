<script setup lang="ts">
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import type { CalendarApi, CalendarOptions } from "@fullcalendar/core";
import Swal from "sweetalert2";
import { axios } from "@/plugins/axios";
import { useAuth } from "@/composables/useAuth";

const props = defineProps<{
  eventsItems: any[];
  isAdmin?: boolean;
}>();

const emit = defineEmits<{
  fetchEvents: [branchId?: string];
}>();

const { userInfo } = useAuth();
const route = useRoute();

const calendarRef = ref<InstanceType<typeof FullCalendar>>();
const calendarApi = ref<CalendarApi | null>(null);
const formCreateClass = ref<any>(null);

const permission = computed(() =>
  userInfo.value?.permissions?.find(
    (it: { link?: string }) => it.link === route.path,
  ),
);

const menu = ref(false);
const menu2 = ref(false);
const branch = ref<string | null>(null);
const type = ref("month");
const calendarTitle = ref("");

const selectedEvent = ref<any>({});
const selectedElement = ref<any>(null);
const selectedOpen = ref(false);
const selectedOpenDay = ref(false);
const selectedElementDay = ref<any>(null);
const selectedEventDay = ref<any>({});
const events = ref<any[]>([]);

const dialog = ref(false);
const dialogCopyClass = ref(false);
const selectedDate = ref<string[]>([]);

const calendarsColor = {
  primary: "primary",
  secondary: "secondary",
  success: "success",
  info: "info",
  warning: "warning",
  error: "error",
  purple: "purple",
  pink: "pink",
  indigo: "indigo",
  teal: "teal",
  blue: "blue",
  lime: "lime",
  amber: "amber",
  brown: "brown",
};

const itemsOptions = reactive<{ class: any[]; branch: any[] }>({
  class: [],
  branch: [],
});

const selectedClass = ref<any>(null);

const formInput = reactive({
  title: "",
  class: "",
  startDate: new Date().toISOString().substring(0, 10),
  startTime: `${new Date().getHours()}:${new Date().getMinutes()}`,
  endDate: new Date().toISOString().substring(0, 10),
  endTime: "",
  branch: "",
  platform: "",
  link: "",
  teacher: "",
  student: "",
  color: "",
  note: "",
});

let flagCreate = true;
const classStudents = reactive<Record<string, any[]>>({});
const loadingStudents = ref(false);

const showApiError = (error: any) => {
  Swal.fire({
    title: error?.response?.data?.error,
    text: error?.response?.data?.details,
    icon: "error",
  });
};

async function fetchOption() {
  try {
    const { data: dataClass } = await axios.get("/classes?limit=1000");

    itemsOptions.class = dataClass.data || dataClass;

    const { data: dataBranch } = await axios.get("/branch");

    itemsOptions.branch = dataBranch;
  } catch (error) {
    showApiError(error);
  }
}

function openDialog() {
  flagCreate = true;
  Object.assign(formInput, {
    title: "",
    startDate: selectedEventDay.value.date,
    startTime: `${new Date().getHours()}:${new Date().getMinutes()}`,
    endDate: selectedEventDay.value.date,
    endTime: "",
    link: "",
    color: calendarsColor.primary,
    note: "",
  });
  dialog.value = true;
}

function onEditEvent() {
  Object.assign(formInput, { title: "", class: "", link: "", note: "" });
  selectedClass.value = selectedEvent.value.class;

  setTimeout(() => {
    Object.assign(formInput, {
      title: selectedEvent.value.name,
      startDate: selectedEvent.value.start,
      startTime: new Date(selectedEvent.value.start).toLocaleTimeString(
        "en-GB",
        {
          hour: "2-digit",
          minute: "2-digit",
        },
      ),
      endDate: selectedEvent.value.end,
      endTime: new Date(selectedEvent.value.end).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      link: selectedEvent.value.link,
      color: selectedEvent.value.color,
      note: selectedEvent.value.note,
    });
  }, 100);
  dialog.value = true;
  flagCreate = false;
}

async function createClassEvent() {
  const { valid: isValidForm } = await formCreateClass.value.validate();

  if (!isValidForm) return;

  try {
    let response = null;

    if (flagCreate) {
      const body = {
        ...formInput,
        classId: selectedClass.value.id,
        startDate: `${formInput.startDate} ${formInput.startTime}`,
        endDate: `${formInput.endDate} ${formInput.endTime}`,
        updateBy: userInfo.value?.accountID,
      };

      response = await axios.post("/classEvents", body);
    } else {
      const body = {
        ...formInput,
        classId: selectedClass.value.id,
        startDate: `${formInput.startDate.substring(0, 10)} ${formInput.startTime}`,
        endDate: `${formInput.endDate.substring(0, 10)} ${formInput.endTime}`,
        updateBy: userInfo.value?.accountID,
      };

      response = await axios.put(
        `/classEvents/${selectedEvent.value?.id}`,
        body,
      );
    }

    Swal.fire(response?.data?.message, "", "success");

    dialog.value = false;
    selectedOpen.value = false;

    emit("fetchEvents");
  } catch (error) {
    showApiError(error);
  }
}

async function copyClassEvent() {
  try {
    const { data } = await axios.post(
      `/classEvents/copy/${selectedEvent.value.id}`,
      {
        dates: selectedDate.value?.map((date) => new Date(date).toISOString().substring(0, 10)),
      },
    );

    Swal.fire(data?.message, "", "success");
    dialogCopyClass.value = false;
    selectedDate.value = [];
    emit("fetchEvents");
  } catch (error) {
    console.error("Error copying class event:", error);
    showApiError(error);
  }
}

function getEventColor(event: any) {
  return event.color;
}

function eventTimeLabel(event: any) {
  if (!event?.start) return "";
  try {
    return new Date(event.start).toLocaleTimeString("en-US", {
      hourCycle: "h23",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function setToday() {
  calendarApi.value?.today();
  calendarTitle.value = calendarApi.value?.view.title || "";
}

function prev() {
  calendarApi.value?.prev();
  calendarTitle.value = calendarApi.value?.view.title || "";
}

function next() {
  calendarApi.value?.next();
  calendarTitle.value = calendarApi.value?.view.title || "";
}

watch(type, (val) => {
  calendarApi.value?.changeView(
    val === "week" ? "timeGridWeek" : "dayGridMonth",
  );
  calendarTitle.value = calendarApi.value?.view.title || "";
});

function showEvent({
  nativeEvent,
  event,
}: {
  nativeEvent: MouseEvent;
  event: any;
}) {
  const open = () => {
    selectedEvent.value = event;
    selectedElement.value = nativeEvent.target;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => (selectedOpen.value = true)),
    );
  };

  if (selectedOpen.value) {
    selectedOpen.value = false;
    requestAnimationFrame(() => requestAnimationFrame(() => open()));
  } else {
    open();
  }

  nativeEvent.stopPropagation();
}

function viewDay({
  nativeEvent,
  dateStr,
}: {
  nativeEvent: MouseEvent;
  dateStr: string;
}) {
  const open = () => {
    const findEvent = events.value.filter(
      (event) =>
        new Date(event.start) <= new Date(`${dateStr} 23:59:59`) &&
        new Date(`${dateStr} 00:00:00`) <= new Date(event.end),
    );

    selectedEventDay.value = { date: dateStr, events: findEvent };
    selectedElementDay.value = nativeEvent.target;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => (selectedOpenDay.value = true)),
    );
  };

  if (selectedOpenDay.value) {
    selectedOpenDay.value = false;
    requestAnimationFrame(() => requestAnimationFrame(() => open()));
  } else {
    open();
  }

  nativeEvent.stopPropagation();
}

function formatDateTime(date: Date, timeZone = "UTC") {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  };

  return new Intl.DateTimeFormat("en-CA", options)
    .format(date)
    .replace(", ", " ");
}

function getEvents() {
  const temp = props.eventsItems || [];

  events.value = temp.map((event) => {
    const start = formatDateTime(new Date(event.startDate));
    const end = formatDateTime(new Date(event.endDate));

    return {
      ...event,
      name: event.title,
      start,
      end,
      timed: true,
    };
  });
}

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: "dayGridMonth",
  headerToolbar: false,
  height: "auto",
  dayMaxEvents: 2,
  navLinks: false,
  events: events.value.map((event) => ({
    id: String(event.id),
    title: event.name,
    start: event.start,
    end: event.end,
    backgroundColor: event.color,
    borderColor: event.color,
    extendedProps: { source: event },
  })),
  // eventContent(arg) {
  //   const source = arg.event.extendedProps.source;
  //   const timeLabel = eventTimeLabel(source);

  //   return {
  //     html: `<div class="event-pill text-truncate" style="background-color:${source.color}"><span class="event-pill-time">${timeLabel}</span>${source.name ?? ""}</div>`,
  //   };
  // },
  eventClassNames({ event: calendarEvent }) {
    const source = calendarEvent.extendedProps.source;
    const colorName = source.color;
    

    return [
      // Background Color
      `bg-light-${colorName} text-${colorName}`,
    ];
  },
  eventClick(info) {
    info.jsEvent.preventDefault();
    showEvent({
      nativeEvent: info.jsEvent as MouseEvent,
      event: info.event.extendedProps.source,
    });
  },
  dateClick(info) {
    const dateStr = info.dateStr;
    const canCreate =
      props.isAdmin &&
      (userInfo.value?.role !== "user" || permission.value?.create);

    const dayEvents = events.value.filter(
      (event) =>
        new Date(event.start) <= new Date(`${dateStr} 23:59:59`) &&
        new Date(`${dateStr} 00:00:00`) <= new Date(event.end),
    );

    if (canCreate && dayEvents.length === 0) {
      selectedEventDay.value = { date: dateStr, events: [] };
      openDialog();
      return;
    }

    viewDay({ nativeEvent: info.jsEvent as MouseEvent, dateStr });
  },
  datesSet(info) {
    calendarTitle.value = info.view.title;
  },
}));

async function fetchStudentsForClass(classId: string) {
  if (!classId) return;

  loadingStudents.value = true;
  try {
    const { data } = await axios.get(`/classes/${classId}`);

    classStudents[classId] = data.classStudent || [];
  } catch (error) {
    console.error("Error fetching students for class:", error);
  } finally {
    loadingStudents.value = false;
  }
}

function getStudentsInClass(cls: any) {
  if (!cls) return [];

  const students = classStudents[cls.id];

  if (!students || students.length === 0) return [];

  return students.filter((student) => student.account?.name);
}

function dateToYMD(dateParam: string) {
  const date = new Date(dateParam);

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function dateToYMDShort(dateParam: string, year = false) {
  const date = new Date(dateParam);

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: year ? "numeric" : undefined,
  });
}

async function onDeleteEvent() {
  const { isConfirmed } = await Swal.fire({
    title: "Are you sure?",
    text: "Once deleted, you will not be able to recover this data!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  });

  if (!isConfirmed) return;

  try {
    const { data } = await axios.delete(
      `/classEvents/${selectedEvent.value.id}`,
    );

    Swal.fire(data?.message, "", "success");
    selectedEvent.value = {};
    emit("fetchEvents");
  } catch (error) {
    showApiError(error);
  }
}

watch(
  selectedClass,
  async (newClass) => {
    formInput.title = newClass?.name;
    formInput.link = newClass?.link;

    if (newClass?.id) await fetchStudentsForClass(newClass.id);
  },
  { immediate: true },
);

watch(
  () => props.eventsItems,
  (val) => {
    if (val) getEvents();
  },
  { immediate: true },
);

watch(branch, (val) => {
  if (val) emit("fetchEvents", val);
});

watch(dialog, (val) => {
  if (!val) {
    formCreateClass.value?.reset();
    selectedClass.value = {};
    selectedOpen.value = false;
  }
});

onMounted(() => {
  if (props.isAdmin) fetchOption();

  nextTick(() => {
    calendarApi.value = calendarRef.value?.getApi() || null;
    calendarTitle.value = calendarApi.value?.view.title || "";
  });
});
</script>

<template>
  <div class="fill-height">
    <VCard rounded="lg" elevation="1" class="pa-4 calendar-card">
      <VRow align="center" no-gutters class="calendar-toolbar mb-2">
        <VCol class="d-flex align-center ga-2">
          <VBtn
            variant="outlined"
            color="primary"
            rounded="lg"
            @click="setToday"
          >
            Today
          </VBtn>
          <VBtnToggle
            v-model="type"
            mandatory
            rounded="lg"
            color="primary"
            variant="text"
            density="compact"
            divided
          >
            <VBtn value="week"> Week </VBtn>
            <VBtn value="month"> Month </VBtn>
          </VBtnToggle>
        </VCol>
        <VCol class="d-flex align-center justify-center ga-1 my-2 my-sm-0">
          <VBtn
            icon="tabler-chevron-left"
            variant="text"
            size="small"
            @click="prev"
          />
          <h3 class="font-weight-bold px-2">
            {{ calendarTitle }}
          </h3>
          <VBtn
            icon="tabler-chevron-right"
            variant="text"
            size="small"
            @click="next"
          />
        </VCol>
        <VCol>
          <div class="d-flex align-end ga-2">
            <AppSelect
              v-if="isAdmin"
              v-model="branch"
              label="Branch"
              :items="itemsOptions.branch"
              item-title="name"
              item-value="id"
              density="compact"
              rounded="lg"
              hide-details
              clearable
            />
          </div>
        </VCol>
      </VRow>

      <FullCalendar ref="calendarRef" :options="calendarOptions" />
    </VCard>

    <VMenu
      v-model="selectedOpenDay"
      :close-on-content-click="false"
      :activator="selectedElementDay"
      offset-x
    >
      <VCard min-width="450px" flat>
        <VCardTitle>
          {{ dateToYMD(selectedEventDay?.date) }}
          <VSpacer />
          <VBtn
            v-if="isAdmin && (userInfo?.role !== 'user' || permission?.create)"
            color="primary"
            size="x-small"
            icon
            @click.stop="openDialog"
          >
            <VIcon>tabler-plus</VIcon>
          </VBtn>
        </VCardTitle>
        <VCardText>
          <VList>
            <VListItem
              v-for="event in selectedEventDay.events"
              :key="event.name"
              @click="showEvent({ nativeEvent: $event, event })"
            >
              <div class="d-flex flex-row" style="width: 100%">
                <div class="d-flex flex-column">
                  <h6 class="text-h5">
                    {{
                      new Date(event.start).toLocaleTimeString("en-US", {
                        hourCycle: "h23",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }}
                  </h6>
                  <span class="text-body-2">
                    {{
                      new Date(event.end).toLocaleTimeString("en-US", {
                        hourCycle: "h23",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }}
                  </span>
                </div>
                <VDivider
                  vertical
                  class="mx-4"
                  :style="`border: 3px solid; color: ${event.color};`"
                />
                <div class="d-flex flex-column" style="max-width: 250px">
                  <h6 class="text-h5 d-inline-block text-truncate">
                    {{ event.name }}
                  </h6>
                  <small class="text-caption text-truncate">
                    {{ event?.class?.studyPlatform }}, {{ event?.link }}
                  </small>
                </div>
                <VSpacer />
                <VAvatar :color="event.color" size="30">
                  <span class="text-white text-h5 text-uppercase">
                    {{ event?.updatedBy?.name[0] }}
                  </span>
                </VAvatar>
              </div>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
    </VMenu>

    <VMenu
      v-model="selectedOpen"
      :close-on-content-click="false"
      :activator="selectedElement"
      offset-x
    >
      <VCard width="350px" flat>
        <VCardTitle class="pb-0">
          <VSpacer />
          <VMenu v-if="isAdmin">
            <template #activator="{ props: menuProps }">
              <VBtn icon size="small" v-bind="menuProps">
                <VIcon>tabler-dots-vertical</VIcon>
              </VBtn>
            </template>

            <VList density="compact">
              <template
                v-for="(menuItem, i) in [
                  {
                    title: 'Edit',
                    show: userInfo?.role !== 'user' || permission?.edit,
                    onClick: onEditEvent,
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
                <VListItem
                  v-if="menuItem?.show"
                  :key="i"
                  @click="menuItem.onClick"
                >
                  <VListItemTitle>{{ menuItem.title }}</VListItemTitle>
                </VListItem>
              </template>
            </VList>
          </VMenu>
        </VCardTitle>

        <VCardText>
          <VRow justify="center" dense>
            <VCol cols="auto">
              <h4 class="text-h4 text-center text-truncate">
                {{ selectedEvent.name }}
              </h4>
            </VCol>
          </VRow>
          <VRow justify="center" align="center" dense>
            <VCol cols="auto">
              <h6 class="text-h5">
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
            </VCol>
            <VCol cols="auto">
              <VIcon color="primary" size="large"> tabler-chevron-right </VIcon>
            </VCol>
            <VCol cols="auto">
              <h6 class="text-h5">
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
            </VCol>
          </VRow>
          <VDivider class="my-4" />
          <VRow dense>
            <VCol cols="12" class="d-flex align-center">
              <VIcon color="primary"> tabler-device-desktop </VIcon>
              <span class="text-subtitle-2 mx-2">Platform :</span>
              <span>{{ selectedEvent?.class?.studyPlatform }}</span>
            </VCol>
            <VCol cols="12" class="align-center">
              <VRow dense>
                <VCol cols="auto">
                  <VIcon color="primary"> tabler-link </VIcon>
                  <span class="text-subtitle-2 mx-2">Link :</span>
                </VCol>
                <VCol cols="">
                  <a :href="selectedEvent?.link" target="_blank" rel="noopener noreferrer">
                    {{ selectedEvent?.link }}
                  </a>
                </VCol>
              </VRow>
            </VCol>
            <VCol cols="12" class="d-flex align-center">
              <VIcon color="primary"> tabler-clock </VIcon>
              <span class="text-subtitle-2 mx-2">Teacher in class :</span>
              <span>{{ selectedEvent?.class?.teacher?.name }}</span>
            </VCol>
            <VCol cols="12" class="d-flex flex-wrap align-center">
              <VIcon color="primary"> tabler-clock-edit </VIcon>
              <span class="text-subtitle-2 mx-2">Student in class :</span>

              <template v-if="selectedEvent?.class?.classStudent?.length === 1">
                <VChip
                  size="small"
                  color="primary"
                  variant="outlined"
                  class="ml-2"
                >
                  {{ selectedEvent.class.classStudent[0].account.name }}
                </VChip>
              </template>
              <template v-else>
                <div class="mt-2">
                  <VChip
                    v-for="(student, index) in selectedEvent?.class
                      ?.classStudent"
                    :key="index"
                    class="ma-1"
                    size="small"
                    color="primary"
                    variant="outlined"
                  >
                    {{ student.account.name }}
                  </VChip>
                </div>
              </template>
            </VCol>
          </VRow>

          <VRow justify="center" dense>
            <VCol cols="auto">
              <small>{{ selectedEvent?.note }}</small>
            </VCol>
          </VRow>

          <VRow justify="center" dense>
            <VCol cols="auto">
              <small>{{ dateToYMDShort(selectedEvent.updatedAt, true) }}</small>
            </VCol>
          </VRow>
          <VRow justify="center" dense>
            <VCol cols="auto">
              <VAvatar :color="selectedEvent.color" size="20">
                <span class="text-white text-h5 text-uppercase">
                  {{ selectedEvent?.updatedBy?.name[0] }}
                </span>
              </VAvatar>
              <small class="pl-2">Event created</small>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VMenu>

    <VDialog v-model="dialog" max-width="550" persistent :retain-focus="false">
      <VCard>
        <VCardText class="pa-6">
          <VForm ref="formCreateClass">
            <VRow dense>
              <VCol cols="12">
                <AppTextField
                  v-model="formInput.title"
                  density="compact"
                  single-line
                  hide-details="auto"
                  placeholder="Enter title"
                  :rules="[(v: string) => !!v || 'Title is required']"
                />
              </VCol>
              <VCol cols="12" class="d-flex align-center">
                <VIcon color="primary"> tabler-hours-24 </VIcon>
                <span class="text-subtitle-2 mx-2">Class No :</span>
                <AppAutocomplete
                  v-model="selectedClass"
                  :items="itemsOptions.class"
                  :item-title="(item: any) => `${item.name}`"
                  return-object
                  placeholder="Select class"
                  density="compact"
                  single-line
                  hide-details="auto"
                  :rules="[(v: any) => !!v || 'Class is required']"
                />
              </VCol>
              <VCol cols="12" class="d-flex align-center">
                <VIcon color="primary"> tabler-calendar </VIcon>
                <span class="text-subtitle-2 mx-2">Starts :</span>
                <div class="ml-auto d-flex align-center">
                  <VChip class="mx-2" size="small" label>
                    {{ dateToYMDShort(formInput.startDate, true) }}
                  </VChip>
                  <AppDateTimePicker
                    v-model="formInput.startTime"
                    placeholder="Select time"
                    density="compact"
                    :config="{
                      enableTime: true,
                      noCalendar: true,
                      dateFormat: 'H:i',
                      time_24hr: true,
                    }"
                    style="width: 80px"
                  />
                </div>
              </VCol>
              <VCol cols="12" class="d-flex align-center">
                <VIcon color="primary"> tabler-calendar </VIcon>
                <span class="text-subtitle-2 mx-2">End :</span>
                <div class="ml-auto d-flex align-center">
                  <VChip class="mx-2" size="small" label>
                    {{ dateToYMDShort(formInput.endDate, true) }}
                  </VChip>
                  <AppDateTimePicker
                    v-model="formInput.endTime"
                    placeholder="Select time"
                    density="compact"
                    :config="{
                      enableTime: true,
                      noCalendar: true,
                      dateFormat: 'H:i',
                      time_24hr: true,
                    }"
                    style="width: 80px"
                  />
                </div>
              </VCol>
              <VCol cols="12" class="d-flex align-center">
                <VIcon color="primary"> tabler-home </VIcon>
                <span class="text-subtitle-2 mx-2">Branch :</span>
                <span>{{ selectedClass?.branch?.name }}</span>
              </VCol>
              <VCol cols="12" class="d-flex align-center">
                <VIcon color="primary"> tabler-device-desktop </VIcon>
                <span class="text-subtitle-2 mx-2">Platform :</span>
                <span>{{ selectedClass?.studyPlatform }}</span>
              </VCol>
              <VCol cols="12" class="d-flex align-center">
                <VIcon color="primary"> tabler-link </VIcon>
                <span class="text-subtitle-2 mx-2">Link :</span>
                <AppTextField
                  v-model="formInput.link"
                  density="compact"
                  single-line
                  hide-details="auto"
                  :rules="[(v: string) => !!v || 'Link is required']"
                />
              </VCol>
              <VCol cols="12" class="d-flex align-center">
                <VIcon color="primary"> tabler-clock </VIcon>
                <span class="text-subtitle-2 mx-2">Teacher in class :</span>
                <span>{{ selectedClass?.teacher?.name }}</span>
              </VCol>
              <VCol cols="12" class="d-flex flex-wrap align-center">
                <VIcon color="primary"> tabler-clock-edit </VIcon>
                <span class="text-subtitle-2 mx-2">Student in class :</span>

                <template v-if="loadingStudents">
                  <span style="color: orange">
                    <VProgressCircular
                      indeterminate
                      size="16"
                      width="2"
                      class="mr-2"
                    />
                    Loading students...
                  </span>
                </template>
                <template
                  v-else-if="getStudentsInClass(selectedClass).length === 1"
                >
                  <VChip
                    size="small"
                    color="primary"
                    variant="outlined"
                    class="ml-2"
                  >
                    {{ getStudentsInClass(selectedClass)[0].account.name }}
                  </VChip>
                </template>
                <template
                  v-else-if="getStudentsInClass(selectedClass).length > 1"
                >
                  <VChip
                    v-for="student in getStudentsInClass(selectedClass)"
                    :key="student.id"
                    size="small"
                    color="primary"
                    variant="outlined"
                    class="ma-1"
                  >
                    {{ student.account.name }}
                  </VChip>
                </template>
                <template v-else>
                  <span style="color: grey">No students in this class</span>
                </template>
              </VCol>
              <VCol cols="12" class="d-flex align-center">
                <VIcon color="primary"> tabler-tag </VIcon>
                <span class="text-subtitle-2 mx-2">Coral pink :</span>

                <VItemGroup v-model="formInput.color">
                  <VItem
                    v-for="(color, i) in calendarsColor"
                    :key="i"
                    v-slot="{ isSelected, toggle }"
                    :value="color"
                  >
                    <VChip class="ma-1" :color="color" @click="toggle" variant="tonal">
                
                      <VIcon v-if="isSelected" size="small">
                        tabler-check
                      </VIcon>
                    </VChip>
                  </VItem>
                </VItemGroup>
              </VCol>
              <VCol cols="12">
                <VAvatar :color="formInput.color" size="30">
                  <span class="text-white text-h5 text-uppercase">
                    {{ userInfo?.username?.[0] }}
                  </span>
                </VAvatar>
              </VCol>
              <VCol cols="12">
                <AppTextarea
                  v-model="formInput.note"
                  label="Note"
                  density="compact"
                  single-line
                  hide-details="auto"
                  placeholder="Enter note"
                  rows="2"
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn color="error" @click="dialog = false"> Cancel </VBtn>
          <VBtn color="primary" @click="createClassEvent"> Save </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <VDialog v-model="dialogCopyClass" persistent width="290px">
      <VDatePicker
        v-model="selectedDate"
        multiple
        show-adjacent-months
        :min="new Date().toISOString().substring(0, 10)"
      >
        <template #actions>
          <VBtn variant="text" color="error" @click="dialogCopyClass = false">
            Cancel
          </VBtn>
          <VBtn
            :disabled="!selectedDate?.length"
            variant="text"
            color="primary"
            @click="copyClassEvent"
          >
            OK
          </VBtn>
        </template>
      </VDatePicker>
    </VDialog>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/libs/full-calendar";
</style>
