<template>
  <v-row>
    <v-col cols="12">
      <h1 class="text-h5 font-weight-bold">System Logs</h1>
      <p class="text-body-small text-medium-emphasis mb-0">
        View and monitor system activity logs.
      </p>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12">
      <v-card rounded="lg" elevation="1">
        <v-card-title class="d-flex justify-space-between align-center">
          <div>
            <v-icon class="mr-2">tabler-file-text</v-icon>
            System Logs
          </div>
          <v-btn color="primary" icon @click="refreshLogs" :loading="loading">
            <v-icon>tabler-refresh</v-icon>
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
            <v-icon color="error" size="48">tabler-alert-circle</v-icon>
            <div class="mt-2 text-error">{{ error }}</div>
            <v-btn color="primary" class="mt-2" @click="refreshLogs"
              >Retry</v-btn
            >
          </div>

          <div v-else class="log-container">
            <div class="log-content" v-html="logContent"></div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useLogs } from "@/composables/useLogs";

const { loading, error, logContent, refreshLogs } = useLogs();
</script>

<style scoped>
.log-container {
  max-height: 70vh;
  overflow-y: auto;
  background-color: #1e1e1e;
  border-radius: 4px;
}

.log-content {
  color: #ffffff;
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
