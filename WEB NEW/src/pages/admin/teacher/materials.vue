<script setup lang="ts">
const {
  iconTeacher,
  iconDocument,
  baseUrl,
  permission,
  userInfo,
  search,
  searchMaterials,
  headers,
  items,
  headersMaterials,
  itemsMaterials,
  selectedTeacher,
  selectedMaterials,
  isLoadingTeachers,
  isLoadingMaterials,
  paginationTeachers,
  paginationMaterials,
  calulateAge,
  update,
  clearMaterials,
  updatePaginationTeachers,
  updatePaginationMaterials,
} = useAdminTeacherMaterials();
</script>

<template>
  <v-row>
    <v-col cols="12" class="mb-4">
      <div class="text-h4 font-weight-bold">Teacher Materials</div>
      <p class="text-body-small text-medium-emphasis mb-0">
        Assign learning materials to teachers.
      </p>
    </v-col>
  </v-row>

  <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
    <v-row align="center">
      <v-col cols="12" md="4">
        <span class="text-h5 font-weight-bold">
          Select Teachers
          <span class="text-error">*</span>
        </span>
      </v-col>
      <v-col cols="auto" class="ml-md-auto">
        <v-btn
          variant="plain"
          size="small"
          append-icon="tabler-refresh"
          :disabled="!selectedTeacher.length"
          @click="clearMaterials"
        >
          Clear
        </v-btn>
      </v-col>
      <v-col cols="12" md="3">
        <AppTextField
          v-model="search"
          placeholder="Search..."
          density="compact"
          rounded="lg"
          prepend-inner-icon="tabler-search"
          hide-details="auto"
          clearable
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <v-data-table-server
          v-model="selectedTeacher"
          :headers="headers"
          :items="items"
          :loading="isLoadingTeachers"
          :items-length="paginationTeachers.total"
          v-model:items-per-page="paginationTeachers.itemsPerPage"
          mobile-breakpoint="0"
          show-select
          item-value="id"
          return-object
          @update:options="updatePaginationTeachers"
        >
          <template #item.teacherNo="{ item }">
            <v-chip size="small" rounded="lg" color="primary" variant="tonal">
              {{ item.teacherNo }}
            </v-chip>
          </template>
          <template #item.name="{ item }">
            <div class="d-flex align-center pa-1">
              <v-avatar size="64" rounded="pill" color="grey-lighten-4">
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
          <template #item.score="{ item }">
            {{ item.pointStructure?.pointAfterUpdate || 0 }}
          </template>
          <template #[`item.age`]="{ item }">
            {{ calulateAge(item.dateOfBirth) }}
          </template>

          <template #[`item.registerDate`]="{ item }">
            {{ new Date(item.registerDate).toLocaleDateString("en-GB") }}
          </template>
          <template #item.gender="{ item }">
            <StatusChip v-if="item.gender" type="gender" :value="item.gender" />
            <span v-else>-</span>
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>
  </v-card>

  <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
    <v-row align="center" justify="space-between">
      <v-col cols="12" md="4">
        <h5 class="text-h5 font-weight-bold">
          Select Materials
          <span class="text-error">*</span>
        </h5>
      </v-col>
      <v-col cols="12" md="3">
        <AppTextField
          v-model="searchMaterials"
          placeholder="Search..."
          density="compact"
          rounded="lg"
          prepend-inner-icon="tabler-search"
          hide-details="auto"
          clearable
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <v-data-table-server
          v-model="selectedMaterials"
          :headers="headersMaterials"
          :items="itemsMaterials"
          :loading="isLoadingMaterials"
          :items-length="paginationMaterials.total"
          v-model:items-per-page="paginationMaterials.itemsPerPage"
          show-select
          item-value="id"
          return-object
          mobile-breakpoint="0"
          @update:options="updatePaginationMaterials"
        >
          <template #item.no="{ item }">
            <v-chip size="small" rounded="lg" color="primary" variant="tonal">
              {{ item.no }}
            </v-chip>
          </template>
          <template #item.photo="{ item }">
            <v-avatar size="64" rounded color="grey lighten-4" class="my-2">
              <v-img
                height="64"
                width="64"
                cover
                v-if="item.photo"
                :src="`${baseUrl}${item.photo}`"
              />
              <v-img v-else :src="iconDocument" />
            </v-avatar>
          </template>
          <template #[`item.date`]="{ item }">
            {{ new Date(item.createdAt).toLocaleDateString("en-GB") }}
          </template>
          <template #[`item.description`]="{ item }">
            {{ item.description || "N/A" }}
          </template>
          <template #item.documentType="{ item }">
            <StatusChip type="documentType" :value="item.documentType" label />
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>
  </v-card>

  <v-row justify="end">
    <v-col cols="auto">
      <v-btn
        prepend-icon="tabler-device-floppy"
        color="primary"
        variant="flat"
        rounded="lg"
        class="text-none"
        @click="update"
        :disabled="!selectedTeacher.length || !selectedMaterials.length"
        v-if="userInfo?.role !== 'user' || permission?.edit"
      >
        Update
      </v-btn>
    </v-col>
  </v-row>
</template>

<style lang="scss" scoped></style>
