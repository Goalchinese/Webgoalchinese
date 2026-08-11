<template>
  <div>
    <!-- Toolbar -->
    <v-row dense justify="space-between" no-gutters>
      <v-col>
        <v-btn icon @click="prevPage"><v-icon>tabler-chevron-left</v-icon></v-btn>
        <v-btn icon @click="nextPage"><v-icon>tabler-chevron-right</v-icon></v-btn>

        <span>Page: {{ currentPage }} / {{ totalPages }}</span>
      </v-col>

      <v-col cols="auto">
        <v-btn icon @click="zoomIn">
          <v-icon>tabler-zoom-in</v-icon>
        </v-btn>
        <v-btn icon @click="zoomOut">
          <v-icon>tabler-zoom-out</v-icon>
        </v-btn>
        <v-btn icon @click="printPDF">
          <v-icon>tabler-printer</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <div
      id="viewerContainer"
      class="grey lighten-4 mt-4"
      style="width: 100%; height: 650px; overflow: auto"
    >
      <div id="viewer" class="pdfViewer"></div>
    </div>
  </div>
</template>

<script>
import * as pdfjsLib from "pdfjs-dist";
import * as pdfjsViewer from "pdfjs-dist/web/pdf_viewer.mjs";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import "pdfjs-dist/web/pdf_viewer.css";

import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

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
      console.log("🚀 ~ initializeViewer ~ pdfPath:", pdfPath);

      // Get the container and initialize the viewer
      const container = document.getElementById("viewerContainer");
      if (!container) {
        console.error("Viewer container not found");
        return;
      }

      const eventBus = new pdfjsViewer.EventBus();

      this.viewer = new pdfjsViewer.PDFViewer({
        container,
        eventBus,
      });

      try {
        // Load the PDF
        console.log("🚀 Starting to load PDF from:", pdfPath);
        this.pdfDocument = await pdfjsLib.getDocument(pdfPath).promise;
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
        });

        console.log(`PDF loaded with ${this.pdfDocument.numPages} pages.`);
      } catch (error) {
        console.error("❌ Error loading PDF:", error);
        console.error("❌ PDF URL was:", pdfPath);
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
