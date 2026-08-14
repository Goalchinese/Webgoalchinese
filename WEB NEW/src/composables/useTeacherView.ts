import { ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { useSwal } from "@/composables/useSwal";
import iconTeacher from "@/assets/images/teacher.png";

export function useTeacherView() {
  const route = useRoute();
  const { showApiError } = useSwal();

  const baseUrl = import.meta.env.VITE_APP_API_IMAGE;

  const tab = ref(null);
  const dataTeacher = ref<any>({});
  const dataMaterials = ref<any[]>([]);
  const events = ref<any[]>([]);

  const fetchDataById = async () => {
    try {
      const { data } = await axios.get(`/account/${route.params.id}`);
      dataTeacher.value = {
        ...data,
        dateOfBirth: data.dateOfBirth?.substring(0, 10),

        registerDate: data.registerDate?.substring(0, 10),

        username: data?.user?.username,
        password: "",
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
    } catch (error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status !== 404) showApiError(error);
    }
  };

  const onFetchEvents = async (payload?: { start?: string; end?: string }) => {
    try {
      const { data } = await axios.get("/classEvents", {
        params: {
          teacherId: route.params.id,
          start: payload?.start,
          end: payload?.end,
        },
      });
      events.value = data || [];
    } catch (error) {
      showApiError(error);
    }
  };

  watch(tab, (val) => {
    if (val === 0) {
      fetchDataById();
    } else if (val === 1) {
      fetchDataMaterials();
    }
  });

  onMounted(() => {
    // fetchDataById();
  });

  return {
    iconTeacher,
    baseUrl,
    tab,
    dataTeacher,
    dataMaterials,
    events,
    fetchDataById,
    fetchDataMaterials,
    onFetchEvents,
  };
}
