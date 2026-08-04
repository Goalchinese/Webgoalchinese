<template>
  <div id="webviewer" ref="viewer"></div>
</template>

<script>
import WebViewer from "@pdftron/webviewer";

export default {
  name: "WebViewer",
  props: {
    initialDoc: { type: String },
    waterMark: { type: String, default: "" },
    hideHeader: { type: Boolean, default: false },
  },

  mounted() {
    const path = `${import.meta.env.BASE_URL}webviewer`;

    WebViewer(
      {
        path,
        initialDoc: this.initialDoc,
        licenseKey: import.meta.env.VITE_APP_PDF_LICENSE, // sign up to get a free trial key at https://dev.apryse.com
      },
      this.$refs.viewer
    ).then((instance) => {
      // hide the ribbons
      if (this.hideHeader) {
        instance.UI.disableElements(["default-top-header"]);
      }
      instance.UI.disableElements(["toolsHeader"]);
      instance.UI.disableElements(["default-ribbon-group"]);
      instance.UI.disableElements(["tools-header"]);
      instance.UI.disableElements(["leftPanelButton"]);
      instance.UI.disableElements(["searchPanelToggle"]);
      instance.UI.disableElements(["notesPanelToggle"]);
      instance.UI.disableElements(["groupedLeftHeaderButtons"]);
      // const { documentViewer, annotationManager, Annotations } =
      //   instance.Core;

      const { documentViewer } = instance.Core;

      if (this.waterMark)
        documentViewer.setWatermark({
          // Draw diagonal watermark in middle of the document
          diagonal: {
            fontSize: 25, // or even smaller size
            fontFamily: "sans-serif",
            color: "grey",
            opacity: 50, // from 0 to 100
            text: this.waterMark,
          },
        });
    });
  },
};
</script>

<style>
#webviewer {
  height: 100vh;
}
</style>
