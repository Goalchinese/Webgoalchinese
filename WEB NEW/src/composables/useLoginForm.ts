import axios from "axios";

interface SettingResponse {
  logo?: string | null;
  academyName?: string;
}

export function useLoginForm() {
  const logo = ref<string | null>(null);
  const academyName = ref("");

  const checkFileExists = async (url: string) => {
    try {
      await axios.head(url);
      return true;
    } catch {
      return false;
    }
  };

  const fetchSiteInfo = async () => {
    try {
      const data = await $api<SettingResponse[]>("/setting");
      const setting = data[0];

       logo.value = null;
      const exists = await checkFileExists(
        `${import.meta.env.VITE_APP_API_IMAGE}${setting.logo}`,
      );
      if (exists) {
          logo.value = setting.logo || null; ;
      }
    

      academyName.value = setting?.academyName || "";
    } catch {
      logo.value = null;
      academyName.value = "";
    }
  };

  onMounted(fetchSiteInfo);

  return { logo, academyName, fetchSiteInfo };
}
