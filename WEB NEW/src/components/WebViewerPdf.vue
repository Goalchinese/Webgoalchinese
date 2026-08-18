<template>
  <div>
    <!-- Toolbar -->
    <v-row justify="space-between" no-gutters>
      <v-col>
        <v-btn variant="text" density="compact" icon="tabler-chevron-left" @click="prevPage"></v-btn>
        <v-btn variant="text" density="compact" icon="tabler-chevron-right" @click="nextPage"></v-btn>

        <span>Page: {{ currentPage }} / {{ totalPages }}</span>
      </v-col>

      <v-col cols="auto">
        <v-btn variant="plain" icon="tabler-zoom-in" @click="zoomIn">
        </v-btn>
        <v-btn variant="plain" icon="tabler-zoom-out" @click="zoomOut"> 
        </v-btn>
        <v-btn variant="plain" icon="tabler-printer" @click="printPDF">
        </v-btn>
      </v-col>
    </v-row>

    <div
      class="grey lighten-4 mt-4"
      style="position: relative; width: 100%; height: 650px"
    >
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
        <span class="mt-2">Loading PDF...</span>
      </div>

      <div id="viewerContainer" style="width: 100%; height: 100%; overflow: auto">
        <div id="viewer" class="pdfViewer"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { markRaw } from "vue";
import * as PDFJS from 'pdfjs-dist';
import * as PDFJSViewer from 'pdfjs-dist/web/pdf_viewer.mjs';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

import "pdfjs-dist/web/pdf_viewer.css";

import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default {
  name: "WebViewer",
  props: {
    initialDoc: { type: String },
    waterMark: { type: String, default: "" },
    hideHeader: { type: Boolean, default: false },
  },
  data() {
    return {
      pdfDocument: null,
      viewer: null,
      currentPage: 1,
      totalPages: 0,
      scale: 1.0,
      isLoading: false,
    };
  },

  mounted() {
    if (this.initialDoc) {
      this.initializeViewer(this.initialDoc);
    }
  },
  watch: {
    initialDoc(newDoc) {
      if (newDoc) {
        this.initializeViewer(newDoc);
      }
    },
  },
  methods: {
    async initializeViewer(pdfUrl) {
      if (!pdfUrl) {
        console.error("PDF URL is missing");
        return;
      }

      const pdfPath = pdfUrl;
      this.isLoading = true;

      // Get the container and initialize the viewer
      const container = document.getElementById("viewerContainer");
      if (!container) {
        console.error("Viewer container not found");
        this.isLoading = false;
        return;
      }

      const eventBus = new PDFJSViewer.EventBus();

      this.viewer = markRaw(
        new PDFJSViewer.PDFViewer({
          container,
          eventBus,
        })
      );

      try {
        // Load the PDF
        console.log("🚀 Starting to load PDF from:", pdfPath);
        this.pdfDocument = markRaw(await PDFJS.getDocument(pdfPath).promise);
        console.log(
          "🚀 ~ initializeViewer ~ this.pdfDocument:",
          this.pdfDocument
        );

        // Set the document in the viewer
        this.viewer.setDocument(this.pdfDocument);

        // Optional: Enable text layer for selectable text
        // Set total pages and enable selectable text
        this.totalPages = this.pdfDocument.numPages;
        this.viewer.textLayerMode = 2;

        // Update the current page when the viewer changes pages
        eventBus.on("pagechanging", () => {
          this.currentPage = this.viewer.currentPageNumber;
        });

        console.log("eventBus :>> ", eventBus);
        // eventBus.on("pagesinit", (PDFViewer) => {
        //   console.log(" PDFViewer._pages :>> ", PDFViewer);
        //   PDFViewer.source._pages.forEach((page) => {
        //     console.log("🚀 ~ PDFViewer._pages.forEach ~ page:", page);

        //     this.addWatermarkToCanvas(page.canvas);
        //   });
        // });
        eventBus.on("pagerendered", (PDFViewer) => {
          this.addWatermarkToCanvas(PDFViewer.source.canvas);
          this.isLoading = false;
        });

        console.log(`PDF loaded with ${this.pdfDocument.numPages} pages.`);
      } catch (error) {
        console.error("❌ Error loading PDF:", error);
        console.error("❌ PDF URL was:", pdfPath);
        this.isLoading = false;
        throw error;
      }
    },
    addWatermarkToCanvas(canvas) {
      console.log("canvas :>> ", canvas);
      const context = canvas.getContext("2d");

      // Add watermark text
      context.save();
      context.font = "48px Arial";
      context.fillStyle = "rgba(178, 178, 178, 0.3)";
      context.textAlign = "center";
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(-Math.PI / 6); // Rotate watermark
      context.fillText(this.waterMark, 0, 0);
      context.restore();
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.viewer.currentPageNumber -= 1;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.viewer.currentPageNumber += 1;
      }
    },
    zoomIn() {
      this.scale += 0.2;
      this.viewer.currentScale = this.scale;
    },
    zoomOut() {
      if (this.scale > 0.4) {
        this.scale -= 0.2;
        this.viewer.currentScale = this.scale;
      }
    },
    async printPDF() {
      if (!this.pdfDocument) {
        alert("PDF not loaded!");
        return;
      }

      // Fetch the original PDF data
      const pdfBytes = await this.pdfDocument.getData();

      // Modify the PDF to include the watermark
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      pages.forEach((page) => {
        const { width, height } = page.getSize();

        let originX = width / 2;
        let originY = height / 3;

        const textWidth = helveticaFont.widthOfTextAtSize(this.waterMark, 32);
        // const textHeight = helveticaFont.heightAtSize(32);

        page.drawText(this.waterMark || "Confidential", {
          x: originX - textWidth / 3,
          y: originY,
          size: 32,
          color: rgb(0.7, 0.7, 0.7, 0.3),
          rotate: degrees(45),
          opacity: 0.3,
        });
      });

      // Save the modified PDF
      const watermarkedPdfBytes = await pdfDoc.save();

      // Create a Blob and open it for printing
      const blob = new Blob([watermarkedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url);

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          URL.revokeObjectURL(url);
        };
      }
    },
  },
};
</script>

<style>
@import url(pdfjs-dist/web/pdf_viewer.css);
#webviewer {
  height: 100vh;
}
#viewerContainer {
  overflow: auto;
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
