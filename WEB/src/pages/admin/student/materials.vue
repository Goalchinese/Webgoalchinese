<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-sheet
          rounded="lg"
          color="info"
          class="mx-auto d-flex justify-center align-center"
          height="50"
          width="100%"
        >
          <h4 class="text-h4 white--text font-weight-bold">
            Student Materials
          </h4>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="4">
        <h5 class="text-h5">
          <span class="red--text">*</span> Select Students
        </h5>
      </v-col>
      <v-col cols="auto" class="ml-auto">
        <v-btn
          color="info"
          :disabled="!selectedStudent.length"
          @click="clearMaterials"
          >Clear Materials Data</v-btn
        >
      </v-col>
      <v-col cols="4">
        <v-text-field
          v-model="search"
          placeholder="Search..."
          dense
          hide-details="auto"
          background-color="grey lighten-4"
          solo
          flat
          clearable
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12">
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
            {{ item.pointStructure?.pointAfterUpdate || 0 }}
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <v-row justify="space-between">
      <v-col cols="4">
        <h5 class="text-h5">
          <span class="red--text">*</span> Select Materials
        </h5>
      </v-col>
      <v-col cols="4">
        <v-text-field
          v-model="searchMaterials"
          placeholder="Search..."
          dense
          hide-details="auto"
          background-color="grey lighten-4"
          solo
          flat
          clearable
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <v-data-table
          v-model="selectedMaterials"
          :headers="headersMaterials"
          :filter-keys="['title', 'category', 'type']"
          :items="itemsMaterials"
          :loading="isLoadingMaterials"
          :server-items-length="paginationMaterials.total"
          :options.sync="paginationMaterials"
          show-select
          mobile-breakpoint="0"
          @update:options="updatePaginationMaterials"
        >
          <template #item.photo="{ item }">
            <v-avatar size="64" rounded color="grey lighten-4" class="my-2">
              <v-img
                height="64"
                width="64"
                cover
                v-if="item.photo"
                :src="`${baseUrl}${item.photo}`"
              />
              <v-img v-else :src="iconDocument" />
            </v-avatar>
          </template>
          <template #[`item.date`]="{ item }">
            {{ new Date(item.createdAt).toLocaleDateString("en-GB") }}
          </template>
          <template #[`item.description`]="{ item }">
            {{ item.description || "N/A" }}
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <v-row justify="end">
      <v-col cols="auto">
        <v-btn
          color="primary"
          class="text-none"
          @click="update"
          :disabled="
            !selectedStudent.length || !selectedMaterials.length || isLoading
          "
          :loading="isLoading"
          v-if="userInfo?.role !== 'user' || permission?.edit"
        >
          <v-icon left> mdi-content-save </v-icon>
          Update
        </v-btn>
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
      isLoading: false,
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
        const params = {
          role: "student",
          page: this.paginationStudents.page,
          limit: this.paginationStudents.itemsPerPage,
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
        const params = {
          materialFor: "student",
          page: this.paginationMaterials.page,
          limit: this.paginationMaterials.itemsPerPage,
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
      this.isLoading = true;
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
      } finally {
        this.isLoading = false;
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
          type: "all",
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
  },
};
</script>

<style lang="scss" scoped></style>
