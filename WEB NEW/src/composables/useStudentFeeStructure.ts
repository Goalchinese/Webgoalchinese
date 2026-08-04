import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "@/composables/useAuth";
import { useSwal } from "@/composables/useSwal";

interface FeeStructureItem {
  id?: number;
  payDate: string;
  classType: string;
  branch: string;
  amount: number | string | null;
  classFee: number | string | null;
  discount: number | string | null;
  note: string;
  [key: string]: unknown;
}

interface ValidatableForm {
  validate: () => Promise<{ valid: boolean }>;
}

interface FeeStructureProps {
  flagView?: boolean;
  flagCreate?: boolean;
}

interface FeeStructureEmits {
  (e: "input", value: FeeStructureItem[]): void;
  (e: "refForm", value: ValidatableForm[]): void;
}

export function useStudentFeeStructure(
  props: FeeStructureProps,
  emit: FeeStructureEmits
) {
  const route = useRoute();
  const { userInfo } = useAuth();
  const { showApiError } = useSwal();

  const formFee = ref<ValidatableForm[]>([]);
  const permission = ref<Record<string, unknown>>({});
  const itemsFeeStruture = ref<FeeStructureItem[]>([]);

  const defaultValue: FeeStructureItem = {
    payDate: "",
    classType: "",
    branch: "",
    amount: null,
    classFee: null,
    discount: null,
    note: "",
  };

  const itemsOptions = ref({
    branch: [] as Record<string, unknown>[],
    classType: [] as Record<string, unknown>[],
  });

  const fetchOption = async () => {
    try {
      const { data: dataBranch } = await axios.get(`/branch`);
      itemsOptions.value.branch = dataBranch;

      const { data: dataClassType } = await axios.get(`/classType`);
      itemsOptions.value.classType = dataClassType;
    } catch (error) {
      showApiError(error);
    }
  };

  const getFeeStructure = async () => {
    try {
      const { data } = await axios.get(
        `/feeStructure/account/${route.params.id}`
      );
      itemsFeeStruture.value = data.map((it: FeeStructureItem) => {
        return {
          ...it,
          payDate: (it.payDate as string).substring(0, 10),
        };
      });
    } catch (error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status !== 404) showApiError(error);
    }
  };

  const addFeeStructure = () => {
    itemsFeeStruture.value.push({ ...defaultValue });
  };

  const saveFeestructure = async (
    id: number | undefined,
    item: FeeStructureItem,
    index: number
  ) => {
    const { valid } = await formFee.value[index].validate();
    if (!valid) return;
    try {
      let res;
      if (id) {
        res = await axios.put(`/feeStructure/${id}`, {
          ...item,
          accountID: route.params.id,
        });
      } else {
        res = await axios.post(`/feeStructure`, {
          ...item,
          accountID: route.params.id,
        });
      }

      Swal.fire(res?.data?.message, "", "success");
      getFeeStructure();
    } catch (error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status !== 404) showApiError(error);
    }
  };

  const deleteFeeStructure = async (id: number | undefined, index: number) => {
    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this data!",
      icon: "warning",
      showCancelButton: true,
    });

    if (!isConfirmed) return;
    try {
      if (id) {
        await axios.delete(`/feeStructure/${id}`);
        getFeeStructure();
      } else {
        itemsFeeStruture.value.splice(index, 1);
      }
    } catch (error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status !== 404) showApiError(error);
    }
  };

  watch(
    itemsFeeStruture,
    () => {
      emit("input", itemsFeeStruture.value);
    },
    { deep: true }
  );

  onMounted(async () => {
    fetchOption();

    if (route.params.id) {
      await getFeeStructure();
    }

    if (itemsFeeStruture.value.length === 0) {
      addFeeStructure();
    }
    permission.value = userInfo.value?.permissions?.find(
      (it: { link?: string }) => it.link === "/admin/student/fee"
    );

    nextTick(() => {
      emit("refForm", formFee.value);
    });
  });

  return {
    userInfo,
    permission,
    itemsFeeStruture,
    itemsOptions,
    formFee,
    addFeeStructure,
    saveFeestructure,
    deleteFeeStructure,
  };
}
