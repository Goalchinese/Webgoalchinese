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
          <h4 class="text-h4 white--text font-weight-bold">Teachers</h4>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row justify="space-between">
      <v-col cols="4" class="d-flex ga-2">
        <h5 class="text-h5">Teachers</h5>
        <v-btn
          color="info"
          x-small
          fab
          depressed
          to="/admin/teacher/create"
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
          :headers="headers"
          :filter-keys="['title', 'category', 'type']"
          :items="items"
          :loading="isLoading"
          :server-items-length="pagination.total"
          :options.sync="pagination"
          show-select
          mobile-breakpoint="0"
          @update:options="updatePagination"
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
                <v-img v-else :src="iconTeacher" />
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
          <template #[`item.score`]="{ item }">
            {{ item.pointStructure?.pointAfterUpdate || 0 }}
          </template>

          <template #[`item.registerDate`]="{ item }">
            {{ new Date(item.registerDate).toLocaleDateString("en-GB") }}
          </template>
          <template #item.action="{ item }">
            <v-menu bottom left>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>

              <v-list dense>
                <template
                  v-for="(menu, i) in [
                    {
                      title: 'View',
                      to: `./view/${item.id}`,
                      show: userInfo?.role !== 'user' || permission?.view,
                    },
                    {
                      title: 'Edit',
                      to: `./edit/${item.id}`,
                      show: userInfo?.role !== 'user' || permission?.edit,
                    },
                  ]"
                >
                  <v-list-item :key="i" link :to="menu.to" v-if="menu.show">
                    <v-list-item-title>{{ menu.title }}</v-list-item-title>
                  </v-list-item>
                </template>
                <v-list-item
                  link
                  v-if="userInfo?.role !== 'user' || permission?.delete"
                  @click="deleteData(item.id)"
                >
                  <v-list-item-title>Delete</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from "pinia";
import { useAppStore } from "@/stores/app";
import iconTeacher from "@/assets/teacher.png";
export default {
  name: "TeacherAll",
  data() {
    return {
      iconTeacher,
      permission: {},
      search: "",
      headers: [
        {
          align: "start",
          value: "teacherNo",
          sortable: false,
          text: "Teacher No.",
        },
        { value: "name", text: "Teacher Name", width: "30%" },
        { value: "registerDate", text: "Start teaching date" },
        { value: "avaliableForClass", text: "Available for" },
        { value: "language", text: "Language" },
        { value: "score", text: "Teacher score" },
        { value: "age", text: "Age" },
        { value: "gender", text: "Gender" },
        { value: "action", text: "Action" },
      ],
      items: [],
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

        // When selecting "All", always fetch from page 1 to avoid offset issues
        const page =
          this.pagination.itemsPerPage === -1 ? 1 : this.pagination.page;

        const params = {
          role: "teacher",
          page: page,
          limit: limit,
        };

        if (this.search) {
          params.search = this.search;
        }

        const { data } = await this.axios.get("/account", { params });

        this.items = data.data || [];
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
        await this.axios.delete(`/account/${id}`);
        this.$swal("Material deleted successfully", "", "success");
        this.fetchData();
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
