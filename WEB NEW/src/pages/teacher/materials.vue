<template>
  <v-row class="mb-4">
    <v-col cols="12">
      <h4 class="text-h4 font-weight-bold">Materials</h4>
      <p class="text-body-small text-medium-emphasis mb-0">
        Browse and view your assigned learning materials.
      </p>
    </v-col>
  </v-row>

  <v-card rounded="lg" class="pa-4">
    <v-row justify="end">
      <v-col cols="12" sm="6" md="4">
        <AppTextField
          v-model="search"
          placeholder="Search materials..."
          prepend-inner-icon="tabler-search"
          density="compact"
          rounded="lg"
          hide-details="auto"
          clearable
        />
      </v-col>
    </v-row>
    <v-data-table
      :headers="headers"
      :filter-keys="['title', 'category', 'type']"
      :items="items"
      mobile-breakpoint="0"
      height="calc(100vh - 350px)"
      fixed-header
    >
      <template #item.photo="{ item }">
        <v-avatar
          size="50"
          :color="item?.material?.photo ? '' : 'grey-lighten-4'"
          :class="
            item?.material?.photo ? '' : 'v-avatar-light-bg primary--text'
          "
          :variant="!item?.material?.photo ? 'tonal' : undefined"
          rounded="lg"
        >
          <v-img
            v-if="item?.material?.photo"
            :src="`${baseUrl}${item?.material?.photo}`"
          />
          <v-img v-else :src="iconDocument" />
        </v-avatar>
      </template>

      <template #item.material.materialCategory.name="{ item }">
        <v-chip
          v-if="item.material?.materialCategory?.name"
          size="small"
          color="success"
          variant="tonal"
          label
        >
          {{ item.material.materialCategory.name }}
        </v-chip>
        <span v-else>-</span>
      </template>

      <template #item.material.materialType.name="{ item }">
        <v-chip
          v-if="item.material?.materialType?.name"
          size="small"
          color="info"
          variant="tonal"
          label
        >
          {{ item.material.materialType.name }}
        </v-chip>
        <span v-else>-</span>
      </template>

      <template #item.action="{ item }">
        <v-btn
          color="primary"
          variant="tonal"
          class="text-none"
          :loading="loadingDocItem === item"
          :disabled="!!loadingDocItem && loadingDocItem !== item"
          @click="openDoc(item)"
        >
          view
        </v-btn>
      </template>
    </v-data-table>
  </v-card>

  <v-dialog v-model="dialog" max-width="90%">
    <v-card min-height="700px">
      <v-row>
        <v-col cols="12">
          <video v-if="fileType === 'mp4'" width="1280" height="960" controls>
            <source :src="fileUrl" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div v-else>
            <div class="d-flex justify-end align-center">
              <v-btn @click="toggleFullScreen" icon>
                <v-icon>tabler-maximize</v-icon>
              </v-btn>
            </div>

            <div style="position: relative">
              <iframe
                :class="{ 'full-screen-iframe': isFullScreen }"
                id="myIframe"
                ref="myIframe"
                :src="fileUrl"
                width="100%"
                height="650px"
                frameborder="0"
                allowfullscreen
                allow="
                  accelerometer;
                  autoplay;
                  clipboard-write;
                  encrypted-media;
                  gyroscope;
                  picture-in-picture;
                  web-share;
                "
                referrerpolicy="strict-origin-when-cross-origin"
                rel="noopener noreferrer"
              ></iframe>
              <div
                :style="{
                  position: isFullScreen ? 'fixed' : 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: '30px',
                  'background-color': 'white',
                  'z-index': '10000',
                }"
                class="d-flex justify-center align-center"
              >
                <v-btn v-if="isFullScreen" @click="toggleFullScreen">
                  {{ isFullScreen ? "Exit Full Screen" : "Go Full Screen" }}
                </v-btn>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useTeacherMaterialsPage } from "@/composables/useTeacherMaterialsPage";

const {
  iconDocument,
  isFullScreen,
  dialog,
  search,
  headers,
  items,
  fileUrl,
  fileType,
  loadingDocItem,
  myIframe,
  baseUrl,
  userInfo,
  fetchDataMaterials,
  toggleFullScreen,
  removeElementInIframe,
  openDoc,
} = useTeacherMaterialsPage();
</script>
