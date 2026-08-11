import { computed, reactive, ref, watch, onMounted } from "vue";
import axios from "axios";
import { useAuth } from "@/composables/useAuth";
import { useSwal } from "@/composables/useSwal";

export interface ClassFormItem {
  checkList?: string;
  classStudent?: Array<{ accountID: number }>;
  classStudy?: Array<{
    day: string;
    startTime: string;
    endTime: string;
    note: string;
  }>;
  expireDate?: string;
  [key: string]: unknown;
}

export interface ClassFormProps {
  editItems?: ClassFormItem;
  flagEdit?: boolean;
  flagView?: boolean;
}

export type ClassFormEmit = (event: "input", value: Record<string, unknown>) => void;

export function useClassForm(props: ClassFormProps, emit: ClassFormEmit) {
  const { userInfo } = useAuth();
  const { showApiError } = useSwal();

  const menu = ref(false);
  const menu2 = ref(false);
  const menuTime = ref(false);
  const time = ref(null);
  const date = ref(null);

  const notExpired = ref(false);

  const selectedCheckList = ref<number[]>([]);
  const isLoadingTeachers = ref(false);
  const isLoadingStudents = ref(false);
  const checkList = ref([
    "Send metarials to students",
    "Send study link to students",
    "Send study link to teacher",
    "Send study link to admin",
  ]);

  const formInput = reactive<{ [key: string]: unknown; status: string }>({
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
  });

  const selectedStudent = ref<number[]>([]);

  const statusList = ref([
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
  ]);

  const itemsRef = ref([]);
  const itemsRef2 = ref([]);

  const itemsTimes = reactive([
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
  ]);

  const itemsOptions = reactive<{
    materialType: unknown[];
    classType: unknown[];
    branch: unknown[];
    teacher: unknown[];
    student: unknown[];
    currency: unknown[];
  }>({
    materialType: [],
    classType: [],
    branch: [],
    teacher: [],
    student: [],
    currency: [],
  });

  const feePermission = ref<Record<string, unknown>>({});

  const emitData = () => {
    const classStudyData = itemsTimes
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

    emit("input", {
      ...formInput,
      checkList: selectedCheckList.value.join(","),
      classStudy: classStudyData,
      classStudent: selectedStudent.value,
      updateBy: (userInfo.value as { accountID?: unknown })?.accountID,
    });
  };

  const fetchOption = async () => {
    try {
      const { data: dataMaterialType } = await axios.get(`/materialType`);
      itemsOptions.materialType = dataMaterialType;

      const { data: dataClassType } = await axios.get(`/classType`);
      itemsOptions.classType = dataClassType;

      const { data: dataBranch } = await axios.get(`/branch`);
      itemsOptions.branch = dataBranch;

      const { data: dataCurrency } = await axios.get(`/currency`);
      itemsOptions.currency = dataCurrency;

      // Fetch teachers with loading state
      isLoadingTeachers.value = true;
      const { data: dataTeacher } = await axios.get(
        `/account?role=teacher&limit=1000`
      );
      itemsOptions.teacher = dataTeacher.data || [];
      isLoadingTeachers.value = false;

      // Fetch students with loading state
      isLoadingStudents.value = true;
      const { data: dataStudent } = await axios.get(
        `/account?role=student&limit=1000`
      );
      itemsOptions.student = dataStudent.data || [];
      isLoadingStudents.value = false;
    } catch (error) {
      isLoadingTeachers.value = false;
      isLoadingStudents.value = false;
      showApiError(error);
    }
  };

  watch(
    formInput,
    () => {
      emitData();
    },
    { deep: true }
  );

  watch(
    itemsTimes,
    () => {
      emitData();
    },
    { deep: true }
  );

  watch(
    selectedCheckList,
    () => {
      emitData();
    },
    { deep: true }
  );

  watch(
    selectedStudent,
    () => {
      emitData();
    },
    { deep: true }
  );


  watch(
    () => props.editItems,
    (editItems) => {
      if (editItems && Object.keys(editItems).length !== 0) {
        Object.assign(formInput, editItems);

        selectedCheckList.value = (editItems.checkList || "")
          .split(",")
          .map((it) => parseInt(it));

        selectedStudent.value = (editItems.classStudent || []).map(
          (it) => it.accountID
        );

        itemsTimes.forEach((item, index) => {
          const find = (editItems.classStudy || []).find(
            (it) => it.day === item.text
          );
          if (find) {
            itemsTimes[index] = {
              ...item,
              checked: true,
              startTime: find.startTime,
              endTime: find.endTime,
              note: find.note,
            };
          }
        });

        if (editItems.expireDate === "") {
          notExpired.value = true;
        }
      }
    },
    { deep: true }
  );

  onMounted(() => {
    fetchOption();
    feePermission.value = (
      userInfo.value as { permissions?: Array<{ link?: string }> }
    )?.permissions?.find((it) => it.link === "/admin/classes/fee") as Record<
      string,
      unknown
    >;
  });

  return {
    menu,
    menu2,
    menuTime,
    time,
    date,
    notExpired,
    selectedCheckList,
    isLoadingTeachers,
    isLoadingStudents,
    checkList,
    formInput,
    selectedStudent,
    statusList,
    itemsRef,
    itemsRef2,
    itemsTimes,
    itemsOptions,
    feePermission,
    userInfo,
    fetchOption,
    emitData,
  };
}
