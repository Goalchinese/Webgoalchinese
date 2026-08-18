<template>
  <v-row align="center">
    <v-col cols="12" md="6" class="d-flex align-center ga-3">
      <div>
        <div class="text-h4 font-weight-bold">Teachers</div>
        <p class="text-body-small text-medium-emphasis mb-0">
          Manage all teachers and their teaching information.
        </p>
      </div>
    </v-col>
  </v-row>

  <v-card rounded="lg" elevation="1" class="pa-4 mt-4">
    <v-row class="align-center mb-2" no-gutters justify="space-between">
      <v-col cols="6" class="d-flex align-center ga-2">
        <span class="text-h5 font-weight-bold">Teacher</span>

        <v-btn
          v-if="userInfo?.role !== 'user' || permission?.create"
          icon
          size="32"
          rounded="circle"
          variant="flat"
          color="primary"
          to="/admin/teacher/create"
        >
          <v-icon size="18">tabler-plus</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="12" sm="12" md="3">
        <AppTextField
          v-model="search"
          placeholder="Search teachers..."
          prepend-inner-icon="tabler-search"
          density="compact"
          rounded="lg"
          hide-details
          clearable
        />
      </v-col>
    </v-row>

    <v-data-table-server
      v-model:items-per-page="pagination.itemsPerPage"
      :headers="headers"
      :items="items"
      :loading="isLoading"
      :items-length="pagination.total"
      :mobile-breakpoint="0"
      @update:options="updatePagination"
      height="calc(100vh - 350px)"
      fixed-header
    >
      <template #item.teacherNo="{ item }">
        <v-chip
          size="small"
          rounded="lg"
          color="primary"
          variant="tonal"
          :to="`./view/${item.id}`"
        >
          {{ item.teacherNo }}
        </v-chip>
      </template>

      <template #item.name="{ item }">
        <div class="d-flex align-center pa-1">
          <v-avatar size="48" rounded="pill" color="grey-lighten-4">
            <v-img v-if="item.photo" :src="`${baseUrl}${item.photo}`" />
            <v-img v-else :src="iconTeacher" />
          </v-avatar>
          <router-link
            :to="`./view/${item.id}`"
            class="font-weight-medium ms-3 text-truncate text-primary-darken-4 text-decoration-none"
          >
            {{ item.name }}
          </router-link>
        </div>
      </template>

      <template #item.avaliableForClass="{ item }">
        <StatusChip
          type="avaliableForClass"
          v-if="item.avaliableForClass"
          :value="item.avaliableForClass"
        />
        <span v-else>-</span>
      </template>

      <template #item.gender="{ item }">
        <StatusChip v-if="item.gender" type="gender" :value="item.gender" />
        <span v-else>-</span>
      </template>
      <template #item.age="{ item }">
        {{ item.dateOfBirth ? calculateAge(item.dateOfBirth) : "-" }}
      </template>
      <template #item.score="{ item }">
        {{ item.pointStructure?.pointAfterUpdate || 0 }}
      </template>
      <template #item.registerDate="{ item }">
        {{
          item.registerDate
            ? new Date(item.registerDate).toLocaleDateString("en-GB")
            : "-"
        }}
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
          <v-list density="compact">
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
    </v-data-table-server>
  </v-card>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import iconTeacher from "@/assets/images/teacher.png";
import { useTeachersAll } from "@/composables/useTeachersAll";
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
  useTeachersAll();

const availableForColor = (value: string) => {
  if (value === "Kids") return "success";
  if (value === "Adult") return "info";
  return "secondary";
};

const headers = [
  { key: "teacherNo", title: "Teacher No.", sortable: false },
  { key: "name", title: "Teacher Name", sortable: false, width: "20%" },
  { key: "registerDate", title: "Start teaching date", sortable: false },
  { key: "avaliableForClass", title: "Available for", sortable: false },
  { key: "language", title: "Language", sortable: false },
  { key: "score", title: "Teacher score", sortable: false },
  { key: "age", title: "Age", sortable: false },
  { key: "gender", title: "Gender", sortable: false },
  { key: "action", title: "Action", sortable: false },
] as const;
</script>

<style lang="scss" scoped></style>
