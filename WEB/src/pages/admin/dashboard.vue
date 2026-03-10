<template>
  <v-container class="fill-height">
    <!-- Loading Overlay -->
    <v-overlay :value="isLoading" z-index="999">
      <div class="text-center">
        <v-progress-circular
          indeterminate
          size="80"
          width="8"
          color="primary"
        ></v-progress-circular>
        <div class="mt-4 white--text text-h6">Loading Dashboard...</div>
      </div>
    </v-overlay>
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="mx-auto" max-width="400">
          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title class="text-subtitle-2">
                Total Income [{{ new Date().getFullYear() }}]
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-card-text>
            <v-row align="center" justify="center">
              <v-col class="text-h3" cols="auto">
                {{ Number(totalIncome)?.toLocaleString() }}</v-col
              >
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="mx-auto" max-width="400">
          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title class="text-subtitle-2">
                Total Target [{{ new Date().getFullYear() }}]
              </v-list-item-title>
            </v-list-item-content>
            <v-list-item-action
              v-if="userInfo?.role !== 'user' || permission?.edit"
            >
              <v-icon @click="editTarget = true">mdi-pencil-box-outline</v-icon>
            </v-list-item-action>
          </v-list-item>

          <v-card-text>
            <v-row align="center" justify="center">
              <v-col class="text-h3" cols="auto" v-if="!editTarget">
                {{ target.toLocaleString() }}
              </v-col>
              <v-col cols="auto" v-else>
                <v-text-field
                  v-model.number="target"
                  type="number"
                  dense
                  outlined
                  single-line
                  hide-details="auto"
                ></v-text-field>
                <v-btn @click="saveSetting">Save</v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="mx-auto" max-width="400">
          <v-card-text class="py-0">
            <v-list dense>
              <v-list-item v-for="total in totalList" :key="total.name">
                <v-list-item-content>
                  <v-row>
                    <v-col cols="5">
                      <h6 class="subtitle-2">
                        {{ total.name }}
                      </h6>
                    </v-col>
                    <v-col cols="auto">
                      <v-divider
                        vertical
                        :class="[total.color]"
                        style="border: 3px solid"
                      ></v-divider
                    ></v-col>
                    <v-col cols="5">
                      <h6 class="subtitle-1">
                        {{ total.value }}
                      </h6>
                    </v-col>
                  </v-row>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="6" md="3" v-for="(item, i) in summaryList" :key="i">
        <v-alert
          :color="item.color"
          border="left"
          elevation="2"
          colored-border
          class="mb-0"
        >
          <h6 class="text-h6">{{ Number(item.value)?.toLocaleString() }}</h6>
          <div>{{ item.name }}</div>
        </v-alert>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-sheet
          rounded="lg"
          color="info"
          class="mx-auto d-flex justify-center align-center"
          height="50"
          width="100%"
        >
          <h4 class="text-h4 white--text font-weight-bold">Class Calendar</h4>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row style="height: 750px">
      <v-col cols="12">
        <CalendarComponent
          class="mt-6"
          :eventsItems="events"
          isAdmin
          @fetchEvents="onFetchEvents"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from "pinia";
import { useAppStore } from "@/stores/app";

