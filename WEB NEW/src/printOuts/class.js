import pdf from "@/utils/pdfmake";

const checkBoxSvg =
  '<svg fill="#000000" width="10px" height="10px" viewBox="0 -0.5 25 25" xmlns="http://www.w3.org/2000/svg"><path d="m24 24h-24v-24h24.8v24zm-1.6-2.4v-19.2h-20v19.2z"/></svg>';
const checkBoxActive =
  '<svg fill="#000000" width="800px" height="800px" viewBox="0 -1.5 27 27" xmlns="http://www.w3.org/2000/svg"><path d="m24 24h-24v-24h18.4v2.4h-16v19.2h20v-8.8h2.4v11.2zm-19.52-12.42 1.807-1.807 5.422 5.422 13.68-13.68 1.811 1.803-15.491 15.491z"/></svg>';

const dateFormat = (date) => {
  return new Date(date).toLocaleDateString("en-GB") || "-";
};

const genarateTable = (data) => {
  let result = [];

  data.attendance.forEach((it, inx) => {
    result.push([
      { text: inx + 1, alignment: "center" },
      { text: dateFormat(it.studyDate), alignment: "center" },
      {
        text: `${data[it?.status] || 0} ${data?.currency?.name || "-"} x1`,
        alignment: "center",
      },
      { text: data[it?.status], alignment: "center" },
      { text: it.note, alignment: "center" },
    ]);
  });

  for (let index = 0; index < 17 - data.attendance.length; index++) {
    result.push([
      { text: " ", alignment: "center" },
      { text: "", alignment: "center" },
      {
        text: "",
        alignment: "center",
      },
      { text: "", alignment: "center" },
      { text: "", alignment: "center" },
    ]);
  }
  return result;
};

