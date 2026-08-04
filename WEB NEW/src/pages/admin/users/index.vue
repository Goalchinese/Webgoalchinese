<template>
  <v-row class="mb-2">
    <v-col cols="12" md="6">
      <div class="text-h4 font-weight-bold">Users</div>
      <p class="text-body-small text-medium-emphasis mb-0">
        Manage all platform users and permissions.
      </p>
    </v-col>
  </v-row>

  <v-card rounded="md" elevation="1">
    <v-card-text>
      <v-row class="align-center mb-2" no-gutters justify="space-between">
        <v-col cols="6" class="d-flex align-center ga-2">
          <span class="text-h5 font-weight-bold">Users</span>

          <v-btn
            v-if="userInfo?.role !== 'user' || permission?.create"
            icon
            size="32"
            rounded="circle"
            variant="flat"
            color="primary"
            to="/admin/users/create"
          >
            <v-icon size="18">tabler-plus</v-icon>
          </v-btn>
        </v-col>
        <v-col cols="12" sm="12" md="3">
          <AppTextField
            v-model="search"
            placeholder="Search users..."
            prepend-inner-icon="tabler-search"
            density="compact"
            rounded="lg"
            hide-details
            clearable
          />
        </v-col>
      </v-row>
      <v-data-table
        v-model:options="pagination"
        :headers="headers"
        :items="items"
        :loading="isLoading"
        :server-items-length="pagination.total"
        :mobile-breakpoint="0"
        @update:options="updatePagination"
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center pa-2">
            <v-avatar size="48" rounded="lg" color="grey-lighten-4">
              <v-img v-if="item.photo" :src="`${baseUrl}${item.photo}`" />
              <v-img v-else :src="iconUser" />
            </v-avatar>
            <span class="font-weight-medium ms-3 text-truncate">{{
              item.name
            }}</span>
          </div>
        </template>

        <template #item.duty="{ item }">
          <v-chip
            v-if="item.duty"
            size="small"
            color="secondary"
            variant="tonal"
            label
          >
            {{ item.duty }}
          </v-chip>
          <span v-else>-</span>
        </template>

        <template #item.age="{ item }">
          {{ item.dateOfBirth ? calculateAge(item.dateOfBirth) : "-" }}
        </template>

        <template #item.gender="{ item }">
          <StatusChip v-if="item.gender" type="gender" :value="item.gender" />
          <span v-else>-</span>
        </template>

        <template #item.action="{ item }">
          <div class="d-flex">
            <v-btn
              v-if="userInfo?.role !== 'user' || permission?.edit"
              icon="tabler-pencil"
              variant="text"
              size="small"
              color="primary"
              :to="`/admin/users/edit/${item.id}`"
            />
            <v-btn
              v-if="
                (userInfo?.role !== 'user' || permission?.delete) &&
                userInfo?.username !== item.user?.username
              "
              icon="tabler-trash"
              variant="text"
              size="small"
              color="error"
              @click="deleteData(item.id)"
            />
          </div>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import iconUser from "@/assets/images/user.png";
import { useUsersAll } from "@/composables/useUsersAll";
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
  useUsersAll();

const headers = [
  { key: "name", title: "User Name", sortable: false, width: "30%" },
  { key: "phone", title: "Phone", sortable: false },
  { key: "duty", title: "Duty", sortable: false },
  { key: "age", title: "Age", sortable: false },
  { key: "gender", title: "Gender", sortable: false },
  { key: "action", title: "Action", sortable: false },
] as const;
</script>

<style lang="scss" scoped></style>
