<template>
  <v-row class="mb-2">
    <v-col cols="12">
      <h4 class="text-h4 font-weight-bold">Materials</h4>
      <p class="text-body-small text-medium-emphasis mb-0">
        Browse and view your assigned learning materials.
      </p>
    </v-col>
  </v-row>

  <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
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
        <v-avatar size="64" rounded="lg" color="grey-lighten-4" class="my-2">
          <v-img
            height="64"
            width="64"
            cover
            v-if="item?.material?.photo"
            :src="`${baseUrl}${item.material?.photo}`"
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
          rounded="pill"
        >
          {{ item.material.materialCategory.name }}
        </v-chip>
        <span v-else>-</span>
      </template>

      <template #item.material.materialFor.name="{ item }">
        <v-chip
          v-if="item.material?.materialFor?.name"
          size="small"
          color="info"
          variant="tonal"
          label
          rounded="pill"
        >
          {{ item.material.materialFor.name }}
        </v-chip>
        <span v-else>-</span>
      </template>

      <template #item.action="{ item }">
        <v-btn
          color="primary"
          variant="tonal"
          class="text-none"
          @click="openDoc(item)"
        >
          view
        </v-btn>
      </template>
    </v-data-table>
  </v-card>

  <v-dialog v-model="dialog" max-width="90%">
    <v-card min-height="720px" v-if="dialog">
      <WebViewer
        v-show="fileType === 'pptx'"
        :initial-doc="fileUrl"
        :water-mark="userInfo.name"
      />
      <WebViewerPdf
        v-show="fileType === 'pdf'"
        :initial-doc="fileUrl"
        :water-mark="userInfo.name"
        :item="selectedMaterial"
      />
      <iframe
        v-show="['canva', 'youtube'].includes(fileType)"
        id="myIframe"
        ref="myIframe"
        :src="fileUrl"
        frameborder="0"
        width="100%"
        height="720px"
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
      <video v-show="fileType === 'mp4'" width="1280" height="960" controls>
        <source :src="fileUrl" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useStudentMaterialsPage } from "@/composables/useStudentMaterialsPage";

const WebViewer = defineAsyncComponent(
  () => import("@/components/WebViewer.vue"),
);
const WebViewerPdf = defineAsyncComponent(
  () => import("@/components/WebViewerPdf.vue"),
);

const {
  iconDocument,
  dialog,
  search,
  myIframe,
  headers,
  items,
  fileUrl,
  fileType,
  selectedMaterial,
  userInfo,
  baseUrl,
  openDoc,
} = useStudentMaterialsPage();
</script>

<style>
#WACStatusBarContainer {
  display: none !important;
}

.full-screen-iframe {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  border: none;
}
</style>
