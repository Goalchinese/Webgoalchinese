import { computed, reactive, ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "@/composables/useAuth";
import { useSwal } from "@/composables/useSwal";

interface ValidatableForm {
  validate: () => Promise<{ valid: boolean }>;
}

interface Permission {
  link?: string;
  view?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
}

interface StudentFormProps {
  editItems?: Record<string, unknown>;
  flagEdit?: boolean;
  flagView?: boolean;
  flagCreate?: boolean;
}

type StudentFormEmit = (
  event:
    | "input"
    | "refFormFee"
    | "dataFormFee"
    | "refFormScore"
    | "dataFormScore",
  value?: unknown
) => void;

// Same calculation as the `calulateAge` global helper registered in main.js,
// kept local here since this composable has no access to component globals.
const calulateAge = (dateOfBirth: string) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export function useStudentForm(props: StudentFormProps, emit: StudentFormEmit) {
  const route = useRoute();
  const { userInfo } = useAuth();
  const { showApiError } = useSwal();

  const pickerDOB = ref(false);
  const menuExpiredOpen = ref(false);
  const menuAddmissionOpen = ref(false);
  const menuEndClassOpen = ref(false);
  const isSelectAll = ref(false);
  const age = ref(0);
  const showPassword = ref(false);
  const notExpired = ref(false);

  const formInput = ref<Record<string, unknown>>({
    name: "",
    gender: "Male",
    dateOfBirth: "",
    username: "",
    password: "",
    expireDate: "",
    phone: "",
    address: "",
    schoolName: "",

    photo: null,
    addmissionDate: "",
    endClassDate: "",
    studentTypeID: "",
    classTypeID: "",
    addmissionNo: "",
    branchID: "",
    note: "",
    status: "Active",
  });

  const itemsOptions = reactive<{
    studentType: unknown[];
    classType: unknown[];
    branch: unknown[];
  }>({
    studentType: [],
    classType: [],
    branch: [],
  });

  const formFeeStructure = ref<Record<string, unknown>[]>([]);
  const refFormFee = ref<ValidatableForm[]>([]);
  const formScoreStructure = ref<Record<string, unknown>[]>([]);
  const refFormScore = ref<ValidatableForm[]>([]);

  const pointPermission = ref<Permission>({});
  const feePermission = ref<Permission>({});

  const fetchOption = async () => {
    try {
      const { data: dataStudentType } = await axios.get(`/studentType`);
      itemsOptions.studentType = dataStudentType;

      const { data: dataClassType } = await axios.get(`/classType`);
      itemsOptions.classType = dataClassType;

      const { data: dataBranch } = await axios.get(`/branch`);
      itemsOptions.branch = dataBranch;
    } catch (error) {
      showApiError(error);
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

    try {
      const { data } = await axios.delete(`/account/image/${route.params.id}`);
      Swal.fire(data?.message, "", "success");
      // @ts-expect-error - preserved from the original component: `fetchData` was
      // never defined there either, so this call has always thrown at runtime.
      fetchData();
    } catch (error) {
      showApiError(error);
    }
  };

  watch(
    () => formInput.value.dateOfBirth,
    () => {
      if (formInput.value.dateOfBirth) {
        age.value = calulateAge(formInput.value.dateOfBirth as string);
      }
    }
  );

  watch(
    formInput,
    () => {
      emit("input", formInput.value);
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
      if (props.editItems && Object.keys(props.editItems).length !== 0) {
        formInput.value = { ...props.editItems };

        if (props.editItems.expireDate === "") {
          notExpired.value = true;
        }
      }
    },
    { deep: true }
  );

  onMounted(() => {
    fetchOption();

    feePermission.value = userInfo.value?.permissions?.find(
      (it: Permission) => it.link === "/admin/student/fee"
    );
    pointPermission.value = userInfo.value?.permissions?.find(
      (it: Permission) => it.link === "/admin/student/point"
    );
  });

  return {
    pickerDOB,
    menuExpiredOpen,
    menuAddmissionOpen,
    menuEndClassOpen,
    isSelectAll,
    age,
    showPassword,
    notExpired,
    formInput,
    itemsOptions,
    formFeeStructure,
    refFormFee,
    formScoreStructure,
    refFormScore,
    pointPermission,
    feePermission,
    userInfo,
    deletePhoto,
  };
}