import CalendarComponent from "@/components/Calendar.vue";
export default {
  name: "DashboardPage",
  components: {
    CalendarComponent,
  },
  data() {
    return {
      permission: {},
      target: 0,
      editTarget: false,
      events: [],
      totalList: [
        { name: "Total Student", value: 0, color: "warning" },
        { name: "Total Teacher", value: 0, color: "info" },
        { name: "Total admin", value: 0, color: "success" },
      ],
      summaryList: [],
      totalIncome: 0,
      isLoading: true,
      // Frontend caching
      dashboardCache: null,
      cacheTimestamp: null,
      cacheDuration: 10 * 60 * 1000, // 10 minutes
    };
  },
  computed: {
    ...mapState(useAppStore, {
      userInfo: "getUserinfo",
    }),
  },
  async mounted() {
    // Load dashboard data first (without calendar for faster initial load)
    this.isLoading = true;
    try {
      await Promise.all([
        this.fetchSetting(),
        this.fetchDashboardData(), // Combined API call instead of 3 separate calls
      ]);

      // Load calendar after dashboard data is ready
      setTimeout(() => {
        this.onFetchEvents();
      }, 100);
    } finally {
      this.isLoading = false;
    }

    this.permission = this.userInfo.permissions.find(
      (it) => it.link === this.$route.path
    );
  },
  methods: {
    async fetchSetting() {
      try {
        const { data } = await this.axios.get(`/setting`);

        if (data.length) {
          this.target = data[0].target || 0;
        } else {
          this.target = 0;
        }
      } catch (error) {
        this.$swal.fire({
          title: error.response.data.error,
          text: error.response.data.details,
          icon: "error",
        });
      }
    },
    async saveSetting() {
      try {
        const formData = new FormData();
        formData.append("target", this.target);

        await this.axios.post(`/setting`, formData);
        this.fetchSetting();
        this.editTarget = false;
      } catch (error) {
        this.$swal.fire({
          title: error.response.data.error,
          text: error.response.data.details,
          icon: "error",
        });
      }
    },
    async onFetchSummaryUser() {
      try {
        const { data } = await this.axios.get(`/dashboard/getSummaryUser`);

        this.totalList.forEach((it) => {
          if (it.name === "Total Student") {
            it.value = data.totalStudent || 0;
          } else if (it.name === "Total Teacher") {
            it.value = data.totalTeacher || 0;
          } else if (it.name === "Total admin") {
            it.value = data.totalAdmin || 0;
          }
        });
      } catch (error) {
        this.$swal.fire({
          title: error.response.data.error,
          text: error.response.data.details,
          icon: "error",
        });
      }
    },
    async onFetchEvents(branchId) {
      this.events = [];
      try {
        const { data } = await this.axios.get(
          `/classEvents${branchId ? `?branchId=${branchId}` : ""}`
        );
        this.events = data || [];
      } catch (error) {
        this.$swal.fire({
          title: error.response.data.error,
          text: error.response.data.details,
          icon: "error",
        });
      }
    },
    async onFetchSummaryIncome() {
      try {
        const { data } = await this.axios.get(`/dashboard/getSummaryIncome`);

        if (data.length) this.totalIncome = data[0].totalIncome || 0;
      } catch (error) {
        this.$swal.fire({
          title: error.response.data.error,
          text: error.response.data.details,
          icon: "error",
        });
      }
    },
    async fetchDashboardData() {
      try {
        // Check frontend cache first
        if (
          this.dashboardCache &&
          this.cacheTimestamp &&
          Date.now() - this.cacheTimestamp < this.cacheDuration
        ) {
          console.log("Using frontend cache");
          this.processDashboardData(this.dashboardCache);
          return;
        }

        const { data } = await this.axios.get(`/dashboard/getData`);

        // Cache the response
        this.dashboardCache = data;
        this.cacheTimestamp = Date.now();

        this.processDashboardData(data);
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        
        // Clear cache on error to prevent showing stale data
        this.dashboardCache = null;
        this.cacheTimestamp = null;
        
        // Clear summaryList to prevent showing old data
        this.summaryList = [];
        
        this.$swal.fire({
          title: error.response?.data?.error || "Error",
          text: error.response?.data?.details || error.message,
          icon: "error",
        });
      }
    },

    processDashboardData(data) {
      // Clear summaryList at the beginning to prevent duplication
      this.summaryList = [];

      // Process summaryUser
      if (data.summaryUser) {
        this.totalList.forEach((it) => {
          if (it.name === "Total Student") {
            it.value = data.summaryUser.totalStudent || 0;
          } else if (it.name === "Total Teacher") {
            it.value = data.summaryUser.totalTeacher || 0;
          } else if (it.name === "Total admin") {
            it.value = data.summaryUser.totalAdmin || 0;
          }
        });
      }

      // Process summaryBranch
      if (data.summaryBranch) {
        data.summaryBranch.forEach((it) => {
          this.summaryList.push(
            {
              name: `Total classes ${it.name}`,
              value: it.totalClass || 0,
              color: "primary",
            },
            {
              name: `Total Student ${it.name}`,
              value: it.totalStudent || 0,
              color: "success",
            },
            {
              name: `Expiring Classes ${it.name}`,
              value: it.totalExpireClass || 0,
              color: "warning",
            },
            {
              name: `Monthly income ${it.name}`,
              value: it.totalIncomeClass || 0,
              color: "error",
            }
          );
        });
      }

      // Process summaryIncome
      if (data.summaryIncome && data.summaryIncome.length) {
        this.totalIncome = data.summaryIncome[0].totalIncome || 0;
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
