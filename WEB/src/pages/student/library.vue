<template>
  <v-container>
    <!-- Header Section -->
    <v-row>
      <v-col cols="12">
        <v-sheet
          rounded="lg"
          color="info"
          class="mx-auto d-flex justify-center align-center"
          height="50"
          width="100%"
        >
          <h4 class="text-h4 white--text font-weight-bold">My Library</h4>
        </v-sheet>
      </v-col>
    </v-row>

    <!-- Materials Count -->
    <v-row class="mt-2">
      <v-col cols="12" class="text-center">
        <span class="text-h6 grey--text text--darken-1">
          {{ itemsLibrary.length }} Materials Available
        </span>
      </v-col>
    </v-row>

    <!-- Materials Grid -->
    <v-row class="mt-6">
      <v-col
        v-for="(item, i) in itemsLibrary"
        :key="i"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card
          class="mx-auto material-card elevation-4"
          max-width="350"
          rounded="xl"
          hover
          @click="openDoc(item)"
          style="cursor: pointer; transition: all 0.3s ease"
        >
          <!-- Material Thumbnail -->
          <div class="position-relative">
            <v-img
              height="160"
              :src="getThumbnailUrl(item)"
              class="material-image"
              @error="handleImageError($event, item)"
            >
              <!-- Video Play Button Overlay -->
              <div
                v-if="isVideoFile(item?.material?.documentType)"
                class="video-overlay d-flex align-center justify-center"
              >
                <v-icon size="48" color="white" class="play-button">
                  mdi-play-circle
                </v-icon>
              </div>
            </v-img>

            <!-- File Type Badge -->
            <v-chip
              :color="getFileTypeColor(item?.material?.documentType)"
              small
              class="file-type-badge"
            >
              <v-icon left x-small>{{
                getFileTypeIcon(item?.material?.documentType)
              }}</v-icon>
              {{ item?.material?.documentType?.toUpperCase() }}
            </v-chip>
          </div>

          <!-- Material Info -->
          <v-card-title class="pa-4">
            <div class="w-100">
              <h4 class="text-h6 font-weight-bold mb-2 text-truncate">
                {{ item?.material?.title }}
              </h4>
              <div class="d-flex align-center mb-2">
                <v-icon small color="grey" class="mr-1">mdi-folder</v-icon>
                <span class="text-caption grey--text">
                  {{
                    item?.material?.materialCategory?.name || "Uncategorized"
                  }}
                </span>
              </div>
              <div class="d-flex align-center">
                <v-chip
                  :color="
                    item?.material?.materialFor?.name === 'student'
                      ? 'blue'
                      : 'orange'
                  "
                  x-small
                  class="font-weight-bold"
                >
                  {{ item?.material?.materialFor?.name }}
                </v-chip>
              </div>
            </div>
          </v-card-title>

          <!-- Action Button -->
          <v-card-actions class="pa-4 pt-0">
            <v-btn
              color="primary"
              block
              rounded
              class="text-none font-weight-bold"
              @click.stop="openDoc(item)"
            >
              <v-icon left>mdi-open-in-new</v-icon>
              Open Material
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-if="itemsLibrary.length === 0" justify="center" class="mt-12">
      <v-col cols="12" md="6" class="text-center">
        <v-icon size="120" color="grey lighten-2"
          >mdi-book-open-blank-variant</v-icon
        >
        <h3 class="text-h5 grey--text text--lighten-1 mt-4">
          No Materials Available
        </h3>
        <p class="text-body-1 grey--text mt-2">
          You don't have any library materials assigned yet.
        </p>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="90%">
      <v-card min-height="700px">
        <v-row no-gutters>
          <v-col cols="12" v-if="fileType === 'pdf'">
            <WebViewer
              :initialDoc="fileUrl"
              :hideHeader="true"
              :waterMark="userInfo.name"
            />
          </v-col>
          <v-col cols="12" v-else>
            <div class="d-flex justify-end align-center">
              <v-btn @click="isFullScreen = !isFullScreen" icon>
                <v-icon>mdi-fullscreen</v-icon>
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
  </v-container>
</template>

<script>
import { mapState } from "pinia";
import { useAppStore } from "@/stores/app";
import iconDocument from "@/assets/document.png";

