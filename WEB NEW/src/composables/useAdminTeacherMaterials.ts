import { ref, reactive, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "@/composables/useAuth";
import { useSwal } from "@/composables/useSwal";
import iconTeacher from "@/assets/images/teacher.png";
import iconDocument from "@/assets/images/document.png";

interface Pagination {
  page: number;
  itemsPerPage: number;
  total: number;
  totalPages: number;
}

interface Permission {
  link?: string;
  view?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
}

export function useAdminTeacherMaterials() {
  const route = useRoute();
  const { userInfo } = useAuth();
  const { showApiError } = useSwal();

  const baseUrl = import.meta.env.VITE_APP_API_IMAGE;

  const permission = ref<Permission | undefined>({});

  const search = ref("");
  const searchMaterials = ref("");

  const headers = [
    {
      align: "start",
      key: "teacherNo",
      sortable: false,
      title: "Teacher No.",
    },
    { key: "name", title: "Teacher Name", width: "30%" },
    { key: "registerDate", title: "Start teaching date" },
    { key: "avaliableForClass", title: "Available for" },
    { key: "language", title: "Language" },
    { key: "score", title: "Teacher score" },
    { key: "age", title: "Age" },
    { key: "gender", title: "Gender" },
  ] as const;

  const items = ref<any[]>([]);

  const headersMaterials = [
    {
      align: "start",
      key: "no",
      sortable: false,
      title: "Materials No.",
      width: "3%",
    },
    { key: "photo", title: "Photo" },
    { key: "title", title: "Title", width: "25%" },
    {
      key: "materialCategory.name",
      title: "Materials Category",
      width: "",
    },
    { key: "materialFor.name", title: "Materials for teacher/student" },
    { key: "materialType.name", title: "Type" },
    { key: "documentType", title: "File type" },
    { key: "date", title: "Date" },
    { key: "description", title: "Description" },
  ] as const;

  const itemsMaterials = ref<any[]>([]);

  const selectedTeacher = ref<any[]>([]);
  const selectedMaterials = ref<any[]>([]);

  const isLoadingTeachers = ref(false);
  const isLoadingMaterials = ref(false);

  const paginationTeachers = reactive<Pagination>({
    page: 1,
    itemsPerPage: 10,
    total: 0,
    totalPages: 0,
  });

  const paginationMaterials = reactive<Pagination>({
    page: 1,
    itemsPerPage: 10,
    total: 0,
    totalPages: 0,
  });

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

  const fetchDataTeacher = async () => {
    isLoadingTeachers.value = true;
    try {
      // Handle -1 (All) case - use large number instead of -1
      const limit =
        paginationTeachers.itemsPerPage === -1
          ? 1000
          : paginationTeachers.itemsPerPage;
      const params: Record<string, unknown> = {
        role: "teacher",
        page: paginationTeachers.page,
        limit: limit,
      };

      if (search.value) {
        params.search = search.value;
      }

      const { data } = await axios.get("/account", { params });

      items.value = data.data || [];
      paginationTeachers.total = data.total || 0;
      paginationTeachers.totalPages = data.totalPages || 0;
    } catch (error) {
      showApiError(error);
    } finally {
      isLoadingTeachers.value = false;
    }
  };

  const fetchDataMaterials = async () => {
    isLoadingMaterials.value = true;
    try {
      // Handle -1 (All) case - use large number instead of -1
      const limit =
        paginationMaterials.itemsPerPage === -1
          ? 1000
          : paginationMaterials.itemsPerPage;
      const params: Record<string, unknown> = {
        materialFor: "teacher",
        page: paginationMaterials.page,
        limit: limit,
      };

      if (searchMaterials.value) {
        params.search = searchMaterials.value;
      }

      const { data } = await axios.get("/materials", { params });

      itemsMaterials.value = data.data || [];
      paginationMaterials.total = data.total || 0;
      paginationMaterials.totalPages = data.totalPages || 0;
    } catch (error) {
      showApiError(error);
    } finally {
      isLoadingMaterials.value = false;
    }
  };

  const update = async () => {
    try {
      const body = {
        accountID: selectedTeacher.value.map((item) => item.id),
        materials: selectedMaterials.value.map((item) => item.id),
      };
      const { data } = await axios.post(`/myMaterial`, body);

      Swal.fire(data?.message, "", "success");
    } catch (error) {
      showApiError(error);
    }
  };

  const clearMaterials = async () => {
    // confirm delete
    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this data!",
      icon: "warning",
      showCancelButton: true,
    });

    if (!isConfirmed) return;

    try {
      const { data } = await axios.put(`/myMaterial/clear/account`, {
        accountIDs: selectedTeacher.value.map((item) => item.id),
        type: "all",
      });

      Swal.fire(data?.message, "", "success");
    } catch (error) {
      showApiError(error);
    }
  };

  const updatePaginationTeachers = (options: {
    page: number;
    itemsPerPage: number;
  }) => {
    paginationTeachers.page = options.page;
    paginationTeachers.itemsPerPage = options.itemsPerPage;
    // Ensure search is maintained when pagination changes
    fetchDataTeacher();
  };

  const updatePaginationMaterials = (options: {
    page: number;
    itemsPerPage: number;
  }) => {
    paginationMaterials.page = options.page;
    paginationMaterials.itemsPerPage = options.itemsPerPage;
    // Ensure search is maintained when pagination changes
    fetchDataMaterials();
  };

  watch(search, () => {
    // Reset to page 1 when search changes to ensure consistent results
    paginationTeachers.page = 1;
    fetchDataTeacher();
  });

  watch(searchMaterials, () => {
    // Reset to page 1 when search changes to ensure consistent results
    paginationMaterials.page = 1;
    fetchDataMaterials();
  });

  onMounted(() => {
    fetchDataTeacher();
    fetchDataMaterials();

    permission.value = userInfo.value?.permissions?.find(
      (it: { link?: string }) => it.link === route.path
    );
  });

  return {
    iconTeacher,
    iconDocument,
    baseUrl,
    permission,
    userInfo,
    search,
    searchMaterials,
    headers,
    items,
    headersMaterials,
    itemsMaterials,
    selectedTeacher,
    selectedMaterials,
    isLoadingTeachers,
    isLoadingMaterials,
    paginationTeachers,
    paginationMaterials,
    calulateAge,
    update,
    clearMaterials,
    updatePaginationTeachers,
    updatePaginationMaterials,
  };
}
