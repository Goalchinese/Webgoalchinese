import { ref, computed, onMounted } from "vue";

export function useLogs() {
  const loading = ref(false);
  const error = ref(null);
  const logContent = ref("");
  const logFileName = ref("");

  const baseUrl = computed(() => {
    return import.meta.env.VITE_APP_API_IMAGE?.replace(/\/$/, "") || "";
  });

  const loadLogs = async () => {
    loading.value = true;
    error.value = null;

    try {
      const logs = [];
      const today = new Date();

      // โหลด log ย้อนหลัง 7 วัน
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split("T")[0];
        const logFileName = `app-${dateString}.log`;

        try {
          const response = await fetch(`${baseUrl.value}/logs/${logFileName}`);

          if (response.ok) {
            const logContentText = await response.text();

            if (logContentText.trim()) {
              const formattedDate = date.toLocaleDateString("th-TH", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });

              logs.push({
                date: formattedDate,
                content: logContentText.trim(),
              });
            }
          }
        } catch (error) {
          // ข้ามวันที่ไม่มี log
          console.log(`No log file for ${dateString}`);
        }
      }

      // แสดงเฉพาะวันที่มี log จริงๆ
      if (logs.length === 0) {
        logContent.value = "ไม่มีข้อมูล log ในช่วง 7 วันที่ผ่านมา";
      } else {
        // แสดง log เรียงตามวันที่ (เก่าสุดก่อน)
        logs.reverse();
        logContent.value = logs
          .map(
            (log) =>
              `<span style="color: #00ff00;">=== ${log.date} ===</span>\n<span style="color: #ffffff;">${log.content}</span>`
          )
          .join("\n\n");
      }
    } catch (err) {
      console.error("Error loading logs:", err);
      error.value = `Failed to load logs: ${err.message}`;
    } finally {
      loading.value = false;
    }
  };

  const refreshLogs = () => {
    loadLogs();
  };

  onMounted(() => {
    loadLogs();
  });

  return {
    loading,
    error,
    logContent,
    logFileName,
    baseUrl,
    loadLogs,
    refreshLogs,
  };
}
