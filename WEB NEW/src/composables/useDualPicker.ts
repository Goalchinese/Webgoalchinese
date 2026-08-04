import { reactive, ref, onMounted, watch } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useSwal } from "@/composables/useSwal";

interface Pagination {
  page: number;
  itemsPerPage: number;
  total: number;
  totalPages: number;
}

interface WithId {
  id: number;
}

function usePagedList<T extends WithId>(
  fetchUrl: string,
  extraParams: () => Record<string, unknown>
) {
  const search = ref("");
  const isLoading = ref(false);
  const items = ref<T[]>([]);
  const selected = ref<T[]>([]);
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
        ...extraParams(),
        page: pagination.page,
        limit,
      };
      if (search.value) params.search = search.value;

      const { data } = await axios.get(fetchUrl, { params });

      items.value = data.data || [];
      pagination.total = data.total || 0;
      pagination.totalPages = data.totalPages || 0;
    } catch (error) {
      useSwal().showApiError(error);
    } finally {
      isLoading.value = false;
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

  return { search, isLoading, items, selected, pagination, fetchData, updatePagination };
}

interface EntityItem extends WithId {
  name: string;
  photo?: string;
  dateOfBirth?: string;
  gender?: string;
  addmissionNo?: string;
  phone?: string;
  pointStructure?: { pointAfterUpdate?: number };
  studentType?: { name: string };
  classType?: { name: string };
}

interface MaterialItem extends WithId {
  no?: string;
  title: string;
  photo?: string;
  description?: string;
  documentType?: string;
  createdAt?: string;
  materialCategory?: { name: string };
  materialFor?: { name: string };
  materialType?: { name: string };
}

interface DualPickerOptions {
  /** value sent as ?role= when fetching the entity (student/teacher) list */
  entityRole: "student" | "teacher";
  /** value sent as ?materialFor= when fetching the material list */
  materialFor: string;
  /** "type" sent to the clear-materials endpoint */
  clearType: string;
}

/**
 * Shared "select entities + select materials, then assign" pattern
 * used by student/teacher materials-assignment pages and the library page.
 */
export function useDualPicker(options: DualPickerOptions) {
  const { showApiError } = useSwal();

  const entities = usePagedList<EntityItem>(`/account`, () => ({
    role: options.entityRole,
  }));
  const materials = usePagedList<MaterialItem>(`/materials`, () => ({
    materialFor: options.materialFor,
  }));

  const isSaving = ref(false);

  const assignMaterials = async () => {
    isSaving.value = true;
    try {
      const body = {
        accountID: entities.selected.value.map((item) => item.id),
        materials: materials.selected.value.map((item) => item.id),
      };
      const { data } = await axios.post(`/myMaterial`, body);
      Swal.fire(data?.message, "", "success");
    } catch (error) {
      showApiError(error);
    } finally {
      isSaving.value = false;
    }
  };

  const clearMaterials = async () => {
    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this data!",
      icon: "warning",
      showCancelButton: true,
    });
    if (!isConfirmed) return;

    try {
      const { data } = await axios.put(`/myMaterial/clear/account`, {
        accountIDs: entities.selected.value.map((item) => item.id),
        type: options.clearType,
      });
      Swal.fire(data?.message, "", "success");
    } catch (error) {
      showApiError(error);
    }
  };

  onMounted(() => {
    entities.fetchData();
    materials.fetchData();
  });

  return {
    entities,
    materials,
    isSaving,
    assignMaterials,
    clearMaterials,
  };
}