export async function exportPdf(data) {
  const content = [];
  data.forEach((it, i) => {
    let result = [
      {
        text: [
          {
            text: `Classname:  `,
            style: "subheader",
          },
          it.name,
          {
            text: `                    Class No:  `,
            style: "subheader",
          },
          it.no,
          {
            text: `                     Branch:  `,
            style: "subheader",
          },
          it.branch?.name,
        ],
      },
      {
        text: [
          {
            text: `Class Type:  `,
            style: "subheader",
          },
          it?.classType?.name,
          {
            text: `              Study platform:  `,
            style: "subheader",
          },
          it?.studyPlatform,
          {
            text: `                 Teacher Name:  `,
            style: "subheader",
          },
          { text: it.teacher?.name, font: "NotoSansSC" },
        ],
      },
      {
        text: [
          {
            text: `Study date:  `,
            style: "subheader",
          },
          it.classStudy.map((it) => it.day).join(", "),
          {
            text: `              Study time:  `,
            style: "subheader",
          },
          it?.registeredTimes,
          {
            text: `                 Admin:  `,
            style: "subheader",
          },
          it.updatedBy?.name || "-",
        ],
      },
      {
        columns: [
          {
            margin: [0, 0, 10, 0],
            stack: [
              {
                text: [
                  {
                    text: `Class start:  `,
                    style: "subheader",
                  },
                  dateFormat(it?.startDate),
                ],
              },
              {
                text: [
                  {
                    text: `Class end:  `,
                    style: "subheader",
                  },
                  dateFormat(it?.endDate),
                ],
              },
              {
                text: [
                  {
                    text: `Number of time registered:  `,
                    style: "subheader",
                  },
                  it.numberOfStudent,
                ],
              },
              {
                table: {
                  widths: ["auto", "*", "*"], // Wider left and right columns, narrower center
                  body: [
                    [
                      {
                        text: `Study time per time :`,
                        style: "subheader",
                        alignment: "left",
                      },
                      { text: it.studyTimePerTime || "-", alignment: "center" },
                      {
                        text: "mins",
                        alignment: "right",
                        style: "subheader",
                      },
                    ],
                  ],
                },
                layout: "noBorders",
              },
              {
                table: {
                  widths: ["auto", "*", "*"], // Wider left and right columns, narrower center
                  body: [
                    [
                      {
                        text: `Number of student :`,
                        style: "subheader",
                        alignment: "left",
                      },
                      { text: it.numberOfStudent || "-", alignment: "center" },
                      {
                        text: "person",
                        alignment: "right",
                        style: "subheader",
                      },
                    ],
                  ],
                },
                layout: "noBorders",
              },
              {
                text: [
                  {
                    text: `Student name :     `,
                    style: "subheader",
                  },
                  it.classStudent?.map((it) => it.account?.name).join(", "),
                ],
              },
              {
                table: {
                  widths: ["auto", "*", "*"], // Wider left and right columns, narrower center
                  body: [
                    [
                      {
                        text: `Study fee / person : `,
                        style: "subheader",
                        alignment: "left",
                      },
                      { text: it.studentFee || "-", alignment: "center" },
                      { text: "bath", alignment: "right", style: "subheader" },
                    ],
                  ],
                },
                layout: "noBorders",
              },
              {
                table: {
                  widths: ["*", "*", "*"], // Wider left and right columns, narrower center
                  body: [
                    [
                      {
                        text: `Discount :`,
                        style: "subheader",
                        alignment: "left",
                      },
                      { text: it.discount || "-", alignment: "center" },
                      { text: "bath", alignment: "right", style: "subheader" },
                    ],
                  ],
                },
                layout: "noBorders",
              },
              {
                table: {
                  widths: ["auto", "*", "*"], // Wider left and right columns, narrower center
                  body: [
                    [
                      {
                        text: `Total fee per class :`,
                        style: "subheader",
                        alignment: "left",
                      },
                      { text: it.totalFeePerClass || "-", alignment: "center" },
                      { text: "bath", alignment: "right", style: "subheader" },
                    ],
                  ],
                },
                layout: "noBorders",
              },
              {
                text: [
                  {
                    text: `Discount note : `,
                    style: "subheader",
                  },
                  it.discountNote || "-",
                ],
              },
              { text: "Checklist", bold: true, margin: [0, 10, 0, 0] }, // Bold heading

              // Checklist Items

              {
                table: {
                  widths: ["auto", "*"], // Wider left and right columns, narrower center
                  body: [
                    [
                      {
                        svg: it.checkList.split(",").includes("1")
                          ? checkBoxActive
                          : checkBoxSvg,
                        width: 15,
                        height: 15,
                      },
                      {
                        text: "Send materials to student",
                      },
                    ],
                    [
                      {
                        svg: it.checkList.split(",").includes("2")
                          ? checkBoxActive
                          : checkBoxSvg,
                        width: 15,
                        height: 15,
                      },
                      { text: "Send study link to student" },
                    ],
                    [
                      {
                        svg: it.checkList.split(",").includes("3")
                          ? checkBoxActive
                          : checkBoxSvg,
                        width: 15,
                        height: 15,
                      },
                      { text: "Send materials to teacher" },
                    ],
                    [
                      {
                        svg: it.checkList.split(",").includes("4")
                          ? checkBoxActive
                          : checkBoxSvg,
                        width: 15,
                        height: 15,
                      },
                      { text: "Send study link to teacher" },
                    ],
                  ],
                },
                layout: "noBorders",
              },
            ],
          },
          {
            style: "tablerow",
            table: {
              widths: [30, "*", 45, "*", 40],
              body: [
                [
                  { text: "Times", alignment: "center", style: "tableHeader" },
                  { text: "Date", alignment: "center", style: "tableHeader" },
                  {
                    text: "Teacher fee Per time",
                    alignment: "center",
                    style: "tableHeader",
                  },
                  {
                    text: "Total Teacher fee",
                    alignment: "center",
                    style: "tableHeader",
                  },
                  { text: "Notes", alignment: "center", style: "tableHeader" },
                ],
                ...genarateTable(it),
              ],
            },
            layout: {
              fillColor: function (rowIndex) {
                return rowIndex === 0 ? "#CCCCCC" : null;
              },
            },
          },
        ],
      },
      {
        text: [
          {
            text: `Note:  `,
            style: "subheader",
          },
          it.note,
        ],
        pageBreak: i === data.length - 1 ? null : "after",
      },
    ];
    content.push(...result);
  });
  const docDefination = {
    pageMargins: [30, 70, 30, 30],
    header: {
      text: "CLASS CHECK REPORT",
      alignment: "center",
      margin: [0, 20, 0, 0],
      style: "header",
    },
    content: content,

    defaultStyle: {
      font: "NotoSans",
      fontSize: 12,
      lineHeight: 1.5,
    },
    styles: {
      header: {
        fontSize: 14,
        bold: true,
      },
      subheader: {
        fontSize: 12,
        bold: true,
      },
      tableHeader: {
        bold: true,
        fontSize: 8,
      },
      tablerow: {
        fontSize: 8,
      },
    },
  };
  pdf.pdfPrintPreview(docDefination);
}
