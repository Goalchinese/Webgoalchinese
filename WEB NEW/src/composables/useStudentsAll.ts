import { ref, reactive, onMounted, watch } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useSwal } from "@/composables/useSwal";

export interface StudentItem {
  id: number;
  addmissionNo: string;
  name: string;
  phone?: string;
  photo?: string;
  dateOfBirth?: string;
  gender?: string;
  pointStructure?: { pointAfterUpdate?: number };
  studentType?: { name: string };
  classType?: { name: string };
  classStudent?: Array<{ class?: { no?: string } }>;
}

interface Pagination {
  page: number;
  itemsPerPage: number;
  total: number;
  totalPages: number;
}

export function useStudentsAll() {
  const { showApiError } = useSwal();

  const search = ref("");
  const isLoading = ref(false);
  const items = ref<StudentItem[]>([]);

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
      const params: Record<string, unknown> = {
        role: "student",
        page: pagination.page,
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
      const { data } = await axios.delete(`/account/${id}`);
      Swal.fire(data?.message, "", "success");
      fetchData();
    } catch (error) {
      showApiError(error);
    }
  };

  const updatePagination = (options: { page: number; itemsPerPage: number }) => {
    pagination.page = options.page;
    pagination.itemsPerPage = options.itemsPerPage;
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
