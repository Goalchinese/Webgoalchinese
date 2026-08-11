<template>
  <div>
    <div class="d-flex align-center ga-3 mb-4">
      <v-avatar size="32" color="info" variant="tonal">
        <v-icon color="info" size="18">tabler-user</v-icon>
      </v-avatar>
      <span class="text-h5 font-weight-bold">Personal Detail</span>
    </div>
    <v-row>
      <v-col cols="12" md="4">
        <label class="v-label mb-2 text-body-large font-weight-bold mr-2">
          Personal Name :
        </label>
        <label for="">{{ itemData?.name }}</label>
      </v-col>
      <v-col cols="12" md="2">
        <label class="v-label mb-2 text-body-large font-weight-bold mr-2">
          Gender :
        </label>
        <label for="">{{ itemData?.gender }}</label>
      </v-col>
      <v-col cols="12" md="2">
        <label class="v-label mb-2 text-body-large font-weight-bold mr-2">
          Age :
        </label>
        <label for="">{{ itemData?.dateOfBirth ? calculateAge(itemData.dateOfBirth) : "N/A" }}</label>
      </v-col>
      <v-col cols="12" md="4">
        <label class="v-label mb-2 text-body-large font-weight-bold mr-2">
          Date of Birth :
        </label>
        <label for="">{{ itemData?.dateOfBirth }}</label>
      </v-col>
      <v-col cols="12" md="4">
        <label class="v-label mb-2 text-body-large font-weight-bold mr-2">
          Address :
        </label>
        <label for="">{{ itemData?.address || "N/A" }}</label>
      </v-col>
      <v-col cols="12" md="4">
        <label class="v-label mb-2 text-body-large font-weight-bold mr-2">
          Phone :
        </label>
        <label for="">{{ itemData?.phone || "N/A" }}</label>
      </v-col>
      <v-col cols="12" md="4">
        <label class="v-label mb-2 text-body-large font-weight-bold mr-2">
          Resume No :
        </label>
        <label for="">{{ itemData?.resumeNo || "N/A" }}</label>
      </v-col>

      <v-col cols="12" class="mt-2">
        <div class="d-flex align-center ga-3 mb-2">
          <v-avatar size="32" color="purple" variant="tonal">
            <v-icon color="purple" size="18">tabler-clipboard-text</v-icon>
          </v-avatar>
          <span class="text-h5 font-weight-bold">Admission Detail</span>
        </div>
      </v-col>
      <v-col cols="12" md="4">
        <label class="v-label mb-2 text-body-large font-weight-bold mr-2"
          >Register Date :
        </label>
        <label for="">{{ itemData?.registerDate || "N/A" }}</label>
      </v-col>
      <v-col cols="12" md="4">
        <label class="v-label mb-2 text-body-large font-weight-bold mr-2"
          >Score for kids :
        </label>
        <label for="">{{ itemData?.scoreForKids || "N/A" }}</label>
      </v-col>
      <v-col cols="12" md="4">
        <label class="v-label mb-2 text-body-large font-weight-bold mr-2"
          >Score for Adult :
        </label>
        <label for="">{{ itemData?.scoreForAdult || "N/A" }}</label>
      </v-col>
      <v-col cols="12" md="4">
        <label class="v-label mb-2 text-body-large font-weight-bold mr-2"
          >Teacher type :
        </label>
        <label for="">{{ itemData?.teacherType?.name || "N/A" }}</label>
      </v-col>
      <v-col cols="12" md="8">
        <label class="v-label mb-2 text-body-large font-weight-bold mr-2"
          >Teacher No :
        </label>
        <label for="">{{ itemData?.teacherNo || "N/A" }}</label>
      </v-col>
      <v-col cols="12" md="4">
        <label class="v-label mb-2 text-body-large font-weight-bold mr-2"
          >Available for class :
        </label>
        <label for="">{{ itemData?.avaliableForClass || "N/A" }}</label>
      </v-col>
      <v-col cols="12" md="4">
        <label class="v-label mb-2 text-body-large font-weight-bold mr-2"
          >Language :
        </label>
        <label for="">{{ itemData?.language || "N/A" }}</label>
      </v-col>
      <v-col cols="12" md="4">
        <label class="v-label mb-2 text-body-large font-weight-bold mr-2">
          Inter view note details :
        </label>
        <label for="">{{ itemData?.note || "N/A" }}</label>
      </v-col>
      <v-col cols="12" md="4">
        <label class="v-label mb-2 text-body-large font-weight-bold mr-2"
          >Teacher status :
        </label>
        <label for="">{{ itemData?.status || "N/A" }}</label>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { calculateAge } from "@/utils/date";

defineOptions({
  name: "TeacherViewDetail",
});

defineProps<{
  itemData?: Record<string, any>;
}>();
</script>

<style scoped></style>
