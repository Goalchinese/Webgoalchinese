import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";
import { useSwal } from "@/composables/useSwal";

interface ValidatableForm {
  validate: () => Promise<{ valid: boolean }>;
}

export function useUserCreate() {
  const router = useRouter();
  const { showApiError } = useSwal();

  const formInput = ref<Record<string, unknown>>({});

  const create = async (formRef: ValidatableForm) => {
    const { valid } = await formRef.validate();
    if (!valid) return;

    try {
      const formData = new FormData();
      for (const key in formInput.value) {
        const value = formInput.value[key];
        if (key === "permissions") {
          formData.append("permissions", JSON.stringify(value));
        } else if (value) {
          formData.append(key, value as string);
        }
      }

      const { data } = await axios.post("/account", formData);
      Swal.fire(data?.message, "", "success");
      router.push({ name: "admin-users" });
    } catch (error) {
      showApiError(error);
    }
  };

  return { formInput, create };
}
