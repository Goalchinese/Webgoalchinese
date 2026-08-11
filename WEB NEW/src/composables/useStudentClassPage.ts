import { ref } from "vue";
import axios from "axios";
import { useAuth } from "@/composables/useAuth";
import { useSwal } from "@/composables/useSwal";
import iconStudent from "@/assets/images/student.png";

interface Attendance {
  id: number;
}

interface ClassItem {
  status: string;
  registeredTimes: number;
  attendance: Attendance[];
  studentLeave: number;
  inputStudentLeave: number;
}

export function useStudentClassPage() {
  const { userInfo: currentUser } = useAuth();
  const { showApiError } = useSwal();

  const baseUrl = import.meta.env.VITE_APP_API_IMAGE;

  const dataStudent = ref<any>({});
  const dataClass = ref<ClassItem[]>([]);
  const events = ref<any[]>([]);
  const totalClassTimes = ref(0);
  const totalAttendTimes = ref(0);
  const totalLeaveTimes = ref(0);
  const studentLeaveTimes = ref(0);

  const onFetchEvents = async () => {
    try {
      const userInfo = currentUser.value;
      const { data } = await axios.get(
        `/classEvents?studentId=${userInfo.accountID}`
      );
      events.value = data || [];
    } catch (error) {
      showApiError(error);
    }
  };

  const fetchDataById = async () => {
    try {
      const userInfo = currentUser.value;
      const { data } = await axios.get(`/account/${userInfo.accountID}`);
      dataStudent.value = data;
    } catch (error) {
      showApiError(error);
    }
  };

  const onFetchClassByStudentId = async () => {
    try {
      const userInfo = currentUser.value;
      const { data } = await axios.get(`/classes/student/${userInfo.accountID}`);
      dataClass.value = data.filter((item: ClassItem) => item.status === "Active");
      totalClassTimes.value = dataClass.value.reduce((acc, cur) => {
        return acc + cur.registeredTimes;
      }, 0);
      totalAttendTimes.value = dataClass.value.reduce((acc, cur) => {
        return acc + cur.attendance.length;
      }, 0);
      totalLeaveTimes.value = dataClass.value.reduce((acc, cur) => {
        return acc + cur.studentLeave;
      }, 0);
      studentLeaveTimes.value = dataClass.value.reduce((acc, cur) => {
        return acc + cur.inputStudentLeave;
      }, 0);
    } catch (error) {
      showApiError(error);
    }
  };

  fetchDataById();
  onFetchEvents();
  onFetchClassByStudentId();

  return {
    iconStudent,
    baseUrl,
    dataStudent,
    dataClass,
    events,
    totalClassTimes,
    totalAttendTimes,
    totalLeaveTimes,
    studentLeaveTimes,
    onFetchEvents,
    fetchDataById,
    onFetchClassByStudentId,
  };
}
