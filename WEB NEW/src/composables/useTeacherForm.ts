import { reactive, ref, watch, onMounted } from "vue";
import axios from "axios";
import { useRoute } from "vue-router";
import Swal from "sweetalert2";

interface TeacherFormInput {
  name: string;
  gender: string;
  dateOfBirth: string;
  username: string;
  password: string;
  phone: string;
  address: string;
  resumeNo: string;
  registerDate: string;
  scoreForKids: number | null;
  scoreForAdult: number | null;
  teacherTypeID: number | null;
  teacherNo: string;
  photo: File | File[] | null;
  avaliableForClass: string;
  language: string;
  note: string;
  status: string;
  [key: string]: unknown;
}

interface TeacherType {
  id?: number;
  name?: string;
  [key: string]: unknown;
}

type TeacherFormEmit = (
  event: "input" | "refFormFee" | "dataFormFee" | "refFormScore" | "dataFormScore",
  value: unknown
) => void;

interface TeacherFormProps {
  editItems: Record<string, unknown>;
}

export function useTeacherForm(props: TeacherFormProps, emit: TeacherFormEmit) {
  const route = useRoute();

  const pickerDOB = ref(false);
  const menuRegisterDateOpen = ref(false);
  const isSelectAll = ref(false);
  const age = ref(0);
  const showPassword = ref(false);

  const formInput = reactive<TeacherFormInput>({
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
  });

  const itemsOptions = reactive<{ teacherType: TeacherType[] }>({
    teacherType: [],
  });

  const formFeeStructure = ref<Record<string, unknown>[]>([]);
  const refFormFee = ref(null);
  const formScoreStructure = ref<Record<string, unknown>[]>([]);
  const refFormScore = ref(null);

  const calulateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let calculated = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      calculated--;
    }
    return calculated;
  };

  const fetchOption = async () => {
    try {
      const { data } = await axios.get(`/teacherType`);
      itemsOptions.teacherType = data;
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { error?: string; details?: string } };
      };
      Swal.fire({
        title: axiosError.response?.data?.error,
        text: axiosError.response?.data?.details,
        icon: "error",
      });
    }
  };

  const deletePhoto = async () => {
    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this data!",
      icon: "warning",
      showCancelButton: true,
    });

    if (!isConfirmed) return;

    // delete data from api
    try {
      const { data } = await axios.delete(`/account/image/${route.params.id}`);
      Swal(data?.message, "", "success");
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { error?: string; details?: string } };
      };
      Swal.fire({
        title: axiosError.response?.data?.error,
        text: axiosError.response?.data?.details,
        icon: "error",
      });
    }
  };

  watch(
    () => formInput.dateOfBirth,
    () => {
      if (formInput.dateOfBirth) {
        age.value = calulateAge(formInput.dateOfBirth);
      }
    }
  );

  watch(
    formInput,
    () => {
      emit("input", formInput);
      emit("refFormFee", refFormFee.value);
      emit("dataFormFee", formFeeStructure.value);
      emit("refFormScore", refFormScore.value);
      emit("dataFormScore", formScoreStructure.value);
    },
    { deep: true }
  );

  watch(
    () => props.editItems,
    () => {
      if (Object.keys(props.editItems).length !== 0) {
        Object.assign(formInput, props.editItems);
      }
    },
    { deep: true }
  );

  onMounted(() => {
    fetchOption();
  });

  return {
    pickerDOB,
    menuRegisterDateOpen,
    isSelectAll,
    age,
    showPassword,
    formInput,
    itemsOptions,
    formFeeStructure,
    refFormFee,
    formScoreStructure,
    refFormScore,
    fetchOption,
    deletePhoto,
  };
}
