<template>
  <v-row>
    <v-col cols="12" class="mb-4">
      <div class="text-h4 font-weight-bold">All Class Check</div>
      <p class="text-body-small text-medium-emphasis mb-0">
        View and manage all classes.
      </p>
    </v-col>
  </v-row>

  <v-alert
    v-if="showExpiryWarning && nearExpiryCount > 0"
    type="warning"
    variant="tonal"
    closable
    class="mb-4"
    @click:close="showExpiryWarning = false"
  >
    {{ nearExpiryCount }} class{{ nearExpiryCount > 1 ? "es" : "" }} on this
    page {{ nearExpiryCount > 1 ? "have" : "has" }} 2 or fewer sessions
    remaining.
  </v-alert>

  <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
    <VRow dense align="center" class="">
      <v-col cols="6" class="d-flex align-center ga-2">
        <h5 class="text-h5 font-weight-bold mb-0">Classes</h5>
        <v-btn
          v-if="userInfo?.role !== 'user' || permission?.create"
          icon
          color="primary"
          rounded="pill"
          variant="flat"
          density="compact"
          to="/admin/classes/create"
        >
          <v-icon>tabler-plus</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="6" class="d-flex justify-end">
        <v-btn
          icon="tabler-printer"
          rounded
          variant="tonal"
          color="grey"
          :disabled="!selectedClass.length"
          @click="printData"
        />
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
          v-model="filters.classType"
          :items="classTypes"
          item-title="name"
          item-value="id"
          label="Class Type"
          density="compact"
          rounded="lg"
          hide-details
          clearable
        />
      </v-col>
      <v-col cols="12" sm="6" md="2">
        <AppSelect
          v-model="filters.studyDay"
          :items="STUDY_DAYS"
          label="Study Day"
          density="compact"
          rounded="lg"
          hide-details
          clearable
        />
      </v-col>
      <v-col cols="12" sm="6" md="2">
        <AppSelect
          v-model="filters.remaining"
          :items="REMAINING_OPTIONS"
          label="Remaining Class"
          density="compact"
          rounded="lg"
          hide-details
          clearable
        />
      </v-col>
      <v-col cols="12" sm="6" md="2">
        <AppSelect
          v-model="filters.status"
          :items="STATUS_OPTIONS"
          label="Active / Inactive"
          density="compact"
          rounded="lg"
          hide-details
          clearable
        />
      </v-col>
      <v-col cols="12" sm="12" md="4">
        <AppTextField
          v-model="search"
          placeholder="Search class, teacher..."
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
          v-model="selectedClass"
          v-model:options="pagination"
          :headers="headers"
          :items="items"
          item-value="id"
          :loading="isLoading"
          :server-items-length="pagination.total"
          show-select
          return-object
          :mobile-breakpoint="0"
          @update:options="updatePagination"
        >
          <template #item.no="{ item, index }">
            <v-chip size="small" rounded="lg" color="primary" variant="tonal">
              {{ item.no}}
            </v-chip>
          </template>
          <template #item.classType="{ item }">
               <StatusChip type="classType" :value="item.classType?.name" rounded="lg" />
          </template>

          <template #item.startDate="{ item }">
            <span class="text-no-wrap">
              {{
                item.startDate
                  ? new Date(item.startDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "-"
              }}
            </span>
          </template>

          <template #item.studyDay="{ item }">
            <div v-for="(it, i) in item.classStudy" :key="i" class="py-1 mb-1">
              <StatusChip type="day" :value="it.day" rounded="lg" />
            </div>
          </template>

          <template #item.timeSlot="{ item }">
            <div v-for="(it, i) in item.classStudy" :key="i" class="mb-1">
              <StatusChip type="timeSlot" :value="`${it.startTime} - ${it.endTime}`" rounded="lg" />
            </div>
          </template>

          <template #item.teacherName="{ item }">
            {{ item.teacher?.name }}
          </template>

          <template #item.completed="{ item }">
            {{ item?.attendance?.length || 0 }}
          </template>

          <template #item.remaining="{ item }">
            <span
              :class="{
                'text-error font-weight-bold':
                  item.registeredTimes - (item?.attendance?.length || 0) <= 2,
              }"
            >
              {{ item.registeredTimes - (item?.attendance?.length || 0) }}
            </span>
          </template>

          <template #item.status="{ item }">
            <StatusChip type="status" :value="item.status" />
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
                <v-list-item :to="`./view/${item.id}`" title="View" />
                <v-list-item
                  v-if="userInfo?.role !== 'user' || permission?.edit"
                  :to="`./edit/${item.id}`"
                  title="Edit"
                />
                <v-list-item :to="`./copy/${item.id}`" title="Copy" />
                <v-list-item to="./attendance" title="Attendance" />
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
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import {
  useClassesAll,
  STUDY_DAYS,
  STATUS_OPTIONS,
  REMAINING_OPTIONS,
} from "@/composables/useClassesAll";

const { userInfo } = useAuth();
const route = useRoute();

const permission = computed(() =>
  userInfo.value?.permissions?.find(
    (it: { link?: string }) => it.link === route.path,
  ),
);

const {
  search,
  isLoading,
  items,
  selectedClass,
  classTypes,
  filters,
  pagination,
  hasActiveFilters,
  nearExpiryCount,
  showExpiryWarning,
  clearFilters,
  updatePagination,
  deleteData,
  printData,
} = useClassesAll();

const headers = [
  { key: "no", title: "Class No.", sortable: false, width: "8%" },
  { key: "name", title: "Class Name", sortable: false },
  { key: "classType", title: "Class Type", sortable: false, width: "8%" },
  { key: "startDate", title: "Start Date", sortable: false, width: "9%" },
  { key: "studyDay", title: "Study day", sortable: false, width: "8%" },
  { key: "timeSlot", title: "Time slot", sortable: false, width: "9%" },
  { key: "teacherName", title: "Teacher name", sortable: false, width: "9%" },
  {
    key: "registeredTimes",
    title: "Total class time",
    sortable: false,
    align: "center",
    width: "5%",
  },
  {
    key: "completed",
    title: "Completed class",
    sortable: false,
    align: "center",
    width: "6%",
  },
  {
    key: "remaining",
    title: "Remaining class",
    sortable: false,
    align: "center",
    width: "6%",
  },
  { key: "status", title: "Status", sortable: false, width: "7%" },
  { key: "action", title: "Action", sortable: false, width: "5%" },
] as const;
</script>

<style lang="scss" scoped></style>