import WebViewer from "@/components/WebViewer.vue";
export default {
  name: "StudentLibrary",
  components: {
    WebViewer,
  },
  data() {
    return {
      fileUrl: "",
      iconDocument,
      isFullScreen: false,
      dialog: false,
      itemsLibrary: [],
      fileType: null,
    };
  },
  computed: {
    ...mapState(useAppStore, {
      userInfo: "getUserinfo",
    }),
  },
  mounted() {
    this.fetchDataMaterials();

    // this.$nextTick(() => {
    //   this.initWebViewer();
    // });
  },
  methods: {
    getThumbnailUrl(item) {
      // Use uploaded photo if available (highest priority)
      if (item?.material?.photo) {
        return `${this.baseUrl}${item?.material?.photo}`;
      }

      // For Canva files, try multiple approaches
      if (
        item?.material?.documentType?.toLowerCase() === "canva" &&
        item?.material?.link
      ) {
        // Extract Canva design ID from the link
        const canvaUrl = item.material.link;
        const designId = canvaUrl.match(/\/design\/([^/]+)/);
        if (designId && designId[1]) {
          // Try different Canva thumbnail URLs
          const id = designId[1];
          const thumbnailUrls = [
            `https://www.canva.com/design/${id}/thumbnail`,
            `https://www.canva.com/design/${id}/preview/thumbnail`,
            `https://thumbnail.canva.com/${id}`,
            `https://canva.com/design/${id}/thumbnail.jpg`,
          ];

          // Return the first option (will try others if this fails via onerror)
          return thumbnailUrls[0];
        }
      }

      // Return placeholder based on file type
      const docType = item?.material?.documentType?.toLowerCase();
      if (this.isVideoFile(docType)) {
        // Return video placeholder
        return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDM1MCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzNTAiIGhlaWdodD0iMTYwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAiIHkxPSIwIiB4Mj0iMzUwIiB5Mj0iMTYwIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzY2N2VlYSIvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM3NjRiYTIiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8Y2lyY2xlIGN4PSIxNzUiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjMiLz4KPHBhdGggZD0iTTE2MCA2MEgxOTBWMTAwSDE2MFY2MFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNjAgNzVMMTgwIDg1TDE2MCA5NVY3NVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==";
      }

      // For Canva, return a special placeholder
      if (docType === "canva") {
        return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDM1MCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzNTAiIGhlaWdodD0iMTYwIiBmaWxsPSJ1cmwoI2NhbnZhR3JhZGllbnQpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImNhbnZhR3JhZGllbnQiIHgxPSIwIiB5MT0iMCIgeDI9IjM1MCIgeTI9IjE2MCI+CjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMwMDdDQ0MiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDA0MkE5Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPGNpcmNsZSBjeD0iMTc1IiBjeT0iODAiIHI9IjMwIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4zIi8+CjxwYXRoIGQ9Ik0xNTUgNjVIMTkwVjk1SDE1NVY2NVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNTUgNzVMMTcwIDg1TDE1NSA5NVY3NVoiIGZpbGw9IndoaXRlIi8+Cjx0ZXh0IHg9IjE3NSIgeT0iMTIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPkNhbnZhPC90ZXh0Pgo8L3N2Zz4=";
      }

      return iconDocument;
    },
    handleImageError(event, item) {
      // If Canva thumbnail fails, try the next URL or fallback
      if (item?.material?.documentType?.toLowerCase() === "canva") {
        const canvaUrl = item.material.link;
        const designId = canvaUrl.match(/\/design\/([^/]+)/);
        if (designId && designId[1]) {
          const id = designId[1];
          const thumbnailUrls = [
            `https://www.canva.com/design/${id}/preview/thumbnail`,
            `https://thumbnail.canva.com/${id}`,
            `https://canva.com/design/${id}/thumbnail.jpg`,
          ];

          // Try the next URL in the list
          const currentSrc = event.target.src;
          const nextUrl = thumbnailUrls.find(
            (url) => !currentSrc.includes(url)
          );
          if (nextUrl) {
            event.target.src = nextUrl;
            return;
          }
        }
      }

      // Final fallback - use document icon
      event.target.src = iconDocument;
    },
    isVideoFile(documentType) {
      const videoTypes = [
        "mp4",
        "avi",
        "mov",
        "wmv",
        "flv",
        "webm",
        "mkv",
        "3gp",
      ];
      return videoTypes.includes(documentType?.toLowerCase());
    },
    getFileTypeColor(documentType) {
      const colors = {
        pdf: "red",
        doc: "blue",
        docx: "blue",
        xls: "green",
        xlsx: "green",
        ppt: "orange",
        pptx: "orange",
        jpg: "purple",
        jpeg: "purple",
        png: "purple",
        gif: "purple",
        mp4: "indigo",
        avi: "indigo",
        mov: "indigo",
        youtube: "red",
        canva: "pink",
        link: "teal",
      };
      return colors[documentType?.toLowerCase()] || "grey";
    },
    getFileTypeIcon(documentType) {
      const icons = {
        pdf: "mdi-file-pdf",
        doc: "mdi-file-word",
        docx: "mdi-file-word",
        xls: "mdi-file-excel",
        xlsx: "mdi-file-excel",
        ppt: "mdi-file-powerpoint",
        pptx: "mdi-file-powerpoint",
        jpg: "mdi-file-image",
        jpeg: "mdi-file-image",
        png: "mdi-file-image",
        gif: "mdi-file-image",
        mp4: "mdi-file-video",
        avi: "mdi-file-video",
        mov: "mdi-file-video",
        youtube: "mdi-youtube",
        canva: "mdi-palette",
        link: "mdi-link-variant",
      };
      return icons[documentType?.toLowerCase()] || "mdi-file";
    },
    async fetchDataMaterials() {
      try {
        const { data } = await this.axios.get(
          `/myMaterial/account/${this.userInfo.accountID}?type=library`
        );
        this.itemsLibrary = data;
      } catch (error) {
        this.$swal.fire({
          title: error.response.data.error,
          text: error.response.data.details,
          icon: "error",
        });
      }
    },
    openDoc(item) {
      this.fileUrl = "";
      this.fileType = "";
      this.dialog = true;
      // if (process.env.NODE_ENV === "development") {
      //   this.fileUrl = `https://view.officeapps.live.com/op/embed.aspx?src=https://getsamplefiles.com/download/pptx/sample-2.pptx`;
      // } else {
      if (["pptx"].includes(item?.material?.documentType))
        this.fileUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${this.baseUrl}${item?.material?.document}`;
      else if (item?.material?.documentType === "pdf") {
        this.fileUrl = `${this.baseUrl}${item?.material?.document}`;
        this.fileType = "pdf";
      } else if (["link"].includes(item?.material?.documentType)) {
        const canvaLink = item?.material?.link;
        window.open(canvaLink, "_blank"); // Open in a new tab
      } else if (["canva"].includes(item?.material?.documentType)) {
        this.fileUrl = item?.material?.link + "?embed";
      } else if (["youtube"].includes(item?.material?.documentType)) {
        this.fileUrl = item?.material?.link;
      } else if (item?.material?.documentType === "mp4") {
        this.fileUrl = `${this.baseUrl}${item?.material?.document}`;
      }

      console.log("object :>> ", this.fileUrl);
      // }
    },
  },
};
</script>

<style lang="scss" scoped>
.material-card {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
}

.material-image {
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  transition: background 0.3s ease;
}

.play-button {
  transition: transform 0.3s ease;
}

.material-card:hover .play-button {
  transform: scale(1.1);
}

.material-card:hover .video-overlay {
  background: rgba(0, 0, 0, 0.4);
}

.file-type-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-weight: bold;
  text-transform: uppercase;
  backdrop-filter: blur(4px);
}

.v-card {
  border-radius: 24px;
}

.v-btn.rounded {
  border-radius: 12px;
}

.w-100 {
  width: 100%;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .material-card {
    max-width: 280px;
  }
}

@media (max-width: 600px) {
  .material-card {
    max-width: 100%;
  }

  .v-card-title .text-h6 {
    font-size: 1rem !important;
  }
}

/* Animation for cards */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.material-card {
  animation: fadeInUp 0.6s ease forwards;
}

/* Stagger animation for multiple cards */
.material-card:nth-child(1) {
  animation-delay: 0.1s;
}
.material-card:nth-child(2) {
  animation-delay: 0.2s;
}
.material-card:nth-child(3) {
  animation-delay: 0.3s;
}
.material-card:nth-child(4) {
  animation-delay: 0.4s;
}
.material-card:nth-child(5) {
  animation-delay: 0.5s;
}
.material-card:nth-child(6) {
  animation-delay: 0.6s;
}
.material-card:nth-child(7) {
  animation-delay: 0.7s;
}
.material-card:nth-child(8) {
  animation-delay: 0.8s;
}
</style>
