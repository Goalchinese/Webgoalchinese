<template>
  <div>
    <!-- Toolbar -->
    <v-row justify="space-between" no-gutters>
      <v-col>
        <v-btn variant="text" density="compact" icon="tabler-chevron-left" @click="prevPage"></v-btn>
        <v-btn variant="text" density="compact" icon="tabler-chevron-right" @click="nextPage"></v-btn>

        <span>Slide: {{ currentPage }} / {{ totalPages }}</span>
      </v-col>

      <v-col cols="auto">
        <v-btn variant="plain" icon="tabler-zoom-in" @click="zoomIn"></v-btn>
        <v-btn variant="plain" icon="tabler-zoom-out" @click="zoomOut"></v-btn>
        <v-btn variant="plain" icon="tabler-download" @click="downloadFile"></v-btn>
      </v-col>
    </v-row>

    <div id="webviewer" ref="viewer">
      <div
        v-if="isLoading"
        class="d-flex flex-column align-center justify-center"
        style="
          position: absolute;
          inset: 0;
          z-index: 1;
          background: rgba(255, 255, 255, 0.7);
        "
      >
        <v-progress-circular indeterminate color="primary" size="48" />
        <span class="mt-2">Loading document...</span>
      </div>
      <div ref="pptxContainer" class="pptx-container"></div>
    </div>
  </div>
</template>

<script>
import { init } from "pptx-preview";
import html2canvas from "html2canvas";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

