<template>
  <v-row>
    <v-col cols="12" class="mb-4">
      <div class="text-h4 font-weight-bold">Students</div>
      <p class="text-body-small text-medium-emphasis mb-0">
        Manage all student profiles and admissions.
      </p>
    </v-col>
  </v-row>

  <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
    <v-row class="align-center mb-2" no-gutters>
      <v-col cols="6" class="d-flex align-center ga-2">
        <span class="text-h5 font-weight-bold">Student</span>

        <v-btn
          v-if="userInfo?.role !== 'user' || permission?.create"
          icon
          size="32"
          variant="flat"
          color="primary"
          to="/admin/student/create"
        >
          <v-icon size="18">tabler-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <VRow dense>
      <VCol>
        <div class="d-flex align-center">
          <h6 class="text-h6 font-weight-bold">
            <VIcon icon="tabler-filter" size="20" class="me-1" />
            Filter
          </h6>
          <v-btn
            variant="plain"
            size="small"
            append-icon="tabler-refresh"
            :disabled="!hasActiveFilters"
            @click="clearFilters"
          >
            Clear
          </v-btn>
        </div>
      </VCol>
    </VRow>

    <v-row dense align="end">
      <v-col cols="12" sm="6" md="2">
        <AppSelect
          v-model="classTypeFilter"
          :items="['Private', 'Group']"
          label="Class Type"
          density="compact"
          rounded="lg"
          hide-details
          clearable
        />
      </v-col>
      <v-col cols="12" sm="6" md="2">
        <AppSelect
          v-model="studentTypeFilter"
          :items="['Online', 'Offline']"
          label="Student Type"
          density="compact"
          rounded="lg"
          hide-details
          clearable
        />
      </v-col>
      <v-col cols="12" sm="12" md="2">
        <AppTextField
          v-model="search"
          placeholder="Search students..."
          prepend-inner-icon="tabler-search"
          density="compact"
          rounded="lg"
          hide-details
          clearable
        />
      </v-col>
    </v-row>

    <VRow>
      <VCol>
        <v-data-table
          v-model:options="pagination"
          :headers="headers"
          :items="items"
          :loading="isLoading"
          :server-items-length="pagination.total"
          :mobile-breakpoint="0"
          @update:options="updatePagination"
        >
          <template #item.addmissionNo="{ item }">
            <v-chip
              size="small"
              rounded="lg"
              color="primary"
              variant="tonal"
              :to="`./view/${item.id}`"
            >
              {{ item.addmissionNo }}
            </v-chip>
          </template>

          <template #item.name="{ item }">
            <div class="d-flex align-center pa-1">
              <v-avatar size="48" rounded="pill" color="grey-lighten-4">
                <v-img v-if="item.photo" :src="`${baseUrl}${item.photo}`" />
                <v-img v-else :src="iconStudent" />
              </v-avatar>
              <router-link
                :to="`./view/${item.id}`"
                class="text-primary font-weight-medium ms-3 text-truncate text-decoration-none"
              >
                {{ item.name }}
              </router-link>
            </div>
          </template>

          <template #item.age="{ item }">
            {{ item.dateOfBirth ? calculateAge(item.dateOfBirth) : "-" }}
          </template>
          <template #item.points="{ item }">
            {{ item.pointStructure?.pointAfterUpdate || 0 }}
          </template>
          <template #item.classNo="{ item }">
            {{ item.classStudent?.[0]?.class?.no || "N/A" }}
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
          <template #item.gender="{ item }">
            <StatusChip  v-if="item.gender" type="gender" :value="item.gender" />
            <span v-else>-</span>
          </template>

          <template #item.action="{ item }">
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  icon="tabler-dots-vertical"
                  variant="text"
                  size="small"
                  v-bind="props"
                />
              </template>
              <v-list>
                <v-list-item
                  v-if="userInfo?.role !== 'user' || permission?.view"
                  :to="`./view/${item.id}`"
                  title="View"
                />
                <v-list-item
                  v-if="userInfo?.role !== 'user' || permission?.edit"
                  :to="`./edit/${item.id}`"
                  title="Edit"
                />
                <v-list-item
                  v-if="userInfo?.role !== 'user' || permission?.delete"
                  title="Delete"
                  @click="deleteData(item.id)"
                />
              </v-list>
            </v-menu>
          </template>
        </v-data-table>
      </VCol>
    </VRow>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import iconStudent from "@/assets/images/student.png";
import { useStudentsAll } from "@/composables/useStudentsAll";
import { calculateAge } from "@/utils/date";

const { userInfo } = useAuth();
const route = useRoute();
const baseUrl = import.meta.env.VITE_APP_API_IMAGE;

const permission = computed(() =>
  userInfo.value?.permissions?.find(
    (it: { link?: string }) => it.link === route.path,
  ),
);

const { search, isLoading, items, pagination, updatePagination, deleteData } =
  useStudentsAll();

const classTypeFilter = ref<string | null>(null);
const studentTypeFilter = ref<string | null>(null);

const classTypeColor = (name?: string) => {
  if (name === "Private") return "primary";
  if (name === "Group") return "secondary";
  return "grey";
};

const genderColor = (gender?: string) => {
  if (gender === "Male") return "info";
  if (gender === "Female") return "error";
  return "grey";
};

const hasActiveFilters = computed(() => {
  return !!classTypeFilter.value || !!studentTypeFilter.value || !!search.value;
});

const clearFilters = () => {
  classTypeFilter.value = null;
  studentTypeFilter.value = null;
  search.value = "";
};

const headers = [
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
  { key: "classNo", title: "Class No.", sortable: false, width: "7%" },
  { key: "age", title: "Age", sortable: false, width: "5%" },
  { key: "gender", title: "Gender", sortable: false, width: "7%" },
  { key: "action", title: "Action", sortable: false, width: "7%" },
] as const;
</script>

<style lang="scss" scoped></style>
