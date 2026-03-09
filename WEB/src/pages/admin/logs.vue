<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-sheet
          rounded="lg"
          color="primary"
          class="mx-auto d-flex justify-center align-center"
          height="50"
          width="100%"
        >
          <h4 class="text-h4 white--text font-weight-bold">System Logs</h4>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card outlined>
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="d-flex align-center">
              <v-icon class="mr-2">mdi-file-document-outline</v-icon>
              <v-select
                v-model="selectedDate"
                :items="availableDates"
                item-text="label"
                item-value="value"
                label="เลือกวันที่"
                outlined
                dense
                hide-details
                style="max-width: 200px"
                @change="loadLogs"
              ></v-select>
            </div>
            <v-btn color="primary" icon @click="refreshLogs" :loading="loading">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text class="pa-0">
            <div v-if="loading" class="text-center pa-4">
              <v-progress-circular
                indeterminate
                color="primary"
              ></v-progress-circular>
              <div class="mt-2">Loading logs...</div>
            </div>

            <div v-else-if="error" class="text-center pa-4">
              <v-icon color="error" size="48">mdi-alert-circle</v-icon>
              <div class="mt-2 error--text">{{ error }}</div>
              <v-btn color="primary" class="mt-2" @click="refreshLogs"
                >Retry</v-btn
              >
            </div>

            <div v-else class="log-container">
              <pre class="log-content">{{ logContent }}</pre>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "LogsPage",
  data() {
    return {
      loading: false,
      error: null,
      logContent: "",
      logFileName: "",
      selectedDate: null,
      availableDates: [],
    };
  },
  computed: {
    baseUrl() {
      return process.env.VUE_APP_API_IMAGE?.replace(/\/$/, "") || "";
    },
  },
  mounted() {
    this.generateAvailableDates();
    this.loadLogs();
  },
  methods: {
    generateAvailableDates() {
      const dates = [];
      const today = new Date();

      // เพิ่มวันปัจจุบันและ 7 วันย้อนหลัง
      for (let i = 0; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const label =
          i === 0
            ? "วันนี้"
            : i === 1
            ? "เมื่อวานนี้"
            : `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

        dates.push({
          value: dateStr,
          label: label,
        });
      }

      this.availableDates = dates;
      this.selectedDate = dates[0].value; // เลือกวันนี้เป็นค่าเริ่มต้น
    },

    async loadLogs() {
      this.loading = true;
      this.error = null;

      try {
        const logFileName = `app-${this.selectedDate}.log`;
        this.logFileName = logFileName;

        const response = await fetch(`${this.baseUrl}/logs/${logFileName}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        this.logContent = await response.text();

        if (!this.logContent.trim()) {
          this.logContent = "No logs available for this date.";
        }
      } catch (error) {
        console.error("Error loading logs:", error);
        this.error = `Failed to load logs: ${error.message}`;
      } finally {
        this.loading = false;
      }
    },

    refreshLogs() {
      this.loadLogs();
    },
  },
};
</script>

<style scoped>
.log-container {
  max-height: 70vh;
  overflow-y: auto;
  background-color: #1e1e1e;
  border-radius: 4px;
}

.log-content {
  color: #00ff00;
  font-family: "Courier New", monospace;
  font-size: 12px;
  line-height: 1.4;
  margin: 0;
  padding: 16px;
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #1e1e1e;
  border: none;
  outline: none;
}

.log-content::-webkit-scrollbar {
  width: 8px;
}

.log-content::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.log-content::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.log-content::-webkit-scrollbar-thumb:hover {
  background: #777;
}
</style>
