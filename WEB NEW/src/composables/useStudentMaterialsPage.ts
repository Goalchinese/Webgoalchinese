import { ref, computed, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "@/composables/useAuth";
import iconDocument from "@/assets/images/document.png";

interface MaterialRef {
  no?: string;
  title?: string;
  documentType?: string;
  document?: string;
  link?: string;
  materialCategory?: { name: string };
  materialFor?: { name: string };
}

export interface StudentMaterialItem {
  photo?: string;
  material?: MaterialRef;
}

interface ApiErrorShape {
  response?: {
    status?: number;
    data?: {
      error?: string;
      details?: string;
    };
  };
  message?: string;
}

export function useStudentMaterialsPage() {
  const { userInfo } = useAuth();
  const baseUrl = import.meta.env.VITE_APP_API_IMAGE;

  const isFullScreen = ref(false);
  const dialog = ref(false);
  const search = ref("");
  const myIframe = ref(null);

  const headers = [
    {
      align: "start",
      key: "material.no",
      sortable: false,
      title: "Materials No.",
    },
    { key: "photo", title: "Photo" },
    { key: "material.title", title: "Title", width: "40%" },
    {
      key: "material.materialCategory.name",
      title: "Materials Category",
      width: "10%",
    },
    {
      key: "material.materialFor.name",
      title: "Materials for teacher/student",
      width: "10%",
    },
    { key: "action", title: "Action", sortable: false },
  ]

  const items = ref<StudentMaterialItem[]>([]);
  const fileUrl = ref("");
  const fileType = ref("");
  const loadingDocItem = ref<StudentMaterialItem | null>(null);

  const toggleFullScreen = () => {
    // Update the fullscreen state
    isFullScreen.value = !isFullScreen.value;
  };

  const fetchDataMaterials = async () => {
    try {
      console.log(
        "🚀 ~ fetchDataMaterials ~ userInfo.id:",
        userInfo.value.id
      );
      const { data } = await axios.get(
        `/myMaterial/account/${userInfo.value.id}?type=student`
      );
      console.log("🚀 ~ fetchDataMaterials ~ raw data:", data);
      items.value = data;
      console.log("🚀 ~ fetchDataMaterials ~ items:", items.value);
    } catch (error) {
      console.error("❌ fetchDataMaterials error:", error);
      const err = error as ApiErrorShape;
      if (err.response?.status !== 404)
        Swal.fire({
          title: err.response?.data?.error || "Error",
          text: err.response?.data?.details || err.message,
          icon: "error",
        });
    }
  };

  const checkFileExists = async (url: string) => {
    try {
      await axios.head(url);
      return true;
    } catch {
      return false;
    }
  };

  const openDoc = async (item: StudentMaterialItem) => {
    if (loadingDocItem.value) return;
    loadingDocItem.value = item;
    try {
      const documentType = item.material?.documentType ?? "";
      const needsDocument = ["pptx", "pdf", "mp4"].includes(documentType);
      const needsLink = ["link", "youtube", "canva"].includes(documentType);

      if (needsDocument && !item.material?.document) {
        Swal.fire({
          title: "file not found",
          text: "This document file is not found in the system",
          icon: "warning",
        });
        return;
      }
      if (needsLink && !item.material?.link) {
        Swal.fire({
          title: "link not found",
          text: "This link is not found in the system",
          icon: "warning",
        });
        return;
      }
      if (needsDocument) {
        const exists = await checkFileExists(`${baseUrl}${item.material?.document}`);
        if (!exists) {
          Swal.fire({
            title: "file not found",
            text: "This document file is not found in the system",
            icon: "warning",
          });
          return;
        }
      }

      dialog.value = false;
      fileType.value = documentType;

      // this.fileUrl = "../sample-1.pdf";
      if (["pptx"].includes(documentType)) {
        fileUrl.value = `${baseUrl}${item.material?.document}`;
      } else if (["pdf"].includes(documentType)) {
        fileUrl.value = `${baseUrl}${item.material?.document}`;
      } else if (["link"].includes(documentType)) {
        const canvaLink = item.material?.link;
        window.open(canvaLink, "_blank");
      } else if (["canva"].includes(documentType)) {
        fileUrl.value = item.material?.link + "?embed";
      } else if (["youtube"].includes(documentType)) {
        fileUrl.value = item.material?.link ?? "";
      } else if (documentType === "mp4") {
        fileUrl.value = `${baseUrl}${item.material?.document}`;
      }

      setTimeout(() => {
        dialog.value = true;
      }, 200);
    } finally {
      loadingDocItem.value = null;
    }
  };

  onMounted(() => {
    fetchDataMaterials();
  });

  return {
    iconDocument,
    isFullScreen,
    dialog,
    search,
    myIframe,
    headers,
    items,
    fileUrl,
    fileType,
    loadingDocItem,
    userInfo,
    baseUrl,
    toggleFullScreen,
    fetchDataMaterials,
    openDoc,
  };
}
