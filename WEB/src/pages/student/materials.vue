<template>
  <div>
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

            <template #item.action="{ item }">
              <v-btn color="info" class="text-none" @click="openDoc(item)">
                view
              </v-btn>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="dialog" max-width="90%">
      <v-card min-height="720px" v-if="dialog">
        <WebViewer
          v-show="fileType === 'pptx'"
          :initialDoc="fileUrl"
          :waterMark="userInfo.name"
        />
        <WebViewerPdf
          v-show="fileType === 'pdf'"
          :initialDoc="fileUrl"
          :waterMark="userInfo.name"
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
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          rel="noopener noreferrer"
        ></iframe>
        <video v-show="fileType === 'mp4'" width="1280" height="960" controls>
          <source :src="fileUrl" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useAppStore } from "@/stores/app";
import { defineAsyncComponent } from "vue";
// import WebViewer from "@/components/WebViewer.vue";
// import WebViewerPdf from "@/components/WebViewerPdf.vue";
import iconDocument from "@/assets/document.png";

export default {
  name: "StudentMaterials",
  components: {
    WebViewer: defineAsyncComponent(() => import("@/components/WebViewer.vue")),
    WebViewerPdf: defineAsyncComponent(() =>
      import("@/components/WebViewerPdf.vue")
    ),
  },
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
        {
          value: "material.materialCategory.name",
          text: "Materials Category",
          width: "10%",
        },
        {
          value: "material.materialFor.name",
          text: "Materials for teacher/student",
          width: "10%",
        },
        { value: "action", text: "Action", sortable: false },
      ],
      items: [],
      fileUrl: "",
      fileType: "",
    };
  },
  computed: {
    ...mapState(useAppStore, {
      userInfo: "getUserinfo",
    }),
  },
  created() {
    this.fetchDataMaterials();
  },
  mounted() {},
  methods: {
    toggleFullScreen() {
      // Update the fullscreen state
      this.isFullScreen = !this.isFullScreen;
    },
    async fetchDataMaterials() {
      try {
        console.log("🚀 ~ fetchDataMaterials ~ userInfo.id:", this.userInfo.id);
        const { data } = await this.axios.get(
          `/myMaterial/account/${this.userInfo.id}?type=student`
        );
        console.log("🚀 ~ fetchDataMaterials ~ raw data:", data);
        this.items = data;
        console.log("🚀 ~ fetchDataMaterials ~ items:", this.items);
      } catch (error) {
        console.error("❌ fetchDataMaterials error:", error);
        if (error.response?.status !== 404)
          this.$swal.fire({
            title: error.response?.data?.error || "Error",
            text: error.response?.data?.details || error.message,
            icon: "error",
          });
      }
    },
    openDoc(item) {
      this.dialog = false;
      this.fileType = item.material.documentType;

      // this.fileUrl = "../sample-1.pdf";
      if (["pptx"].includes(item.material.documentType)) {
        this.fileUrl = `${this.baseUrl}${item.material.document}`;
      } else if (["pdf"].includes(item.material.documentType)) {
        this.fileUrl = `${this.baseUrl}${item.material.document}`;
      } else if (["link"].includes(item.material.documentType)) {
        const canvaLink = item.material.link;
        window.open(canvaLink, "_blank");
      } else if (["canva"].includes(item.material.documentType)) {
        this.fileUrl = item.material.link + "?embed";
      } else if (["youtube"].includes(item.material.documentType)) {
        this.fileUrl = item.material.link;
      } else if (item.material.documentType === "mp4") {
        this.fileUrl = `${this.baseUrl}${item.material.document}`;
      }
      console.log("🚀 ~ openDoc ~ this.fileUrl:", this.fileUrl);

      setTimeout(() => {
        this.dialog = true;
      }, 200);
    },
  },
};
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
