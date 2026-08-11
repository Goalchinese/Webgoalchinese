import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "./vfs_fonts.js";

pdfMake.vfs = pdfFonts;
pdfMake.fonts = {
  NotoSans: {
    normal: "NotoSansThai-Regular.ttf",
    bold: "NotoSansThai-Bold.ttf",
  },
  NotoSansSC: {
    normal: "NotoSansSC-Regular.ttf",
    bold: "NotoSansSC-Bold.ttf",
  },
};

const pdfPrintPreview = (content) => {
  const pdfDocGenerator = pdfMake.createPdf(content);
  pdfDocGenerator.getBlob(function (blob) {
    const pdfPreview = document.getElementById("pdfPreview");
    if (pdfPreview) {
      pdfPreview.remove();
    }
    const iframe = document.createElement("iframe");
    iframe.id = "pdfPreview";
    iframe.style.display = "none";
    iframe.src = URL.createObjectURL(blob);
    document.body.appendChild(iframe);
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  });
};

export default {
  pdfPrintPreview,
};
