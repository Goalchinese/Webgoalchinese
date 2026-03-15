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
          <h4 class="text-h4 white--text font-weight-bold">Materials</h4>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row justify="space-between">
      <v-col cols="4" class="d-flex ga-2">
        <h5 class="text-h5">Materials</h5>

        <v-btn
          color="info"
          x-small
          fab
          depressed
          to="/admin/materials/create"
          class="mx-2"
          v-if="userInfo?.role !== 'user' || permission?.create"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
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
          :headers="headersMaterials"
          :filter-keys="['title', 'category', 'type']"
          :items="itemsMaterials"
          :loading="isLoading"
          :server-items-length="pagination.total"
          :options.sync="pagination"
          show-select
          mobile-breakpoint="0"
          @update:options="updatePagination"
        >
          <template #[`item.photo`]="{ item }">
            <v-avatar
              size="64"
              rounded="lg"
              color="grey lighten-4"
              class="my-2"
            >
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
          <template #[`item.action`]="{ item }">
            <div class="d-flex">
              <v-btn
                color="primary"
                icon
                dark
                small
                depressed
                :to="`/admin/materials/edit/${item.id}`"
                v-if="userInfo?.role !== 'user' || permission?.edit"
              >
                <v-icon> mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                color="error"
                v-if="userInfo?.role !== 'user' || permission?.delete"
                icon
                dark
                small
                @click="deleteData(item.id)"
              >
                <v-icon>mdi-trash-can</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from "pinia";
import { useAppStore } from "@/stores/app";
import iconDocument from "@/assets/document.png";
export default {
  name: "MaterialsPage",
  data() {
    return {
      iconDocument,
      permission: {},
      search: "",
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
        { value: "action", text: "Action", sortable: false },
      ],
      itemsMaterials: [],
      isLoading: false,
      pagination: {
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
    baseUrl() {
      return process.env.VUE_APP_API_IMAGE || "";
    },
  },
  watch: {
    search() {
      this.fetchData();
    },
  },
  mounted() {
    this.fetchData();
    this.permission = this.userInfo.permissions.find(
      (it) => it.link === this.$route.path
    );
  },
  methods: {
    async fetchData() {
      this.isLoading = true;
      try {
        // Handle -1 (All) case - use large number instead of -1
        const limit =
          this.pagination.itemsPerPage === -1
            ? 1000
            : this.pagination.itemsPerPage;
        const params = {
          page: this.pagination.page,
          limit: limit,
        };

        if (this.search) {
          params.search = this.search;
        }

        const { data } = await this.axios.get("/materials", { params });

        this.itemsMaterials = data.data || [];
        this.pagination.total = data.total || 0;
        this.pagination.totalPages = data.totalPages || 0;
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
    async deleteData(id) {
      // confirm delete
      const { isDismissed } = await this.$swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this data!",
        icon: "warning",
        buttons: true,
      });

      if (isDismissed) return;

      //delete data from api
      try {
        const { data } = await this.axios.delete(`/materials/${id}`);
        this.$swal(data?.message, "", "success");
        this.fetchData();
      } catch (error) {
        this.$swal.fire({
          title: error.response.data.error,
          text: error.response.data.details,
          icon: "error",
        });
      }
    },
    updatePagination(options) {
      this.pagination.page = options.page;
      this.pagination.itemsPerPage = options.itemsPerPage;
      this.fetchData();
    },
  },
};
</script>

<style lang="scss" scoped></style>
