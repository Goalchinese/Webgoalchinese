<template>
  <v-row class="mb-2">
    <v-col cols="12" md="6">
      <div class="text-h4 font-weight-bold">Materials</div>
      <p class="text-body-small text-medium-emphasis mb-0">
        Manage all learning materials and resources.
      </p>
    </v-col>
  </v-row>

  <v-card rounded="lg" elevation="1">
    <v-card-text>
      <VRow dense align="center" class="">
        <v-col cols="6" class="d-flex align-center ga-2">
          <h5 class="text-h5 font-weight-bold mb-0">Materials</h5>
          <v-btn
            v-if="userInfo?.role !== 'user' || permission?.create"
            icon
            color="primary"
            rounded="pill"
            variant="flat"
            density="compact"
            to="/admin/materials/create"
          >
            <v-icon>tabler-plus</v-icon>
          </v-btn>
        </v-col>
      </VRow>

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
            v-model="filters.category"
            :items="[]"
            item-title="name"
            item-value="id"
            label="Materials Category"
            density="compact"
            rounded="lg"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="12" sm="6" md="2">
          <AppSelect
            v-model="filters.type"
            :items="[]"
            label="Materials Types"
            density="compact"
            rounded="lg"
            hide-details
            clearable
          />
        </v-col>

        <v-col cols="12" sm="12" md="4">
          <AppTextField
            v-model="search"
            placeholder="Search materials..."
            prepend-inner-icon="tabler-search"
            density="compact"
            rounded="lg"
            hide-details
            clearable
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-data-table-server
            v-model:items-per-page="pagination.itemsPerPage"
            :headers="headers"
            :items="items"
            :loading="isLoading"
            :items-length="pagination.total"
            :mobile-breakpoint="0"
            @update:options="updatePagination"
            height="calc(100vh - 370px)"
            fixed-header
          >
            <template #item.no="{ item }">
              <v-chip
                size="small"
                rounded="lg"
                color="primary"
                variant="tonal"
                >{{ item.no || "-" }}</v-chip
              >
            </template>
            <template #item.photo="{ item }">
              <v-avatar size="48" rounded color="grey-lighten-4" class="my-2">
                <v-img
                  v-if="item.photo"
                  :src="`${baseUrl}${item.photo}`"
                  cover
                />
                <v-img v-else :src="iconDocument" />
              </v-avatar>
            </template>
            <template #item.materialCategory.name="{ item }">
              <v-chip
                v-if="item.materialCategory?.name"
                size="small"
                :color="
                  /kid/i.test(item.materialCategory.name) ? 'info' : 'success'
                "
                variant="tonal"
                rounded="pill"
                label
              >
                {{ item.materialCategory.name }}
              </v-chip>
              <span v-else>-</span>
            </template>
            <template #item.date="{ item }">
              {{
                item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString("en-GB")
                  : "-"
              }}
            </template>
            <template #item.documentType="{ item }">
              <StatusChip
                type="documentType"
                :value="item.documentType"
                label
              />
            </template>
            <template #item.description="{ item }">
              {{ item.description || "N/A" }}
            </template>

            <template #item.action="{ item }">
              <div class="d-flex">
                <v-btn
                  v-if="userInfo?.role !== 'user' || permission?.edit"
                  icon="tabler-pencil"
                  variant="text"
                  size="small"
                  color="primary"
                  :to="`/admin/materials/edit/${item.id}`"
                />
                <v-btn
                  v-if="userInfo?.role !== 'user' || permission?.delete"
                  icon="tabler-trash"
                  variant="text"
                  size="small"
                  color="error"
                  @click="deleteData(item.id)"
                />
              </div>
            </template>
          </v-data-table-server>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import iconDocument from "@/assets/images/document.png";
import { useMaterialsAll } from "@/composables/useMaterialsAll";

const { userInfo } = useAuth();
const route = useRoute();
const baseUrl = import.meta.env.VITE_APP_API_IMAGE;

const permission = computed(() =>
  userInfo.value?.permissions?.find(
    (it: { link?: string }) => it.link === route.path,
  ),
);

const {
  search,
  isLoading,
  items,
  pagination,
  filters,
  hasActiveFilters,
  updatePagination,
  deleteData,
  clearFilters,
} = useMaterialsAll();

const headers = [
  { key: "no", title: "Materials No.", sortable: false, width: "6%" },
  { key: "photo", title: "Photo", sortable: false, width: "6%" },
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
  { key: "action", title: "Action", sortable: false, width: "7%" },
] as const;
</script>

<style lang="scss" scoped></style>
