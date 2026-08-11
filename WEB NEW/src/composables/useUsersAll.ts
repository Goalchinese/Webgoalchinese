import { ref, reactive, onMounted, watch } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useSwal } from "@/composables/useSwal";
import { useAuth } from "@/composables/useAuth";

export interface UserItem {
  id: number;
  name: string;
  phone?: string;
  duty?: string;
  gender?: string;
  photo?: string;
  dateOfBirth?: string;
  user?: { username?: string };
}

interface Pagination {
  page: number;
  itemsPerPage: number;
  total: number;
  totalPages: number;
}

export function useUsersAll() {
  const { showApiError } = useSwal();
  const { userInfo: currentUser } = useAuth();

  const search = ref("");
  const isLoading = ref(false);
  const items = ref<UserItem[]>([]);

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
      const userInfo = currentUser.value;
      const params: Record<string, unknown> = {
        role: userInfo?.role === "user" ? "user" : "user,admin,superadmin",
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
