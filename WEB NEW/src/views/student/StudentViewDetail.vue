<template>
  <div>
    <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
      <div class="d-flex align-center mb-4">
        <v-avatar size="32" color="info-lighten-4" class="mr-3">
          <v-icon color="info" size="18">tabler-user</v-icon>
        </v-avatar>
        <span class="text-h5 font-weight-bold">Personal Detail</span>
      </div>
      <v-row>
        <v-col cols="12" md="4">
          <label class="v-label mb-2 text-subtitle-2 font-weight-bold mr-2">
            Student Name :
          </label>
          <label for="">{{ itemData?.name }}</label>
        </v-col>
        <v-col cols="12" md="2">
          <label class="v-label mb-2 text-subtitle-2 font-weight-bold mr-2">
            Gender :
          </label>
          <label for="">{{ itemData?.gender }}</label>
        </v-col>
        <v-col cols="12" md="2">
          <label class="v-label mb-2 text-subtitle-2 font-weight-bold mr-2">
            Age :
          </label>
          <label for="">{{ itemData?.dateOfBirth ? calculateAge(itemData.dateOfBirth) : "N/A" }}</label>
        </v-col>
        <v-col cols="12" md="4">
          <label class="v-label mb-2 text-subtitle-2 font-weight-bold mr-2">
            Date of Birth :
          </label>
          <label for="">{{ itemData?.dateOfBirth }}</label>
        </v-col>
        <v-col cols="12" md="4">
          <label class="v-label mb-2 text-subtitle-2 font-weight-bold mr-2">
            Address :
          </label>
          <label for="">{{ itemData?.address || "N/A" }}</label>
        </v-col>
        <v-col cols="12" md="4">
          <label class="v-label mb-2 text-subtitle-2 font-weight-bold mr-2">
            Phone :
          </label>
          <label for="">{{ itemData?.phone || "N/A" }}</label>
        </v-col>
        <v-col cols="12" md="4">
          <label class="v-label mb-2 text-subtitle-2 font-weight-bold mr-2">
            School name :
          </label>
          <label for="">{{ itemData?.schoolName || "N/A" }}</label>
        </v-col>
      </v-row>
    </v-card>

    <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
      <div class="d-flex align-center mb-4">
        <v-avatar size="32" color="teal-lighten-4" class="mr-3">
          <v-icon color="teal" size="18">tabler-clipboard-text</v-icon>
        </v-avatar>
        <span class="text-h5 font-weight-bold">Admission Detail</span>
      </div>
      <v-row>
        <v-col cols="12" md="4">
          <label class="v-label mb-2 text-subtitle-2 font-weight-bold mr-2"
            >Addmission Date :
          </label>
          <label for="">{{ itemData?.addmissionDate || "N/A" }}</label>
        </v-col>
        <v-col cols="12" md="4">
          <label class="v-label mb-2 text-subtitle-2 font-weight-bold mr-2"
            >Student type :
          </label>
          <label for="">{{ itemData?.studentType?.name || "N/A" }}</label>
        </v-col>
        <v-col cols="12" md="4">
          <label class="v-label mb-2 text-subtitle-2 font-weight-bold mr-2"
            >Class Type :
          </label>
          <label for="">{{ itemData?.classType?.name || "N/A" }}</label>
        </v-col>
        <v-col cols="12" md="4">
          <label class="v-label mb-2 text-subtitle-2 font-weight-bold mr-2"
            >End Class Date :
          </label>
          <label for="">{{ itemData?.endClassDate || "N/A" }}</label>
        </v-col>
        <v-col cols="12" md="8">
          <label class="v-label mb-2 text-subtitle-2 font-weight-bold mr-2"
            >Admission No. :
          </label>
          <label for="">{{ itemData?.addmissionNo || "N/A" }}</label>
        </v-col>
        <v-col cols="12" md="4">
          <label class="v-label mb-2 text-subtitle-2 font-weight-bold mr-2"
            >Student Status :
          </label>
          <label for="">{{ itemData?.status || "N/A" }}</label>
        </v-col>
        <v-col cols="12" md="4">
          <label class="v-label mb-2 text-subtitle-2 font-weight-bold mr-2"
            >Branch :
          </label>
          <label for="">{{ itemData?.branch?.name || "N/A" }}</label>
        </v-col>
        <v-col cols="12" md="4">
          <label class="v-label mb-2 text-subtitle-2 font-weight-bold mr-2">
            extra note details :
          </label>
          <label for="">{{ itemData?.note || "N/A" }}</label>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { calculateAge } from "@/utils/date";

defineOptions({
  name: "StudentViewDetail",
});

defineProps<{
  itemData?: Record<string, any>;
}>();
</script>

<style scoped></style>
