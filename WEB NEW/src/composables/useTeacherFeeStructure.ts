import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "@/composables/useAuth";

interface ValidatableForm {
  validate: () => Promise<{ valid: boolean }>;
}

interface FeeStructureItem {
  id?: number;
  updateDate: string;
  salaryForGroupClass: string;
  salaryForPrivateClass: string;
  note: string;
  [key: string]: unknown;
}

interface Permission {
  link?: string;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
}

type TeacherFeeStructureEmit = (event: "input" | "refForm", value: unknown) => void;

export function useTeacherFeeStructure(emit: TeacherFeeStructureEmit) {
  const route = useRoute();
  const { userInfo } = useAuth();

  const permission = ref<Permission | undefined>();
  const itemsFeeStruture = ref<FeeStructureItem[]>([]);
  const defaultValue: FeeStructureItem = {
    updateDate: "",
    salaryForGroupClass: "",
    salaryForPrivateClass: "",
    note: "",
  };

  const formFee = ref<ValidatableForm[]>([]);

  const getFeeStructure = async () => {
    try {
      const { data } = await axios.get(
        `/feeStructure/account/${route.params.id}`
      );
      itemsFeeStruture.value = data.map((it: FeeStructureItem) => {
        return {
          ...it,
          updateDate: it.updateDate.substring(0, 10),
        };
      });
    } catch (error) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: { error?: string; details?: { message?: string }[] };
        };
      };
      if (axiosError.response?.status !== 404)
        Swal.fire({
          title: axiosError.response?.data?.error,
          text: axiosError.response?.data?.details
            ?.map((it) => it.message)
            .join("\n"),
          icon: "error",
        });
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
    const { valid: __validFee } = await formFee.value[index].validate();
    if (!__validFee) return;
    try {
      let res: { data?: { message?: string } } = {};
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

      Swal(res?.data?.message, "", "success");
      getFeeStructure();
    } catch (error) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: { error?: string; details?: { message?: string }[] };
        };
      };
      if (axiosError.response?.status !== 404)
        Swal.fire({
          title: axiosError.response?.data?.error,
          text: axiosError.response?.data?.details
            ?.map((it) => it.message)
            .join("\n"),
          icon: "error",
        });
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
      const axiosError = error as {
        response?: {
          status?: number;
          data?: { error?: string; details?: string };
        };
      };
      if (axiosError.response?.status !== 404)
        Swal.fire({
          title: axiosError.response?.data?.error,
          text: axiosError.response?.data?.details,
          icon: "error",
        });
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
    if (route.params.id) {
      await getFeeStructure();
    }

    if (itemsFeeStruture.value.length === 0) {
      addFeeStructure();
    }
    permission.value = userInfo.value.permissions.find(
      (it: Permission) => it.link === route.path
    );

    nextTick(() => {
      emit("refForm", formFee.value);
    });
  });

  return {
    userInfo,
    permission,
    itemsFeeStruture,
    formFee,
    addFeeStructure,
    saveFeestructure,
    deleteFeeStructure,
  };
}
