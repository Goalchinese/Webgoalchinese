<template>
    <v-row class="mb-4">
      <v-col cols="12">
        <h4 class="text-h4 font-weight-bold">Library</h4>
        <p class="text-body-small text-medium-emphasis mb-0">
          Browse and view your assigned learning materials.
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="(item, i) in itemsLibrary" :key="i" cols="3">
        <v-card
          class="mx-auto"
          max-width="344"
          rounded="lg"
          elevation="1"
          :loading="loadingDocItem === item"
          :disabled="!!loadingDocItem && loadingDocItem !== item"
          @click="openDoc(item)"
        >
          <v-img
            height="200px"
            :src="
              item?.material?.photo
                ? `${baseUrl}${item?.material?.photo}`
                : iconDocument
            "
          />

          <v-card-title class="bg-primary text-white">
            {{ item?.material?.title }}</v-card-title
          >
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="90%">
      <v-card min-height="700px">
        <v-row no-gutters>
          <v-col cols="12" v-if="fileType === 'pdf'">
            <WebViewer
              :initial-doc="fileUrl"
              :hide-header="true"
              :water-mark="userInfo.name"
            />
          </v-col>
          <v-col cols="12" v-else>
            <div class="d-flex justify-end align-center">
              <v-btn @click="isFullScreen = !isFullScreen" icon>
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
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
              ></iframe>
              <div
                :style="{
                  position: isFullScreen ? 'fixed' : 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: '25px',
                  'background-color': 'white',
                  'z-index': '10000',
                }"
                class="d-flex justify-center align-center"
              >
                <v-btn
                  v-if="isFullScreen"
                  @click="isFullScreen = !isFullScreen"
                >
                  {{ isFullScreen ? "Exit Full Screen" : "Go Full Screen" }}
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { useStudentLibrary } from "@/composables/useStudentLibrary";



const {
  userInfo,
  fileUrl,
  iconDocument,
  isFullScreen,
  dialog,
  itemsLibrary,
  fileType,
  loadingDocItem,
  baseUrl,
  openDoc,
} = useStudentLibrary();
</script>

<style lang="scss" scoped></style>
