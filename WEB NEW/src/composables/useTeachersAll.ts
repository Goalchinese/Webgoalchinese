import { ref, reactive, onMounted, watch } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useSwal } from "@/composables/useSwal";

export interface TeacherItem {
  id: number;
  teacherNo: string;
  name: string;
  photo?: string;
  dateOfBirth?: string;
  gender?: string;
  registerDate?: string;
  avaliableForClass?: string;
  language?: string;
  pointStructure?: { pointAfterUpdate?: number };
}

interface Pagination {
  page: number;
  itemsPerPage: number;
  total: number;
  totalPages: number;
}

export function useTeachersAll() {
  const { showApiError } = useSwal();

  const search = ref("");
  const isLoading = ref(false);
  const items = ref<TeacherItem[]>([]);

  const pagination = reactive<Pagination>({
    page: 1,
    itemsPerPage: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchData = async () => {
    isLoading.value = true;
    try {
      const limit =
        pagination.itemsPerPage === -1 ? 1000 : pagination.itemsPerPage;
      const page = pagination.itemsPerPage === -1 ? 1 : pagination.page;
      const params: Record<string, unknown> = {
        role: "teacher",
        page,
        limit,
      };
      if (search.value) params.search = search.value;

      const { data } = await axios.get("/account", { params });

      items.value = data.data || [];
      pagination.total = data.total || 0;
      pagination.totalPages = data.totalPages || 0;
    } catch (error) {
      showApiError(error);
    } finally {
      isLoading.value = false;
    }
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
      await axios.delete(`/account/${id}`);
      Swal.fire("Material deleted successfully", "", "success");
      fetchData();
    } catch (error) {
      showApiError(error);
    }
  };

  const updatePagination = (options: { page: number; itemsPerPage: number }) => {
    pagination.page = options.page;
    pagination.itemsPerPage = options.itemsPerPage;
    if (options.itemsPerPage === -1) {
      pagination.page = 1;
    }
    fetchData();
  };

  watch(search, () => {
    pagination.page = 1;
    fetchData();
  });

  onMounted(fetchData);

  return {
    search,
    isLoading,
    items,
    pagination,
    fetchData,
    deleteData,
    updatePagination,
  };
}
