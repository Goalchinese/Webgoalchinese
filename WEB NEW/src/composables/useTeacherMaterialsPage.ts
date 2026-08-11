import { ref, reactive, computed, onMounted } from "vue";
import axios from "axios";
import { useAuth } from "@/composables/useAuth";
import { useSwal } from "@/composables/useSwal";
import iconDocument from "@/assets/images/document.png";

interface MaterialItem {
  material: {
    no?: string | number;
    photo?: string;
    title?: string;
    materialCategory?: { name?: string };
    materialType?: { name?: string };
    documentType?: string;
    document?: string;
    link?: string;
  };
  [key: string]: unknown;
}

export function useTeacherMaterialsPage() {
  const { userInfo } = useAuth();
  const { showApiError, showWarning } = useSwal();

  const baseUrl = import.meta.env.VITE_APP_API_IMAGE;

  const isFullScreen = ref(false);
  const dialog = ref(false);
  const search = ref("");

  const headers = reactive([
    {
      align: "start",
      key: "material.no",
      sortable: false,
      title: "Materials No.",
    },
    { key: "photo", title: "Photo" },
    { key: "material.title", title: "Title", width: "40%" },
    { key: "material.materialCategory.name", title: "Materials Category" },
    {
      key: "material.materialType.name",
      title: "Materials for teacher/student",
    },
    { key: "action", title: "Action", sortable: false },
  ]);

  const items = ref<MaterialItem[]>([]);
  const fileUrl = ref("");
  const fileType = ref("");
  const loadingDocItem = ref<MaterialItem | null>(null);
  const myIframe = ref<HTMLIFrameElement | null>(null);

  const fetchDataMaterials = async () => {
    try {
      const { data } = await axios.get(
        `/myMaterial/account/${userInfo.value.accountID}`
      );
      items.value = data;
    } catch (error) {
      showApiError(error);
    }
  };

  const toggleFullScreen = () => {
    // const iframe = this.$refs.myIframe;

    // if (!this.isFullScreen) {
    //   if (iframe.requestFullscreen) {
    //     iframe.requestFullscreen();
    //   } else if (iframe.webkitRequestFullscreen) {
    //     iframe.webkitRequestFullscreen(); // Safari
    //   } else if (iframe.msRequestFullscreen) {
    //     iframe.msRequestFullscreen(); // IE/Edge
    //   }
    // } else {
    //   if (document.exitFullscreen) {
    //     document.exitFullscreen();
    //   } else if (document.webkitExitFullscreen) {
    //     document.webkitExitFullscreen(); // Safari
    //   } else if (document.msExitFullscreen) {
    //     document.msExitFullscreen(); // IE/Edge
    //   }
    // }

    // Update the fullscreen state
    isFullScreen.value = !isFullScreen.value;
  };

  const removeElementInIframe = () => {
    // Access the iframe via the ref
    const iframe = myIframe.value as unknown as {
      contentDocument?: Document;
      contentWindow?: Window;
    } | null;

    // Ensure the iframe is accessible (same-origin policy)
    try {
      const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;

      // Check if the iframe document is loaded
      if (!iframeDoc?.body) {
        console.error("Iframe content is still blank or not loaded");
        return;
      }

      // Find the element by ID and remove it
      const element = iframeDoc.getElementById(
        "ChromelessStatusBar.Options-Small14"
      );
      if (element) {
        element.remove();
        console.log("Element removed successfully");
      } else {
        console.log("Element not found in iframe");
      }
    } catch (error) {
      console.error("Error accessing iframe content:", error);
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

  const openDoc = async (item: MaterialItem) => {
    if (loadingDocItem.value) return;
    loadingDocItem.value = item;
    try {
      const documentType = item.material.documentType ?? "";
      const needsDocument = ["pptx", "pdf", "mp4"].includes(documentType);
      const needsLink = ["link", "youtube", "canva"].includes(documentType);

      if (needsDocument && !item.material.document) {
        showWarning("ไม่พบไฟล์", "ไม่พบไฟล์เอกสารนี้ในระบบ");
        return;
      }
      if (needsLink && !item.material.link) {
        showWarning("ไม่พบลิงก์", "ไม่พบลิงก์เอกสารนี้ในระบบ");
        return;
      }
      if (needsDocument) {
        const exists = await checkFileExists(`${baseUrl}${item.material.document}`);
        if (!exists) {
          showWarning("ไม่พบไฟล์", "ไม่สามารถเปิดไฟล์เอกสารนี้ได้");
          return;
        }
      }

      fileUrl.value = "";
      fileType.value = documentType;
      dialog.value = true;
      // if (process.env.NODE_ENV === "development") {
      //   this.fileUrl = `https://view.officeapps.live.com/op/embed.aspx?src=https://getsamplefiles.com/download/pptx/sample-2.pptx`;
      // } else {
      if (["pptx", "pdf"].includes(documentType))
        fileUrl.value = `https://view.officeapps.live.com/op/embed.aspx?src=${baseUrl}${item.material.document}`;
      else if (["link", "youtube"].includes(documentType)) {
        fileUrl.value = item.material.link ?? "";
      } else if (["canva"].includes(documentType)) {
        fileUrl.value = (item.material.link ?? "") + "?embed";
      } else if (documentType === "mp4") {
        fileUrl.value = `${baseUrl}${item.material.document}`;
      }
      // }
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
    headers,
    items,
    fileUrl,
    fileType,
    loadingDocItem,
    myIframe,
    baseUrl,
    userInfo,
    fetchDataMaterials,
    toggleFullScreen,
    removeElementInIframe,
    openDoc,
  };
}
