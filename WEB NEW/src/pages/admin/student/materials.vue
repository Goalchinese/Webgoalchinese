<template>
  <v-row>
    <v-col cols="12" class="mb-4">
      <div class="text-h4 font-weight-bold">Student Materials</div>
      <p class="text-body-small text-medium-emphasis mb-0">
        Manage student materials and resources.
      </p>
    </v-col>
  </v-row>

  <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
    <v-row align="center">
      <v-col cols="12" md="4">
        <h2 class="text-h5 font-weight-bold">
          Select Students <span class="text-error">*</span>
        </h2>
      </v-col>
      <v-col cols="auto" class="ml-md-auto">
        <v-btn
          variant="plain"
          size="small"
          append-icon="tabler-refresh"
          :disabled="!entities.selected.value.length"
          @click="clearMaterials"
        >
          Clear
        </v-btn>
      </v-col>
      <v-col cols="12" md="3">
        <AppTextField
          v-model="entities.search.value"
          placeholder="Search students..."
          prepend-inner-icon="tabler-search"
          density="compact"
          rounded="lg"
          hide-details
          clearable
        />
      </v-col>
    </v-row>

    <v-data-table-server
      v-model="entities.selected.value"
      v-model:items-per-page="entities.pagination.itemsPerPage"
      :headers="entityHeaders"
      :items="entities.items.value"
      item-key="id"
      :loading="entities.isLoading.value"
      :items-length="entities.pagination.total"
      show-select
      :mobile-breakpoint="0"
      class="mt-4"
      return-object
      @update:options="entities.updatePagination"
      height="calc(100vh - 400px)"
      fixed-header
    >
      <template #item.addmissionNo="{ item }">
        <v-chip size="small" rounded="lg" color="primary" variant="tonal">
          {{ item.addmissionNo }}
        </v-chip>
      </template>
      <template #item.name="{ item }">
        <div class="d-flex align-center pa-1">
          <v-avatar size="48" rounded="lg" color="grey-lighten-4">
            <v-img v-if="item.photo" :src="`${baseUrl}${item.photo}`" />
            <v-img v-else :src="iconStudent" />
          </v-avatar>
          <span class="font-weight-medium ms-3 text-truncate">{{
            item.name
          }}</span>
        </div>
      </template>
      <template #item.studentType.name="{ item }">
        <StatusChip
          v-if="item.studentType?.name"
          type="studentType"
          :value="item.studentType?.name"
        />
        <span v-else>-</span>
      </template>
      <template #item.classType.name="{ item }">
        <StatusChip
          v-if="item.classType?.name"
          type="classType"
          :value="item.classType?.name"
        />
        <span v-else>-</span>
      </template>
      <template #item.age="{ item }">
        {{ item.dateOfBirth ? calculateAge(item.dateOfBirth) : "-" }}
      </template>
      <template #item.gender="{ item }">
        <StatusChip v-if="item.gender" type="gender" :value="item.gender" />
        <span v-else>-</span>
      </template>
      <template #item.points="{ item }">
        {{ item.pointStructure?.pointAfterUpdate || 0 }}
      </template>
    </v-data-table-server>
  </v-card>

  <v-card rounded="lg" elevation="1" class="pa-4">
    <v-row align="center">
      <v-col cols="12" md="4">
        <h2 class="text-h5 font-weight-bold">
          Select Materials <span class="text-error">*</span>
        </h2>
      </v-col>
      <v-col cols="auto" class="ml-md-auto">
        <v-btn
          variant="plain"
          size="small"
          append-icon="tabler-refresh"
          :disabled="!materials.selected.value.length"
          @click="materials.selected.value = []"
        >
          Clear
        </v-btn>
      </v-col>
      <v-col cols="12" md="3">
        <AppTextField
          v-model="materials.search.value"
          placeholder="Search materials..."
          prepend-inner-icon="tabler-search"
          density="compact"
          rounded="lg"
          hide-details
          clearable
        />
      </v-col>
    </v-row>

    <v-data-table-server
      v-model="materials.selected.value"
      v-model:items-per-page="materials.pagination.itemsPerPage"
      :headers="materialHeaders"
      :items="materials.items.value"
      item-key="id"
      :loading="materials.isLoading.value"
      :items-length="materials.pagination.total"
      show-select
      :mobile-breakpoint="0"
      class="mt-4"
      return-object
      @update:options="materials.updatePagination"
      height="calc(100vh - 400px)"
      fixed-header
    >
      <template #item.no="{ item }">
        <v-chip size="small" rounded="lg" color="primary" variant="tonal">
          {{ item.no }}
        </v-chip>
      </template>
      <template #item.photo="{ item }">
        <v-avatar size="48" rounded="lg" color="grey-lighten-4" class="my-2">
          <v-img v-if="item.photo" :src="`${baseUrl}${item.photo}`" cover />
          <v-img v-else :src="iconDocument" />
        </v-avatar>
      </template>
      <template #item.date="{ item }">
        {{ new Date(item.createdAt).toLocaleDateString("en-GB") }}
      </template>
      <template #item.description="{ item }">
        {{ item.description || "N/A" }}
      </template>
      <template #item.documentType="{ item }">
        <StatusChip type="documentType" :value="item.documentType" label />
      </template>
    </v-data-table-server>
  </v-card>

  <v-row justify="end" class="mt-4">
    <v-col cols="auto">
      <v-btn
        v-if="userInfo?.role !== 'user' || permission?.edit"
        color="primary"
        class="text-none"
        :disabled="
          !entities.selected.value.length || !materials.selected.value.length
        "
        :loading="isSaving"
        @click="assignMaterials"
      >
        <v-icon start>tabler-device-floppy</v-icon>
        Update
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import iconStudent from "@/assets/images/student.png";
import iconDocument from "@/assets/images/document.png";
import { useDualPicker } from "@/composables/useDualPicker";
import { calculateAge } from "@/utils/date";

