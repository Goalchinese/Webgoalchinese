<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-sheet
          rounded="lg"
          color="info"
          class="mx-auto d-flex justify-center align-center"
          height="50"
          width="100%"
        >
          <h4 class="text-h4 white--text font-weight-bold">Materials</h4>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row justify="end">
      <v-col cols="4">
        <v-text-field
          v-model="search"
          placeholder="Search..."
          dense
          hide-details="auto"
          background-color="grey lighten-4"
          solo
          flat
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <v-data-table :headers="headers" :items="items" mobile-breakpoint="0">
          <template #item.photo="{ item }">
            <v-avatar
              size="50"
              :color="item?.material?.photo ? '' : 'grey lighten-4'"
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

          <template #item.action="{ item }">
            <v-btn color="info" class="text-none" @click="openDoc(item)">
              view
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

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
  </v-container>
</template>

<script>
import { mapState } from "pinia";
import { useAppStore } from "@/stores/app";
import iconDocument from "@/assets/document.png";
export default {
  name: "StudentMaterials",
  data() {
    return {
      iconDocument,
      isFullScreen: false,
      dialog: false,
      search: "",
      headers: [
        {
          align: "start",
          value: "material.no",
          sortable: false,
          text: "Materials No.",
        },
        { value: "photo", text: "Photo" },
        { value: "material.title", text: "Title", width: "40%" },
        { value: "material.materialCategory.name", text: "Materials Category" },
        {
          value: "material.materialType.name",
          text: "Materials for teacher/student",
        },
        { value: "action", text: "Action", sortable: false },
      ],
      items: [],
      fileUrl: ``,
      fileType: "",
      // "https://view.officeapps.live.com/op/embed.aspx?src=https://getsamplefiles.com/download/pptx/sample-2.pptx",
    };
  },
  computed: {
    ...mapState(useAppStore, {
      userInfo: "getUserinfo",
    }),
  },
  mounted() {
    this.fetchDataMaterials();
  },
  methods: {
    async fetchDataMaterials() {
      try {
        const { data } = await this.axios.get(
          `/myMaterial/account/${this.userInfo.accountID}`
        );
        this.items = data;
      } catch (error) {
        this.$swal.fire({
          title: error.response.data.error,
          text: error.response.data.details,
          icon: "error",
        });
      }
    },
    toggleFullScreen() {
      // const iframe = this.$refs.myIframe;

      // if (!this.isFullScreen) {
      //   if (iframe.requestFullscreen) {
      //     iframe.requestFullscreen();
      //   } else if (iframe.webkitRequestFullscreen) {
      //     iframe.webkitRequestFullscreen(); // Safari
      //   } else if (iframe.msRequestFullscreen) {
      //     iframe.msRequestFullscreen(); // IE/Edge
      //   }
      // } else {
      //   if (document.exitFullscreen) {
      //     document.exitFullscreen();
      //   } else if (document.webkitExitFullscreen) {
      //     document.webkitExitFullscreen(); // Safari
      //   } else if (document.msExitFullscreen) {
      //     document.msExitFullscreen(); // IE/Edge
      //   }
      // }

      // Update the fullscreen state
      this.isFullScreen = !this.isFullScreen;
    },
    removeElementInIframe() {
      // Access the iframe via the ref
      const iframe = this.$refs.myIframe;

      // Ensure the iframe is accessible (same-origin policy)
      try {
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow.document;

        // Check if the iframe document is loaded
        if (!iframeDoc.body) {
          console.error("Iframe content is still blank or not loaded");
          return;
        }

        // Find the element by ID and remove it
        const element = iframeDoc.getElementById(
          "ChromelessStatusBar.Options-Small14"
        );
        if (element) {
          element.remove();
          console.log("Element removed successfully");
        } else {
          console.log("Element not found in iframe");
        }
      } catch (error) {
        console.error("Error accessing iframe content:", error);
      }
    },
    openDoc(item) {
      this.fileUrl = "";
      this.fileType = item.material.documentType;
      this.dialog = true;
      // if (process.env.NODE_ENV === "development") {
      //   this.fileUrl = `https://view.officeapps.live.com/op/embed.aspx?src=https://getsamplefiles.com/download/pptx/sample-2.pptx`;
      // } else {
      if (["pptx", "pdf"].includes(item.material.documentType))
        this.fileUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${this.baseUrl}${item.material.document}`;
      else if (["link", "youtube"].includes(item.material.documentType)) {
        this.fileUrl = item.material.link;
      } else if (["canva"].includes(item.material.documentType)) {
        this.fileUrl = item.material.link + "?embed";
      } else if (item.material.documentType === "mp4") {
        this.fileUrl = `${this.baseUrl}${item.material.document}`;
      }
      // }
    },
  },
};
</script>

<!-- <style>
#ChromelessStatusBar.Options-Small14 {
  display: none !important;
}
</style> -->
