import { computed, onMounted, reactive, ref, watch } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useSwal } from "@/composables/useSwal";
import { exportPdf } from "@/printOuts/class";

export const STUDY_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const STATUS_OPTIONS = ["Active", "Inactive"];
export const REMAINING_OPTIONS = [
  { title: "Expiring (≤ 2 left)", value: "expiring" },
  { title: "Not expiring", value: "notExpiring" },
];

interface ClassType {
  id: number;
  name: string;
}

export interface ClassItem {
  id: number;
  no: string;
  name: string;
  startDate?: string;
  registeredTimes: number;
  status?: string;
  classType?: { name: string };
  teacher?: { name: string };
  classStudy?: Array<{ day: string; startTime: string; endTime: string }>;
  attendance?: unknown[];
}

interface Pagination {
  page: number;
  itemsPerPage: number;
  total: number;
  totalPages: number;
}

export function useClassesAll() {
  const { showApiError } = useSwal();

  const search = ref("");
  const isLoading = ref(false);
  const items = ref<ClassItem[]>([]);
  const selectedClass = ref<ClassItem[]>([]);
  const classTypes = ref<ClassType[]>([]);

  const filters = reactive({
    classType: null as number | null,
    studyDay: null as string | null,
    remaining: null as string | null,
    status: null as string | null,
  });

  const pagination = reactive<Pagination>({
    page: 1,
    itemsPerPage: 10,
    total: 0,
    totalPages: 0,
  });

  const hasActiveFilters = computed(
    () =>
      !!filters.classType ||
      !!filters.studyDay ||
      !!filters.remaining ||
      !!filters.status ||
      !!search.value
  );

  const nearExpiryCount = computed(
    () =>
      items.value.filter((item) => {
        const remaining =
          (item.registeredTimes || 0) - (item?.attendance?.length || 0);
        return remaining <= 2;
      }).length
  );

  const showExpiryWarning = ref(true);
  watch(items, () => {
    showExpiryWarning.value = true;
  });

  const fetchClassTypes = async () => {
    try {
      const { data } = await axios.get("/classType");
      classTypes.value = data || [];
    } catch (error) {
      showApiError(error);
    }
  };

  const fetchData = async () => {
    isLoading.value = true;
    try {
      const limit =
        pagination.itemsPerPage === -1 ? 1000 : pagination.itemsPerPage;
      const params: Record<string, unknown> = {
        page: pagination.page,
        limit,
      };
      if (search.value) params.search = search.value;
      if (filters.classType) params.classType = filters.classType;
      if (filters.studyDay) params.studyDay = filters.studyDay;
      if (filters.remaining) params.remaining = filters.remaining;
      if (filters.status) params.status = filters.status;

      const { data } = await axios.get("/classes", { params });

      items.value = data.data || [];
      pagination.total = data.total || 0;
      pagination.totalPages = data.totalPages || 0;
    } catch (error) {
      showApiError(error);
    } finally {
      isLoading.value = false;
    }
  };

  const clearFilters = () => {
    filters.classType = null;
    filters.studyDay = null;
    filters.remaining = null;
    filters.status = null;
    search.value = "";
    pagination.page = 1;
    fetchData();
  };

  watch(search, () => {
    pagination.page = 1;
    fetchData();
  });

  watch(filters, () => {
    pagination.page = 1;
    fetchData();
  });

  const updatePagination = (options: { page: number; itemsPerPage: number }) => {
    pagination.page = options.page;
    pagination.itemsPerPage = options.itemsPerPage;
    fetchData();
  };

  const deleteData = async (id: number) => {
    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this data!",
      icon: "warning",
      showCancelButton: true,
    });
    if (!isConfirmed) return;

    try {
      const { data } = await axios.delete(`/classes/${id}`);
      Swal.fire(data?.message, "", "success");
      fetchData();
    } catch (error) {
      showApiError(error);
    }
  };

  const printData = () => {
    console.log("Selected Class:", selectedClass.value);
    exportPdf(selectedClass.value);
  };

  onMounted(() => {
    fetchClassTypes();
    fetchData();
  });

  return {
    search,
    isLoading,
    items,
    selectedClass,
    classTypes,
    filters,
    pagination,
    hasActiveFilters,
    nearExpiryCount,
    showExpiryWarning,
    fetchData,
    clearFilters,
    updatePagination,
    deleteData,
    printData,
  };
}
