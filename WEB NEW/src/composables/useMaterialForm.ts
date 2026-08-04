import { reactive, ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";

export interface MaterialFormInput {
  title: string;
  categoryID: string;
  materialForID: string;
  materialTypeID: string;
  no: string;
  document: any;
  description: string;
  link: string;
  photo: any;
  documentType: string;
}

export interface MaterialFormProps {
  editItems?: Record<string, any> | null;
  flagEdit?: boolean;
}

export function useMaterialForm(
  props: MaterialFormProps,
  emit: (event: "input", value: MaterialFormInput) => void
) {
  const route = useRoute();

  const formInput = reactive<MaterialFormInput>({
    title: "",
    categoryID: "",
    materialForID: "",
    materialTypeID: "",
    no: "",
    document: null,
    description: "",
    link: "",
    photo: null,
    documentType: "",
  });

  const photoFile = ref<File[] | null>(null);
  const documentFile = ref<File[] | null>(null);

  const items = reactive({
    materialType: [] as any[],
    materialFor: [] as any[],
    materialCategory: [] as any[],
  });

  const editItems = computed(() => props.editItems);
  const flagEdit = computed(() => props.flagEdit ?? false);

  const getDocumentName = (documentPath?: string | null) => {
    if (!documentPath) return "";
    const filename = documentPath.split("/").pop() || documentPath;
    // Remove timestamp suffix if present (e.g., "filename-1234567890-123456789.pdf" -> "filename.pdf")
    const cleanName = filename.replace(/-\d+-\d+(\.[^.]+)$/, "$1");
    // Decode Unicode characters if needed
    try {
      return decodeURIComponent(cleanName);
    } catch (e) {
      return cleanName;
    }
  };

  const getOriginalDocumentName = (material?: Record<string, any> | null) => {
    if (material && material.originalDocumentName) {
      return material.originalDocumentName;
    }
    return "";
  };

  const photoPlaceholder = computed(() => {
    if (flagEdit.value && editItems.value && editItems.value.photo) {
      return getDocumentName(editItems.value.photo);
    }
    return "No file chosen";
  });

  const documentPlaceholder = computed(() => {
    if (flagEdit.value && editItems.value && editItems.value.document) {
      return getDocumentName(editItems.value.document);
    }
    return "No file chosen";
  });

  const onPhotoChange = () => {
    formInput.photo = photoFile.value?.[0] || null;
  };

  const onDocumentChange = () => {
    formInput.document = documentFile.value?.[0] || null;
  };

  const clearDocument = () => {
    documentFile.value = null;
    formInput.document = null;
  };

  const fetchData = async (uri?: string, itemsKey?: string) => {
    // fetch data from api
    try {
      const { data } = await axios.get(`/${uri}`);
      (items as Record<string, any>)[itemsKey as string] = data;
    } catch (error) {
      console.log(error);
    }
  };

  const deletePhoto = async () => {
    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this data!",
      icon: "warning",
      showCancelButton: true,
    });

    if (!isConfirmed) return;

    //delete data from api
    try {
      const { data } = await axios.delete(
        `/materials/image/${route.params.id}`
      );
      Swal.fire(data?.message, "", "success");

      photoFile.value = null;
      formInput.photo = null;
      fetchData();
    } catch (error: any) {
      Swal.fire({
        title: error.response.data.error,
        text: error.response.data.details,
        icon: "error",
      });
    }
  };

  watch(
    formInput,
    () => {
      emit("input", formInput);
    },
    { deep: true }
  );

  watch(
    editItems,
    () => {
      if (editItems.value) {
        Object.assign(formInput, editItems.value);
      }
    },
    { deep: true }
  );

  onMounted(() => {
    fetchData("materialType", "materialType");
    fetchData("materialFor", "materialFor");
    fetchData("materialCategory", "materialCategory");
  });

  return {
    editItems,
    flagEdit,
    formInput,
    photoFile,
    documentFile,
    items,
    photoPlaceholder,
    documentPlaceholder,
    getDocumentName,
    getOriginalDocumentName,
    onPhotoChange,
    onDocumentChange,
    clearDocument,
    deletePhoto,
  };
}
