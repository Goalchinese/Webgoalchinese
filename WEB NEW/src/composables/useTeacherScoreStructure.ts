import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "@/composables/useAuth";

interface ValidatableForm {
  validate: () => Promise<{ valid: boolean }>;
}

interface Permission {
  link?: string;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
}

interface ScoreStructureItem {
  id?: number;
  updateDate: string;
  totalPoint: number | null;
  pointUp: number | null;
  pointDown: number | null;
  pointAfterUpdate: string | number | null;
  resonalForUpdate: string | null;
  updateBy: number | null;
  [key: string]: unknown;
}

type TeacherScoreStructureEmit = (
  event: "input" | "refForm",
  value: unknown
) => void;

export function useTeacherScoreStructure(emit: TeacherScoreStructureEmit) {
  const route = useRoute();
  const { userInfo } = useAuth();

  const permission = ref<Permission | undefined>();
  const itemsScoreStruture = ref<ScoreStructureItem[]>([]);
  const defaultValue: ScoreStructureItem = {
    updateDate: "",
    totalPoint: null,
    pointUp: null,
    pointDown: null,
    pointAfterUpdate: "",
    resonalForUpdate: null,
    updateBy: null,
  };

  const formPoint = ref<ValidatableForm[]>([]);

  const getPointStructure = async () => {
    try {
      const { data } = await axios.get(
        `/pointStructure/account/${route.params.id}`
      );
      itemsScoreStruture.value = data.map((it: ScoreStructureItem) => {
        return {
          ...it,
          updateDate: it.updateDate.substring(0, 10),
        };
      });
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

  const addFeeStructure = () => {
    itemsScoreStruture.value.push({ ...defaultValue });
  };

  const saveScorestructure = async (
    id: number | undefined,
    item: ScoreStructureItem,
    index: number
  ) => {
    const { valid: __validPoint } = await formPoint.value[index].validate();
    if (!__validPoint) return;
    try {
      let res: { data?: { message?: string } } = {};
      if (id) {
        res = await axios.put(`/pointStructure/${id}`, {
          ...item,
          accountID: Number(route.params.id),
        });
      } else {
        res = await axios.post(`/pointStructure`, {
          ...item,
          accountID: Number(route.params.id),
          updateBy: userInfo.value.accountID,
        });
      }

      Swal(res?.data?.message, "", "success");
      getPointStructure();
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

  const deleteScoreStructure = async (
    id: number | undefined,
    index: number
  ) => {
    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this data!",
      icon: "warning",
      showCancelButton: true,
    });

    if (!isConfirmed) return;
    try {
      if (id) {
        await axios.delete(`/pointStructure/${id}`);
        getPointStructure();
      } else {
        itemsScoreStruture.value.splice(index, 1);
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
    itemsScoreStruture,
    () => {
      emit("input", itemsScoreStruture.value);
    },
    { deep: true }
  );

  onMounted(async () => {
    if (route.params.id) {
      await getPointStructure();
    }

    if (itemsScoreStruture.value.length === 0) {
      addFeeStructure();
    }
    permission.value = userInfo.value.permissions.find(
      (it: Permission) => it.link === route.path
    );

    nextTick(() => {
      emit("refForm", formPoint.value);
    });
  });

  return {
    userInfo,
    permission,
    itemsScoreStruture,
    formPoint,
    addFeeStructure,
    saveScorestructure,
    deleteScoreStructure,
  };
}
