import { ref, computed, watch, onMounted, nextTick } from "vue";
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

interface ScoreStructureItem {
  id?: number;
  updateDate: string;
  totalPoint: number | null;
  pointUp: number | null;
  pointDown: number | null;
  pointAfterUpdate: string | number | null;
  resonalForUpdate: string | null;
  updateBy: number | null;
}

type ScoreStructureEmit = (event: "input" | "refForm", value?: unknown) => void;

export function useStudentScoreStructure(emit: ScoreStructureEmit) {
  const route = useRoute();
  const { userInfo } = useAuth();
  const { showApiError } = useSwal();

  const permission = ref<Permission>({});
  const itemsScoreStruture = ref<ScoreStructureItem[]>([]);
  const formPoint = ref<ValidatableForm[]>([]);

  const defaultValue: ScoreStructureItem = {
    updateDate: "",
    totalPoint: null,
    pointUp: null,
    pointDown: null,
    pointAfterUpdate: "",
    resonalForUpdate: null,
    updateBy: null,
  };

  const isNotFound = (error: unknown) => {
    const axiosError = error as { response?: { status?: number } };
    return axiosError.response?.status === 404;
  };

  const getPointStructure = async () => {
    try {
      const { data } = await axios.get(
        `/pointStructure/account/${route.params.id}`
      );
      itemsScoreStruture.value = data.map(
        (it: ScoreStructureItem & { updateDate: string }) => ({
          ...it,
          updateDate: it.updateDate.substring(0, 10),
        })
      );
    } catch (error) {
      if (!isNotFound(error)) showApiError(error);
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
    if (!formPoint.value[index].validate()) return;
    try {
      let res;
      if (id) {
        res = await axios.put(`/pointStructure/${id}`, {
          ...item,
          accountID: Number(route.params.id),
        });
      } else {
        res = await axios.post(`/pointStructure`, {
          ...item,
          accountID: Number(route.params.id),
          updateBy: userInfo.value?.accountID,
        });
      }

      Swal.fire(res?.data?.message, "", "success");
      getPointStructure();
    } catch (error) {
      if (!isNotFound(error)) showApiError(error);
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
      if (!isNotFound(error)) showApiError(error);
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
    permission.value = userInfo.value?.permissions?.find(
      (it: Permission) => it.link === "/admin/student/point"
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
