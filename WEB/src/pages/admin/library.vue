<template>
  <v-container fluid class="pa-0">
    <!-- Modern Header with Gradient -->
    <v-row>
      <v-col cols="12">
        <v-card
          class="elevation-6"
          style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        >
          <v-card-title class="text-center py-6">
            <v-icon large color="white" class="mr-3"
              >mdi-book-open-variant</v-icon
            >
            <h3 class="text-h3 white--text font-weight-bold mb-0">
              Student Library Materials
            </h3>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <!-- Search and Actions Section -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card class="elevation-2 pa-4">
          <v-row align="center">
            <!-- Title Section -->
            <v-col cols="12" md="3">
              <div class="d-flex align-center">
                <v-icon color="primary" class="mr-2">mdi-account-group</v-icon>
                <h4 class="text-h4 font-weight-bold grey--text text--darken-3">
                  Select Students
                </h4>
                <span class="red--text ml-2">*</span>
              </div>
            </v-col>

            <!-- Search Section -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="search"
                placeholder="Search students by name, admission no..."
                prepend-inner-icon="mdi-magnify"
                outlined
                dense
                hide-details="auto"
                clearable
                class="rounded-lg"
                background-color="white"
              />
            </v-col>

            <!-- Action Button -->
            <v-col cols="12" md="3" class="text-end">
              <v-btn
                color="error"
                :disabled="!selectedStudent.length"
                @click="clearMaterials"
                large
                class="rounded-lg elevation-2"
                :class="{ 'pulse-animation': selectedStudent.length > 0 }"
              >
                <v-icon left>mdi-delete-sweep</v-icon>
                Clear Materials
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <!-- Students Table Section -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card class="elevation-2">
          <v-card-title class="pa-4">
            <v-icon color="primary" class="mr-2">mdi-account-school</v-icon>
            <span class="text-h6 font-weight-bold">Students List</span>
            <v-spacer></v-spacer>
            <v-chip
              :color="selectedStudent.length > 0 ? 'success' : 'grey'"
              class="font-weight-bold"
            >
              {{ selectedStudent.length }} Selected
            </v-chip>
          </v-card-title>
          <v-divider></v-divider>
          <v-data-table
            v-model="selectedStudent"
            :headers="headers"
            :filter-keys="['title', 'category', 'type']"
            :items="items"
            :loading="isLoadingStudents"
            :server-items-length="paginationStudents.total"
            :options.sync="paginationStudents"
            mobile-breakpoint="0"
            show-select
            @update:options="updatePaginationStudents"
            class="elevation-0"
          >
            <template #item.name="{ item }">
              <div class="d-flex align-center">
                <v-avatar
                  size="64"
                  :color="item.photo ? '' : 'grey lighten-4'"
                  :class="item.photo ? '' : 'v-avatar-light-bg primary--text'"
                  :variant="!item.photo ? 'tonal' : undefined"
                  rounded="lg"
                >
                  <v-img v-if="item.photo" :src="`${baseUrl}${item.photo}`" />
                  <v-img v-else :src="iconStudent" />
                </v-avatar>
                <div class="d-flex flex-column ms-3">
                  <span
                    class="d-block font-weight-medium text-high-emphasis text-truncate"
                    >{{ item.name }}</span
                  >
                </div>
              </div>
            </template>

            <template #[`item.age`]="{ item }">
              {{ calulateAge(item.dateOfBirth) }}
            </template>
            <template #[`item.points`]="{ item }">
              <v-chip
                :color="
                  item.pointStructure?.pointAfterUpdate > 0 ? 'success' : 'grey'
                "
                small
                class="font-weight-bold"
              >
                {{ item.pointStructure?.pointAfterUpdate || 0 }} pts
              </v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Materials Section -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card class="elevation-2">
          <v-card-title class="pa-4">
            <v-icon color="primary" class="mr-2">mdi-book-multiple</v-icon>
            <span class="text-h6 font-weight-bold">Library Materials</span>
            <v-spacer></v-spacer>
            <v-chip
              :color="selectedMaterials.length > 0 ? 'success' : 'grey'"
              class="font-weight-bold"
            >
              {{ selectedMaterials.length }} Selected
            </v-chip>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-4">
            <v-text-field
              v-model="searchMaterials"
              placeholder="Search materials by title, category..."
              prepend-inner-icon="mdi-magnify"
              outlined
              dense
              hide-details="auto"
              clearable
              class="rounded-lg mb-4"
              background-color="white"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <!-- Materials Table Section -->
    <v-row class="mt-2">
      <v-col cols="12">
        <v-card class="elevation-2">
          <v-data-table
            v-model="selectedMaterials"
            :headers="headersMaterials"
            :filter-keys="['title', 'category', 'type']"
            :items="itemsMaterials"
            :loading="isLoadingMaterials"
            :server-items-length="paginationMaterials.total"
            :options.sync="paginationMaterials"
            mobile-breakpoint="0"
            show-select
            @update:options="updatePaginationMaterials"
            class="elevation-0"
          >
            <template #item.photo="{ item }">
              <v-avatar size="56" rounded class="my-2 elevation-2">
                <v-img
                  height="56"
                  width="56"
                  cover
                  v-if="item.photo"
                  :src="`${baseUrl}${item.photo}`"
                />
                <v-img v-else :src="iconDocument" />
              </v-avatar>
            </template>

            <template #[`item.title`]="{ item }">
              <div class="d-flex flex-column">
                <span class="font-weight-medium text-subtitle-1">{{
                  item.title
                }}</span>
                <span class="text-caption grey--text">{{
                  item.materialCategory?.name || "Uncategorized"
                }}</span>
              </div>
            </template>

            <template #[`item.materialFor.name`]="{ item }">
              <v-chip
                :color="
                  item.materialFor?.name === 'student' ? 'blue' : 'orange'
                "
                small
                class="font-weight-bold"
              >
                {{ item.materialFor?.name }}
              </v-chip>
            </template>

            <template #[`item.materialType.name`]="{ item }">
              <v-chip outlined small class="font-weight-medium">
                {{ item.materialType?.name }}
              </v-chip>
            </template>

            <template #[`item.documentType`]="{ item }">
              <v-chip
                :color="getDocumentTypeColor(item.documentType)"
                small
                class="font-weight-bold text-uppercase"
              >
                {{ item.documentType }}
              </v-chip>
            </template>

            <template #[`item.date`]="{ item }">
              <div class="d-flex flex-column">
                <span class="text-caption">{{
                  new Date(item.createdAt).toLocaleDateString("en-GB")
                }}</span>
                <span class="text-caption grey--text">{{
                  getTimeAgo(item.createdAt)
                }}</span>
              </div>
            </template>

            <template #[`item.description`]="{ item }">
              <span class="text-body-2 grey--text text--darken-1">
                {{ item.description || "No description available" }}
              </span>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Action Buttons Section -->
    <v-row class="mt-6 mb-4">
      <v-col cols="12" class="text-center">
        <v-card
          class="elevation-2 pa-6"
          style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
        >
          <v-row align="center" justify="center">
            <v-col cols="12" md="8">
              <div class="text-center mb-4">
                <v-icon size="48" color="primary" class="mb-2"
                  >mdi-book-open-page-variant</v-icon
                >
                <h4
                  class="text-h4 font-weight-bold grey--text text--darken-3 mb-2"
                >
                  Assign Library Materials
                </h4>
                <p class="text-body-1 grey--text">
                  {{ selectedStudent.length }} student(s) selected •
                  {{ selectedMaterials.length }} material(s) selected
                </p>
              </div>
              <div class="d-flex justify-center ga-4">
                <v-btn
                  color="primary"
                  x-large
                  class="rounded-lg elevation-4 px-8"
                  @click="update"
                  :disabled="
                    !selectedStudent.length || !selectedMaterials.length
                  "
                  v-if="userInfo?.role !== 'user' || permission?.edit"
                >
                  <v-icon left size="24">mdi-content-save</v-icon>
                  Assign Materials
                </v-btn>

                <v-btn
                  color="grey"
                  x-large
                  class="rounded-lg elevation-2 px-8"
                  @click="clearSelection"
                  outlined
                >
                  <v-icon left size="24">mdi-refresh</v-icon>
                  Clear Selection
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from "pinia";
import { useAppStore } from "@/stores/app";
import iconDocument from "@/assets/document.png";
import iconStudent from "@/assets/student.png";
export default {
  name: "MaterialsStudent",
  data() {
    return {
      iconDocument,
      iconStudent,
      search: "",
      searchMaterials: "",
      headers: [
        {
          align: "start",
          value: "addmissionNo",
          sortable: false,
          text: "Admission No.",
          width: "2%",
        },
        { value: "name", text: "Student Name", width: "*" },
        { value: "phone", text: "Mobile No.", width: "10%" },
        { value: "points", text: "Points", width: "7%" },
        { value: "studentType.name", text: "Student Type", width: "12%" },
        { value: "classType.name", text: "Class Type", width: "10%" },
        { value: "age", text: "Age", width: "5%" },
        { value: "gender", text: "Gender", width: "7%" },
      ],
      items: [],
      headersMaterials: [
        {
          align: "start",
          value: "no",
          sortable: false,
          text: "Materials No.",
          width: "3%",
        },
        { value: "photo", text: "Photo" },
        { value: "title", text: "Title", width: "25%" },
        {
          value: "materialCategory.name",
          text: "Materials Category",
          width: "",
        },
        { value: "materialFor.name", text: "Materials for teacher/student" },
        { value: "materialType.name", text: "Type" },
        { value: "documentType", text: "File type" },
        { value: "date", text: "Date" },
        { value: "description", text: "Description" },
      ],
      itemsMaterials: [],
      selectedStudent: [],
      selectedMaterials: [],
      isLoadingStudents: false,
      isLoadingMaterials: false,
      paginationStudents: {
        page: 1,
        itemsPerPage: 10,
        total: 0,
        totalPages: 0,
      },
      paginationMaterials: {
        page: 1,
        itemsPerPage: 10,
        total: 0,
        totalPages: 0,
      },
    };
  },
  computed: {
    ...mapState(useAppStore, {
      userInfo: "getUserinfo",
    }),
  },
  watch: {
    search() {
      this.fetchDataTeacher();
    },
    searchMaterials() {
      this.fetchDataMaterials();
    },
  },
  mounted() {
    this.fetchDataTeacher();
    this.fetchDataMaterials();

    this.permission = this.userInfo.permissions.find(
      (it) => it.link === this.$route.path
    );
  },
  methods: {
    async fetchDataTeacher() {
      this.isLoadingStudents = true;
      try {
        // Handle -1 (All) case - use large number instead of -1
        const limit =
          this.paginationStudents.itemsPerPage === -1
            ? 1000
            : this.paginationStudents.itemsPerPage;
        const params = {
          role: "student",
          page: this.paginationStudents.page,
          limit: limit,
        };

        if (this.search) {
          params.search = this.search;
        }

        const { data } = await this.axios.get("/account", { params });

        this.items = data.data || [];
        this.paginationStudents.total = data.total || 0;
        this.paginationStudents.totalPages = data.totalPages || 0;
      } catch (error) {
        this.$swal.fire({
          title: error.response.data.error,
          text: error.response.data.details,
          icon: "error",
        });
      } finally {
        this.isLoadingStudents = false;
      }
    },
    async fetchDataMaterials() {
      this.isLoadingMaterials = true;
      try {
        // Handle -1 (All) case - use large number instead of -1
        const limit =
          this.paginationMaterials.itemsPerPage === -1
            ? 1000
            : this.paginationMaterials.itemsPerPage;
        const params = {
          materialFor: "library",
          page: this.paginationMaterials.page,
          limit: limit,
        };

        if (this.searchMaterials) {
          params.search = this.searchMaterials;
        }

        const { data } = await this.axios.get("/materials", { params });

        this.itemsMaterials = data.data || [];
        this.paginationMaterials.total = data.total || 0;
        this.paginationMaterials.totalPages = data.totalPages || 0;
      } catch (error) {
        this.$swal.fire({
          title: error.response.data.error,
          text: error.response.data.details,
          icon: "error",
        });
      } finally {
        this.isLoadingMaterials = false;
      }
    },
    async update() {
      try {
        let body = {
          accountID: this.selectedStudent.map((item) => item.id),
          materials: this.selectedMaterials.map((item) => item.id),
        };
        const { data } = await this.axios.post(`/myMaterial`, body);

        this.$swal(data?.message, "", "success");
      } catch (error) {
        this.$swal.fire({
          title: error.response.data.error,
          text: error.response.data.details,
          icon: "error",
        });
      }
    },
    async clearMaterials() {
      // confirm delete
      const { isDismissed } = await this.$swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this data!",
        icon: "warning",
        buttons: true,
      });

      if (isDismissed) return;

      try {
        const { data } = await this.axios.put(`/myMaterial/clear/account`, {
          accountIDs: this.selectedStudent.map((item) => item.id),
          type: "library",
        });

        this.$swal(data?.message, "", "success");
      } catch (error) {
        this.$swal.fire({
          title: error.response.data.error,
          text: error.response.data.details,
          icon: "error",
        });
      }
    },
    updatePaginationStudents(options) {
      this.paginationStudents.page = options.page;
      this.paginationStudents.itemsPerPage = options.itemsPerPage;
      this.fetchDataTeacher();
    },
    updatePaginationMaterials(options) {
      this.paginationMaterials.page = options.page;
      this.paginationMaterials.itemsPerPage = options.itemsPerPage;
      this.fetchDataMaterials();
    },
    getDocumentTypeColor(type) {
      const colors = {
        pdf: "red",
        doc: "blue",
        docx: "blue",
        xls: "green",
        xlsx: "green",
        ppt: "orange",
        pptx: "orange",
        jpg: "purple",
        jpeg: "purple",
        png: "purple",
        gif: "purple",
        mp4: "indigo",
        avi: "indigo",
        mp3: "teal",
        wav: "teal",
      };
      return colors[type?.toLowerCase()] || "grey";
    },
    getTimeAgo(date) {
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);
      const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
      };

      for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
          return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
        }
      }
      return "Just now";
    },
    clearSelection() {
      this.selectedStudent = [];
      this.selectedMaterials = [];
    },
  },
};
</script>

<style lang="scss" scoped>
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 83, 80, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(239, 83, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 83, 80, 0);
  }
}

.pulse-animation {
  animation: pulse 2s infinite;
}

.v-avatar-light-bg.primary--text {
  background-color: rgba(25, 118, 210, 0.12);
  color: #1976d2;
}

.elevation-0 {
  box-shadow: none !important;
}

.v-data-table.elevation-0 .v-data-table__wrapper {
  border-radius: 0;
}

.v-chip {
  font-weight: 500;
}

.v-card {
  border-radius: 12px;
}

.v-btn.rounded-lg {
  border-radius: 8px;
}

.v-text-field.rounded-lg .v-input__slot {
  border-radius: 8px;
}
</style>
