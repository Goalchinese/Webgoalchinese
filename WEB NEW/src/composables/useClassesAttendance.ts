import { onMounted, ref, watch } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useSwal } from "@/composables/useSwal";

interface AttendanceEntry {
  status?: string;
  studyDate?: string;
  [key: string]: unknown;
}

export interface AttendanceClassItem {
  id: number;
  no: string;
  name: string;
  registeredTimes: number;
  attendance: AttendanceEntry[];
  inputTeacherLeave?: number;
  teacherLeave?: number;
  inputStudentLeave?: number;
  studentLeave?: number;
  classStudy?: Array<{ day: string; startTime: string; endTime: string }>;
  [key: string]: unknown;
}

interface AttendanceStatusOption {
  text: string;
  value: string;
  color: string;
}

export function useClassesAttendance() {
  const { showApiError } = useSwal();

  const dialog = ref(false);
  const menu2 = ref(false);
  const search = ref("");

  const headers = [
    {
      align: "start",
      key: "no",
      sortable: false,
      title: "Class No.",
      width: "10%",
    },
    { key: "name", title: "Class Name", width: "*" },
    { key: "studyDay", title: "Study day", width: "10%" },
    { key: "timeSlot", title: "Time slot", width: "12%" },
    { key: "teacherLeave", title: "Teacher leave", width: "5%" },
    { key: "studentLeave", title: "Student leave", width: "5%" },
    {
      key: "times",
      title: "Times",
      width: "*",
      class: "overflow-x-auto",
    },
    { key: "action", title: "Action", width: "5%" },
  ];

  const items = ref<AttendanceClassItem[]>([]);
  const date = new Date().toISOString().substring(0, 10);

  const statusList: AttendanceStatusOption[] = [
    {
      text: "None",
      value: "",
      color: "secondary",
    },
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
  ];

  const selectedStatus = ref("regular");
  const itemsAttendance = ref<AttendanceEntry[]>([]);
  const editClassID = ref<number | null>(null);
  const editTimeID = ref<number | null>(null);
  const editItem = ref<Record<string, unknown>>({
    studyDate: "",
    classId: null,
    status: "",
    note: "",
  });

  const formTeacherLeave = ref<any>(null);
  const formStudentLeave = ref<any>(null);
  const datePicker = ref<any>(null);

  const fetchData = async () => {
    try {
      const { data } = await axios.get(
        `/classes${search.value ? `?search=${search.value}` : ""}`,
        { params: { limit: 1000 } }
      );
      items.value = data.data || [];
    } catch (error) {
      showApiError(error);
    }
  };

  const resolveStatus = (status: string) => {
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
  };

  const showDialog = (classId: number, item: AttendanceEntry) => {
    editClassID.value = classId;
    editItem.value = {
      ...item,
      studyDate: new Date(item.studyDate as string).toISOString().substring(0, 10),
    };
    dialog.value = true;
  };

  const genarateTimes = (item: AttendanceClassItem) => {
    const times: AttendanceEntry[] = [];
    times.push(...item.attendance);
    for (let i = 0; i < item.registeredTimes - item.attendance.length; i++) {
      times.push({
        studyDate: new Date().toISOString().substring(0, 10),
        classId: null,
        status: "",
      });
    }
    return times;
  };

  const saveAttendance = async () => {
    try {
      if (editItem.value?.id) {
        await axios.put(`/attendances/${editItem.value?.id}`, {
          studyDate: editItem.value.studyDate,
          classId: editClassID.value,
          status: editItem.value.status,
          note: editItem.value.note,
        });
      } else {
        await axios.post(`/attendances`, {
          studyDate: editItem.value.studyDate,
          classId: editClassID.value,
          status: editItem.value.status,
          note: editItem.value.note,
        });
      }

      dialog.value = false;
      editClassID.value = null;
      editTimeID.value = null;
      editItem.value = {
        studyDate: "",
        classId: null,
        status: "",
      };
      selectedStatus.value = "regular";
      fetchData();
    } catch (error) {
      showApiError(error);
    }
  };

  const updateClass = async (id: number, item: Record<string, unknown>) => {
    if (item?.inputTeacherLeave) {
      if (!formTeacherLeave.value.validate()) return;
    }

    if (item?.inputStudentLeave) {
      if (!formStudentLeave.value.validate()) return;
    }

    try {
      const { data } = await axios.put(`/classes/${id}`, item);

      Swal.fire(data?.message, "", "success");
      fetchData();
    } catch (error) {
      showApiError(error);
    }
  };

  watch(search, () => {
    fetchData();
  });

  onMounted(() => {
    fetchData();
  });

  return {
    dialog,
    menu2,
    search,
    headers,
    items,
    date,
    statusList,
    selectedStatus,
    itemsAttendance,
    editClassID,
    editTimeID,
    editItem,
    formTeacherLeave,
    formStudentLeave,
    datePicker,
    fetchData,
    resolveStatus,
    showDialog,
    genarateTimes,
    saveAttendance,
    updateClass,
  };
}
