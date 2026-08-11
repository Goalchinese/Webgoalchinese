import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "@/composables/useAuth";
import { useSwal } from "@/composables/useSwal";

interface ValidatableForm {
  validate: () => Promise<{ valid: boolean }>;
}

export function useTeacherCreate() {
  const router = useRouter();
  const { userInfo } = useAuth();
  const { showApiError } = useSwal();

  const formInput = ref<Record<string, unknown>>({});
  const refFormFee = ref<ValidatableForm[]>([]);
  const formFeeStructure = ref<Record<string, unknown>[]>([]);
  const refFormScore = ref<ValidatableForm[]>([]);
  const formScoreStructure = ref<Record<string, unknown>[]>([]);

  const create = async (formRef: ValidatableForm) => {
    const { valid } = await formRef.validate();
    if (!valid) return;

    for (const feeForm of refFormFee.value) {
      const { valid: feeValid } = await feeForm.validate();
      if (!feeValid) return;
    }
    for (const scoreForm of refFormScore.value) {
      const { valid: scoreValid } = await scoreForm.validate();
      if (!scoreValid) return;
    }

    try {
      formInput.value.role = "teacher";
      const formData = new FormData();
      for (const key in formInput.value) {
        const value = formInput.value[key];
        if (key === "photo") {
          if (value) formData.append("profile", value as Blob);
        } else if (value) {
          formData.append(key, value as string);
        }
      }

      const { data } = await axios.post("/account", formData);
      const accountID = data.account.id;

      for (const fee of formFeeStructure.value) {
        await axios.post("/feeStructure", { ...fee, accountID });
      }

      for (const score of formScoreStructure.value) {
        await axios.post("/pointStructure", {
          ...score,
          accountID,
          updateBy: userInfo.value?.accountID,
        });
      }

      Swal.fire(data?.message, "", "success");
      router.push({ name: "admin-teacher-all" });
    } catch (error) {
      showApiError(error);
    }
  };

  return {
    formInput,
    refFormFee,
    formFeeStructure,
    refFormScore,
    formScoreStructure,
    create,
  };
}