const { userInfo } = useAuth();
const route = useRoute();
const baseUrl = import.meta.env.VITE_APP_API_IMAGE;

const permission = computed(() =>
  userInfo.value?.permissions?.find(
    (it: { link?: string }) => it.link === route.path,
  ),
);

const { entities, materials, isSaving, assignMaterials, clearMaterials } =
  useDualPicker({
    entityRole: "student",
    materialFor: "student",
    clearType: "all",
  });

const entityHeaders = [
  {
    key: "addmissionNo",
    title: "Admission No.",
    sortable: false,
    width: "10%",
  },
  { key: "name", title: "Student Name", sortable: false },
  { key: "phone", title: "Mobile No.", sortable: false, width: "10%" },
  { key: "points", title: "Points", sortable: false, width: "7%" },
  {
    key: "studentType.name",
    title: "Student Type",
    sortable: false,
    width: "12%",
  },
  { key: "classType.name", title: "Class Type", sortable: false, width: "10%" },
  { key: "age", title: "Age", sortable: false, width: "5%" },
  { key: "gender", title: "Gender", sortable: false, width: "7%" },
] as const;

const materialHeaders = [
  { key: "no", title: "Materials No.", sortable: false, width: "8%" },
  { key: "photo", title: "Photo", sortable: false, width: "8%" },
  { key: "title", title: "Title", sortable: false, width: "20%" },
  {
    key: "materialCategory.name",
    title: "Materials Category",
    sortable: false,
  },
  { key: "materialFor.name", title: "For teacher/student", sortable: false },
  { key: "materialType.name", title: "Type", sortable: false },
  { key: "documentType", title: "File type", sortable: false },
  { key: "date", title: "Date", sortable: false },
  { key: "description", title: "Description", sortable: false },
] as const;
</script>

<style lang="scss" scoped></style>
