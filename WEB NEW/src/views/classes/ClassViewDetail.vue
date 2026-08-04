<template>
  <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
    <div class="d-flex align-center mb-4">
      <v-avatar size="32" color="primary" class="mr-3">
        <v-icon color="white" size="22">tabler-book-2</v-icon>
      </v-avatar>
      <span class="text-h5 font-weight-bold">Class Detail</span>
    </div>
    <v-row dense>
      <v-col cols="12" md="3">
        <span class="text-h6"> Student Name : </span>
        <span class="text-body-1">
          {{ itemData?.name }}
        </span>
      </v-col>
      <v-col cols="12" md="3">
        <span class="text-h6"> Class No : </span>
        <span class="text-body-1">
          {{ itemData?.no }}
        </span>
      </v-col>
      <v-col cols="12" md="3">
        <span class="text-h6"> Branch : </span>
        <span class="text-body-1">
          {{ itemData?.branch?.name || "N/A" }}
        </span>
      </v-col>
      <v-col cols="12" md="3">
        <span class="text-h6"> Class Type : </span>
        <span class="text-body-1">
          {{ itemData?.classType?.name || "N/A" }}
        </span>
      </v-col>
      <v-col cols="12" md="3">
        <span class="text-h6"> Number Of Student : </span>
        <span class="text-body-1">
          {{ itemData?.numberOfStudent || "N/A" }}
        </span>
      </v-col>
      <v-col cols="12" md="3">
        <span class="text-h6"> Study fee/person : </span>
        <span class="text-body-1">
          {{ itemData?.studentFee || "N/A" }}
        </span>
      </v-col>
      <v-col cols="12" md="3">
        <span class="text-h6"> Discount : </span>
        <span class="text-body-1">
          {{ itemData?.discount || "N/A" }}
        </span>
      </v-col>
      <v-col cols="12" md="3">
        <span class="text-h6"> Discount Note : </span>
        <span class="text-body-1">
          {{ itemData?.discountNote || "N/A" }}
        </span>
      </v-col>
      <v-col cols="12" md="3">
        <span class="text-h6"> Total fee per class : </span>
        <span class="text-body-1">
          {{ itemData?.totalFeePerClass || "N/A" }}
        </span>
      </v-col>
      <v-col cols="12" md="3">
        <span class="text-h6"> Teacher Name : </span>
        <span class="text-body-1">
          {{ itemData?.teacher?.name || "N/A" }}
        </span>
      </v-col>
      <v-col cols="12" md="3">
        <span class="text-h6"> Student Name : </span>
        <span class="text-body-1">
          {{
            itemData?.classStudent?.map((it) => it.account.name).join(",") ||
            "N/A"
          }}
        </span>
      </v-col>
      <v-col cols="12" md="3">
        <span class="text-h6"> Class Status : </span>
        <span class="text-body-1">
          {{ itemData?.status || "N/A" }}
        </span>
      </v-col>
      <v-col cols="12" md="3">
        <span class="text-h6"> Material Type : </span>
        <span class="text-body-1">
          {{ itemData?.materialType?.name || "N/A" }}
        </span>
      </v-col>
      <v-col cols="12" md="3">
        <span class="text-h6"> Note : </span>
        <span class="text-body-1">
          {{ itemData?.note || "N/A" }}
        </span>
      </v-col>
    </v-row>
  </v-card>

  <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
    <div class="d-flex align-center mb-4">
      <v-avatar size="32" color="info" class="mr-3">
        <v-icon color="white" size="22">tabler-calendar-time</v-icon>
      </v-avatar>
      <span class="text-h5 font-weight-bold">Schedule</span>
    </div>
    <v-row dense>
      <v-col cols="12" md="4">
        <span class="text-h6"> Number of time registered (times) : </span>
        <span class="text-body-1">
          {{ itemData?.registeredTimes || "N/A" }}
        </span>
      </v-col>
      <v-col cols="12" md="4">
        <span class="text-h6"> Teacher can leave (times) : </span>
        <span class="text-body-1">
          {{ itemData?.teacherLeave || "N/A" }}
        </span>
      </v-col>
      <v-col cols="12" md="4">
        <span class="text-h6"> Student can leave (times) : </span>
        <span class="text-body-1">
          {{ itemData?.studentLeave || "N/A" }}
        </span>
      </v-col>
      <v-col cols="12" md="4">
        <span class="text-h6"> Start date : </span>
        <span class="text-body-1">
          {{ itemData?.startDate || "N/A" }}
        </span>
      </v-col>
      <v-col cols="12" md="4">
        <span class="text-h6"> End date : </span>
        <span class="text-body-1">
          {{ itemData?.endDate || "N/A" }}
        </span>
      </v-col>
      <v-col cols="12" md="4">
        <span class="text-h6"> Study time per time : </span>
        <span class="text-body-1">
          {{ itemData?.studyTimePerTime || "N/A" }}
        </span>
      </v-col>

      <v-col cols="12">
        <span class="text-h6"> Start time : </span>

        <v-card
          variant="outlined"
          rounded="lg"
          class="pa-2 mb-2"
          v-for="(item, i) in itemData?.classStudy"
          :key="i"
        >
          <v-row dense>
            <v-col cols="2">
              <span class="text-body-1">
                {{ item.day || "N/A" }}
              </span>
            </v-col>
            <v-col cols="2">
              <span class="text-body-1">
                {{ item.startTime || "N/A" }}
              </span>
            </v-col>
            <v-col cols="auto"> : </v-col>
            <v-col cols="2">
              <span class="text-body-1">
                {{ item.endTime || "N/A" }}
              </span>
            </v-col>
            <v-col cols="3">
              <span class="text-body-1">
                {{ item.note || "N/A" }}
              </span>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-card>

  <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
    <div class="d-flex align-center mb-4">
      <v-avatar size="32" color="success" class="mr-3">
        <v-icon color="white" size="22">tabler-external-link</v-icon>
      </v-avatar>
      <span class="text-h5 font-weight-bold">Study Platform</span>
    </div>
    <v-row dense>
      <v-col cols="12" md="4">
        <span class="text-h6"> Study platform : </span>
        <span class="text-body-1">
          {{ itemData?.studyPlatform || "N/A" }}
        </span>
      </v-col>

      <v-col cols="12" md="8">
        <span class="text-h6"> Link : </span>
        <span class="text-body-1">
          {{ itemData?.link || "N/A" }}
        </span>
      </v-col>

      <v-col cols="12" md="4">
        <span class="text-h6"> Admin name : </span>
        <span class="text-body-1">
          {{ itemData?.updatedBy?.name || "N/A" }}
        </span>
      </v-col>

      <v-col cols="12" md="8">
        <span class="text-h6"> Note : </span>
        <span class="text-body-1">
          {{ itemData?.note || "N/A" }}
        </span>
      </v-col>
      <v-col cols="12" md>
        <span class="text-h6">
          <span class="text-error mr-2">*</span>Check list :
        </span>

        <v-checkbox
          v-for="(item, i) in checkList"
          :key="i"
          v-model="selectedCheckList"
          readonly
          :label="item"
          :value="i + 1"
          hide-details="auto"
          density="comfortable"
          :rules="[
            (v) => !!v || 'Check list is required',
            (v) => v.length > 0 || 'Check list is required',
          ]"
        ></v-checkbox>
      </v-col>
    </v-row>
  </v-card>

  <v-card
    v-show="userInfo?.role !== 'user' || feePermission?.view"
    rounded="lg"
    elevation="1"
    class="pa-4 mb-4"
  >
    <div class="d-flex align-center mb-4">
      <v-avatar size="32" color="warning" class="mr-3">
        <v-icon color="white" size="22">tabler-cash</v-icon>
      </v-avatar>
      <span class="text-h5 font-weight-bold">Teacher fee for the class</span>
    </div>

    <v-row dense>
      <v-col cols="12" md="4">
        <span class="text-h6"> Currency : </span>
        <span class="text-body-1">
          {{ itemData?.currency?.name || "N/A" }}
        </span>
      </v-col>
      <v-col cols="12" md="4">
        <span class="text-h6"> Regular : </span>
        <span class="text-body-1">
          {{ itemData?.regular || "N/A" }}
        </span>
      </v-col>
      <v-col cols="12" md="4">
        <span class="text-h6"> Student missing class : </span>
        <span class="text-body-1">
          {{ itemData?.studentMissing || "N/A" }}
        </span>
      </v-col>
      <v-col cols="12" md="4">
        <span class="text-h6"> Teacher missing class : </span>
        <span class="text-body-1">
          {{ itemData?.teacherMissing || "N/A" }}
        </span>
      </v-col>
      <v-col cols="12" md="4">
        <span class="text-h6"> Other : </span>
        <span class="text-body-1">
          {{ itemData?.other || "N/A" }}
        </span>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useAuth } from "@/composables/useAuth";

defineOptions({
  name: "ClassViewDetail",
});

const props = defineProps<{
  itemData?: Record<string, any>;
}>();

const { userInfo } = useAuth();

const selectedCheckList = ref<number[]>([]);
const checkList = [
  "Send metarials to students",
  "Send study link to students",
  "Send study link to teacher",
  "Send study link to admin",
];
const feePermission = ref<Record<string, unknown>>({});

watch(
  () => props.itemData,
  (itemData) => {
    selectedCheckList.value =
      itemData?.checkList?.split(",").map((it: string) => Number(it)) || [];
  },
);

onMounted(() => {
  feePermission.value =
    userInfo.value?.permissions?.find(
      (it) => it.link === "/admin/classes/fee",
    ) || {};
});
</script>

<style scoped></style>
