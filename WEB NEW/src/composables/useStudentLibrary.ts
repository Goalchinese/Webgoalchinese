import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useAuth } from "@/composables/useAuth";
import { useSwal } from "@/composables/useSwal";
import iconDocument from "@/assets/images/document.png";

interface LibraryMaterial {
  title?: string;
  photo?: string;
  documentType?: string;
  document?: string;
  link?: string;
  accountID?: string | number;
}

export interface LibraryItem {
  material?: LibraryMaterial;
}

const baseUrl = import.meta.env.VITE_APP_API_IMAGE;

export function useStudentLibrary() {
  const { userInfo } = useAuth();
  const { showApiError, showWarning } = useSwal();

  const fileUrl = ref("");
  const isFullScreen = ref(false);
  const dialog = ref(false);
  const itemsLibrary = ref<LibraryItem[]>([]);
  const fileType = ref<string | null>(null);
  const loadingDocItem = ref<LibraryItem | null>(null);

  const fetchDataMaterials = async () => {
    try {
      const { data } = await axios.get(
        `/myMaterial/account/${userInfo.value.accountID}?type=library`
      );
      itemsLibrary.value = data;
    } catch (error) {
      showApiError(error);
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

  const openDoc = async (item: LibraryItem) => {
    if (loadingDocItem.value) return;
    loadingDocItem.value = item;
    try {
      const documentType = item?.material?.documentType ?? "";
      const needsDocument = ["pptx", "pdf", "mp4"].includes(documentType);
      const needsLink = ["link", "youtube", "canva"].includes(documentType);

      if (needsDocument && !item?.material?.document) {
        showWarning("ไม่พบไฟล์", "ไม่พบไฟล์เอกสารนี้ในระบบ");
        return;
      }
      if (needsLink && !item?.material?.link) {
        showWarning("ไม่พบลิงก์", "ไม่พบลิงก์เอกสารนี้ในระบบ");
        return;
      }
      if (needsDocument) {
        const exists = await checkFileExists(`${baseUrl}${item?.material?.document}`);
        if (!exists) {
          showWarning("ไม่พบไฟล์", "ไม่สามารถเปิดไฟล์เอกสารนี้ได้");
          return;
        }
      }

      fileUrl.value = "";
      fileType.value = "";
      dialog.value = true;

      if (["pptx"].includes(documentType))
        fileUrl.value = `https://view.officeapps.live.com/op/embed.aspx?src=${baseUrl}${item?.material?.document}`;
      else if (documentType === "pdf") {
        fileUrl.value = `${baseUrl}${item?.material?.document}`;
        fileType.value = "pdf";
      } else if (["link"].includes(documentType)) {
        const canvaLink = item?.material?.link;
        window.open(canvaLink, "_blank"); // Open in a new tab
      } else if (["canva"].includes(documentType)) {
        fileUrl.value = item?.material?.link + "?embed";
      } else if (["youtube"].includes(documentType)) {
        fileUrl.value = item?.material?.link ?? "";
      } else if (documentType === "mp4") {
        fileUrl.value = `${baseUrl}${item?.material?.document}`;
      }
    } finally {
      loadingDocItem.value = null;
    }
  };

  onMounted(() => {
    fetchDataMaterials();
  });

  return {
    userInfo,
    fileUrl,
    iconDocument,
    isFullScreen,
    dialog,
    itemsLibrary,
    fileType,
    loadingDocItem,
    baseUrl,
    fetchDataMaterials,
    openDoc,
  };
}
