import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { useSwal } from "@/composables/useSwal";
import iconStudent from "@/assets/images/student.png";

export function useStudentView() {
  const route = useRoute();
  const { showApiError } = useSwal();

  const baseUrl = import.meta.env.VITE_APP_API_IMAGE;

  const tab = ref(null);
  const dataStudent = ref<Record<string, any>>({});
  const dataMaterials = ref<any[]>([]);
  const dataPayment = ref<any[]>([]);
  const dataClass = ref<any[]>([]);

  const fetchDataById = async () => {
    try {
      const { data } = await axios.get(`/account/${route.params.id}`);
      dataStudent.value = {
        ...data,
        dateOfBirth: data.dateOfBirth?.substring(0, 10),

        addmissionDate: data.addmissionDate?.substring(0, 10),

        endClassDate: data.endClassDate?.substring(0, 10),

        username: data?.user?.username,
        password: "",
        expireDate: data?.user?.expireDate
          ? data?.user?.expireDate.substring(0, 10)
          : "",
      };
    } catch (error) {
      showApiError(error);
    }
  };

  const fetchDataMaterials = async () => {
    try {
      const { data } = await axios.get(
        `/myMaterial/account/${route.params.id}?last=true`
      );
      dataMaterials.value = data;
    } catch (error: any) {
      if (error.response.status !== 404) showApiError(error);
    }
  };

  const fetchDataPayment = async () => {
    try {
      const { data } = await axios.get(
        `/feeStructure/account/${route.params.id}`
      );
      dataPayment.value = data;
    } catch (error: any) {
      if (error.response.status !== 404) showApiError(error);
    }
  };

  const fetchDataClass = async () => {
    try {
      const { data } = await axios.get(`/classes/student/${route.params.id}`);
      dataClass.value = data;
    } catch (error: any) {
      if (error.response.status !== 404) showApiError(error);
    }
  };

  watch(tab, (val) => {
    if (val === 0) {
      fetchDataById();
    } else if (val === 1) {
      fetchDataMaterials();
    } else if (val === 2) {
      fetchDataPayment();
    } else if (val === 3) {
      fetchDataClass();
    }
  });

  return {
    iconStudent,
    baseUrl,
    tab,
    dataStudent,
    dataMaterials,
    dataPayment,
    dataClass,
    fetchDataById,
    fetchDataMaterials,
    fetchDataPayment,
    fetchDataClass,
  };
}