export default {
  name: "WebViewer",
  props: {
    initialDoc: { type: String },
    waterMark: { type: String, default: "" },
    hideHeader: { type: Boolean, default: false },
  },
  data() {
    return {
      previewer: null,
      isLoading: false,
      currentPage: 1,
      totalPages: 0,
      scale: 1,
    };
  },
  mounted() {
    if (this.initialDoc) {
      this.loadPptx(this.initialDoc);
    }
  },
  watch: {
    initialDoc(newDoc) {
      if (newDoc) {
        this.loadPptx(newDoc);
      }
    },
  },
  methods: {
    async loadPptx(url) {
      this.isLoading = true;
      this.scale = 1;
      try {
        const container = this.$refs.pptxContainer;
        container.innerHTML = "";

        const { width: boxWidth, height: boxHeight } =
          this.$refs.viewer.getBoundingClientRect();

        // pptx-preview renders into a fixed-size box, so fit a 16:9 slide
        // inside the available space (letterboxing is fine here since the
        // toolbar lets the user zoom in on the slide content).
        const aspect = 16 / 9;
        let width = boxWidth || 960;
        let height = width / aspect;
        if (height > (boxHeight || height)) {
          height = boxHeight;
          width = height * aspect;
        }

        this.previewer = init(container, {
          width,
          height,
          mode: "slide",
        });

        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        this.pptxBuffer = buffer;

        await this.previewer.preview(buffer);

        this.currentPage = this.previewer.currentIndex + 1;
        this.totalPages = this.previewer.slideCount;

        // hide the library's own next/prev/pagination UI, we drive it ourselves
        container
          .querySelectorAll(
            ".pptx-preview-wrapper-next, .pptx-preview-wrapper-pre, .pptx-preview-wrapper-pagination"
          )
          .forEach((el) => (el.style.display = "none"));

        if (this.waterMark) {
          this.applyWatermark(container);
        }
      } catch (error) {
        console.error("❌ Error loading pptx:", error);
      } finally {
        this.isLoading = false;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.previewer.renderPreSlide();
        this.currentPage -= 1;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.previewer.renderNextSlide();
        this.currentPage += 1;
      }
    },
    zoomIn() {
      this.scale += 0.2;
      this.applyZoom();
    },
    zoomOut() {
      if (this.scale > 0.4) {
        this.scale -= 0.2;
        this.applyZoom();
      }
    },
    applyZoom() {
      const wrapper = this.$refs.pptxContainer?.querySelector(
        ".pptx-preview-wrapper"
      );
      if (wrapper) {
        wrapper.style.transform = `scale(${this.scale})`;
        wrapper.style.transformOrigin = "center top";
      }
    },
    async downloadFile() {
      if (!this.pptxBuffer) return;

      this.isLoading = true;
      let hiddenContainer;
      let offscreenPreviewer;
      try {
        // render every slide off-screen (not just the one currently shown)
        hiddenContainer = document.createElement("div");
        hiddenContainer.style.position = "fixed";
        hiddenContainer.style.left = "-99999px";
        hiddenContainer.style.top = "0";
        document.body.appendChild(hiddenContainer);

        const slideWidth = 1280;
        const slideHeight = 720;
        offscreenPreviewer = init(hiddenContainer, {
          width: slideWidth,
          height: slideHeight,
          mode: "slide",
        });
        await offscreenPreviewer.preview(this.pptxBuffer);

        const pdfDoc = await PDFDocument.create();
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const text = this.waterMark || "";
        const fontSize = 100;
        const textWidth = text
          ? helveticaFont.widthOfTextAtSize(text, fontSize)
          : 0;

        for (let i = 0; i < offscreenPreviewer.slideCount; i++) {
          if (i > 0) offscreenPreviewer.renderSingleSlide(i);

          const slideEl = hiddenContainer.querySelector(
            `.pptx-preview-slide-wrapper-${i}`
          );
          if (!slideEl) continue;

          const canvas = await html2canvas(slideEl, {
            width: slideWidth,
            height: slideHeight,
            logging: false,
            // OLE/embedded objects (e.g. object/embed/video tags) get
            // re-processed by the browser on every clone, which can
            // trigger an auto-download of the embedded file per slide.
            ignoreElements: (el) =>
              ["OBJECT", "EMBED", "VIDEO", "AUDIO", "IFRAME"].includes(
                el.tagName
              ) || el.hasAttribute("download"),
          });
          const pngBytes = await (await fetch(canvas.toDataURL("image/png"))).arrayBuffer();
          const image = await pdfDoc.embedPng(pngBytes);

          const page = pdfDoc.addPage([canvas.width, canvas.height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height,
          });

          if (text) {
            page.drawText(text, {
              x: canvas.width / 2 - textWidth / 2,
              y: canvas.height / 2,
              size: fontSize,
              font: helveticaFont,
              color: rgb(0.5, 0.5, 0.5),
              rotate: degrees(45),
              opacity: 0.4,
            });
          }
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        const fileName =
          this.initialDoc?.split("/").pop()?.replace(/\.pptx$/i, "") ||
          "document";
        const link = document.createElement("a");
        link.href = url;
        link.download = `${fileName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("❌ Error converting pptx to pdf:", error);
      } finally {
        offscreenPreviewer?.destroy();
        hiddenContainer?.remove();
        this.isLoading = false;
      }
    },
    applyWatermark(container) {
      const overlay = document.createElement("div");
      overlay.className = "pptx-watermark-overlay";
      overlay.style.position = "absolute";
      overlay.style.inset = "0";
      overlay.style.pointerEvents = "none";
      overlay.style.zIndex = "2";
      overlay.style.backgroundImage = `url("${this.watermarkSvg()}")`;
      overlay.style.backgroundRepeat = "no-repeat";
      overlay.style.backgroundPosition = "center";
      overlay.style.backgroundSize = "contain";
      container.style.position = "relative";
      container.appendChild(overlay);
    },
    watermarkSvg() {
      const text = this.waterMark;
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>
        <text x='50%' y='50%' fill='grey' fill-opacity='0.4' font-size='72' font-family='sans-serif'
          text-anchor='middle' transform='rotate(-30 400 300)'>${text}</text>
      </svg>`;
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    },
  },
};
</script>

<style>
#webviewer {
  position: relative;
  height: 650px;
  max-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  background: #000;
}
.pptx-preview-wrapper {
  transition: transform 0.15s ease;
}
</style>
