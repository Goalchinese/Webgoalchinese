import { reactive, ref, onMounted, watch } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useSwal } from "@/composables/useSwal";

export const TAG_CATEGORIES = [
  "branch",
  "materialType",
  "classType",
  "studentType",
  "teacherType",
  "materialFor",
  "materialCategory",
  "currency",
] as const;

type TagCategory = (typeof TAG_CATEGORIES)[number];

interface TagItem {
  id: number;
  name: string;
}

interface Contact {
  label: string;
  url: string;
}

export function useSetting() {
  const { showApiError } = useSwal();

  const formInput = reactive({
    file: null as File | null,
    logo: "" as string | null,
    academyName: "",
  });

  const contacts = ref<Contact[]>([{ label: "Line", url: "" }]);
  const isSaving = ref(false);

  const isVisible = reactive<Record<TagCategory, boolean>>(
    Object.fromEntries(TAG_CATEGORIES.map((key) => [key, false])) as Record<
      TagCategory,
      boolean
    >
  );
  const formData = reactive<Record<TagCategory, string>>(
    Object.fromEntries(TAG_CATEGORIES.map((key) => [key, ""])) as Record<
      TagCategory,
      string
    >
  );
  const editItems = reactive<Record<TagCategory, TagItem | string>>(
    Object.fromEntries(TAG_CATEGORIES.map((key) => [key, ""])) as Record<
      TagCategory,
      TagItem | string
    >
  );
  const items = reactive<Record<TagCategory, TagItem[]>>(
    Object.fromEntries(TAG_CATEGORIES.map((key) => [key, []])) as Record<
      TagCategory,
      TagItem[]
    >
  );

  watch(
    () => formInput.file,
    (files) => {
      if (files && files?.length > 0) formInput.logo = URL.createObjectURL(files[0]);
    }
  );

  const fetchTag = async (key: TagCategory) => {
    try {
      const { data } = await axios.get(`/${key}`);
      items[key] = data;
    } catch (error) {
      showApiError(error);
    }
  };

  const saveTag = async (key: TagCategory) => {
    try {
      const editItem = editItems[key];
      const id = typeof editItem === "object" ? editItem.id : undefined;
      if (id) {
        await axios.put(`/${key}/${id}`, { name: formData[key] });
      } else {
        await axios.post(`/${key}`, { name: formData[key] });
      }
      await fetchTag(key);
      isVisible[key] = false;
      formData[key] = "";
      editItems[key] = "";
    } catch (error) {
      showApiError(error);
    }
  };

  const deleteTag = async (key: TagCategory, id: number) => {
    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this data!",
      icon: "warning",
      showCancelButton: true,
    });
    if (!isConfirmed) return;

    try {
      await axios.delete(`/${key}/${id}`);
      await fetchTag(key);
    } catch (error) {
      showApiError(error);
    }
  };

  const startEditTag = (key: TagCategory, item: TagItem) => {
    editItems[key] = item;
    formData[key] = item.name;
    isVisible[key] = true;
  };

  const startCreateTag = (key: TagCategory) => {
    formData[key] = "";
    editItems[key] = "";
    isVisible[key] = !isVisible[key];
  };

  const addContact = () => {
    contacts.value.push({ label: "", url: "" });
  };

  const removeContact = (index: number) => {
    contacts.value.splice(index, 1);
  };

  const fetchSetting = async () => {
    try {
      const { data } = await axios.get("/setting");
      const setting = data[0];
      if (setting) {
        formInput.logo = setting.logo
          ? `${import.meta.env.VITE_APP_API_IMAGE}${setting.logo}`
          : null;
        formInput.academyName = setting.academyName || "";
        contacts.value = setting.contacts?.length
          ? setting.contacts
          : [{ label: "Line", url: "" }];
      } else {
        formInput.logo = null;
        formInput.academyName = "";
      }
    } catch (error) {
      showApiError(error);
    }
  };

  const saveSetting = async () => {
    isSaving.value = true;
    try {
      const formDataToSend = new FormData();
      if (formInput.file && formInput.file.length > 0) formDataToSend.append("logo", formInput.file[0]);
      formDataToSend.append("academyName", formInput.academyName);
      formDataToSend.append("contacts", JSON.stringify(contacts.value));

      const { data } = await axios.post("/setting", formDataToSend);

      if (data.setting) {
        formInput.logo = data.setting.logo
          ? `${import.meta.env.VITE_APP_API_IMAGE}${data.setting.logo}`
          : null;
        formInput.academyName = data.setting.academyName || formInput.academyName;
        if (data.setting.contacts?.length) contacts.value = data.setting.contacts;
      }
      formInput.file = null;

      Swal.fire({
        title: "Success!",
        text: "Settings updated successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      showApiError(error);
    } finally {
      isSaving.value = false;
    }
  };

  const deleteLogo = async () => {
    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this data!",
      icon: "warning",
      showCancelButton: true,
    });
    if (!isConfirmed) return;

    isSaving.value = true;
    try {
      await axios.delete("/setting/logo");
      formInput.file = null;
      formInput.logo = null;

      Swal.fire({
        title: "Success!",
        text: "Logo deleted successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      showApiError(error);
    } finally {
      isSaving.value = false;
    }
  };

  onMounted(() => {
    fetchSetting();
    TAG_CATEGORIES.forEach(fetchTag);
  });

  return {
    formInput,
    contacts,
    isSaving,
    isVisible,
    formData,
    editItems,
    items,
    saveSetting,
    deleteLogo,
    saveTag,
    deleteTag,
    startEditTag,
    startCreateTag,
    addContact,
    removeContact,
  };
}
