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
          <h4 class="text-h4 white--text font-weight-bold">Setting</h4>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="10">
        <v-row no-gutters>
          <v-col cols="12" md="3" class="d-flex align-start mt-2">
            <label class="v-label text-body-2 font-weight-bold"
              >Upload School Logo :
            </label>
          </v-col>

          <v-col cols="12" md="9">
            <v-file-input
              v-if="userInfo?.role == 'superadmin'"
              v-model="formInput.file"
              dense
              outlined
              label="Choose a file..."
              hide-details="auto"
              accept="image/*"
            />
            <v-avatar
              class="mt-2 mx-2"
              rounded="xl"
              size="150"
              color="grey lighten-3"
            >
              <img v-if="formInput.logo" :src="formInput.logo" alt="John" />
            </v-avatar>
            <v-btn
              color="error"
              class="text-none mt-2"
              @click="deleteLogo"
              v-if="userInfo?.role == 'superadmin'"
              :loading="isSaving"
              :disabled="isSaving"
            >
              Remove Logo
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="10">
        <v-row no-gutters>
          <v-col cols="12" md="3" class="d-flex align-start mt-2">
            <label class="v-label text-body-2 font-weight-bold"
              >Academy Name :
            </label>
          </v-col>

          <v-col cols="12" md="9">
            <v-text-field
              v-model="formInput.academyName"
              dense
              hide-details="auto"
              outlined
            />
            <v-btn
              color="success"
              depressed
              class="text-none mt-2"
              @click="saveSetting"
              v-if="userInfo?.role !== 'user' || permission?.edit"
              :loading="isSaving"
              :disabled="isSaving"
            >
              Save
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="10">
        <h6 class="text-h6">Others setting</h6>
      </v-col>
      <v-col cols="10">
        <v-row dense v-for="(value, name, index) in isvisible" :key="index">
          <v-col cols="12">
            <label class="v-label text-body-2 font-weight-bold text-capitalize"
              >{{ name }}
            </label>
          </v-col>
          <v-col cols="12">
            <v-row>
              <v-col cols="auto">
                <v-chip
                  class="mx-2"
                  size="large"
                  :closable="userInfo?.role == 'superadmin'"
                  label
                  rounded="lg"
                  v-for="(item, ix) in items[name]"
                  :key="ix"
                  @click="
                    userInfo?.role !== 'user' || permission?.edit
                      ? ((editItems[name] = item),
                        (formData[name] = item.name),
                        (isvisible[name] = true))
                      : null
                  "
                  :close="userInfo?.role == 'superadmin'"
                  @click:close="deleteData(name, item.id)"
                >
                  {{ item.name }}
                </v-chip>
              </v-col>

              <v-col cols="6" v-if="isvisible[name]">
                <div class="d-flex">
                  <v-text-field
                    v-model="formData[name]"
                    dense
                    outlined
                    single-line
                    hide-details="auto"
                    :placeholder="`Enter ${name}`"
                  />
                  <v-btn
                    color="success"
                    class="mx-1 text-none"
                    @click="saveData(name, formData[name], editItems[name]?.id)"
                    >save</v-btn
                  >
                  <v-btn
                    color="error"
                    class="text-none"
                    @click="isvisible[name] = false"
                    >cancle</v-btn
                  >
                </div>
              </v-col>
              <v-col cols="auto" v-else>
                <v-btn
                  v-if="userInfo?.role !== 'user' || permission?.create"
                  color="info"
                  fab
                  dark
                  x-small
                  depressed
                  @click="
                    ((formData[name] = ''), (editItems[name] = '')),
                      (isvisible[name] = !isvisible[name])
                  "
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="10">
        <router-link
          to="/admin/logs"
          class="v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default info text-none"
          style="text-decoration: none; color: white"
        >
          view history details
        </router-link>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from "pinia";
import { useAppStore } from "@/stores/app";

export default {
  name: "SettingPage",
  data() {
    return {
      permission: {},
      formInput: {
        file: null,
        logo: "",
        academyName: "",
      },
      isSaving: false,
      editItems: {
        branch: "",
        materialType: "",
        classType: "",
        studentType: "",
        teacherType: "",
        materialFor: "",
        materialCategory: "",
        currency: "",
      },
      formData: {
        branch: "",
        materialType: "",
        classType: "",
        studentType: "",
        teacherType: "",
        materialFor: "",
        materialCategory: "",
        currency: "",
      },
      isvisible: {
        branch: false,
        materialType: false,
        classType: false,
        studentType: false,
        teacherType: false,
        materialFor: false,
        materialCategory: false,
        currency: false,
      },
      items: {
        branch: [],
        materialType: [],
        classType: [],
        studentType: [],
        teacherType: [],
        materialFor: [],
        materialCategory: [],
        currency: [],
      },
    };
  },
  computed: {
    ...mapState(useAppStore, {
      userInfo: "getUserinfo",
    }),
    baseUrl() {
      return process.env.VUE_APP_API_IMAGE?.replace(/\/$/, "") || "";
    },
  },
  watch: {
    "formInput.file": function (val) {
      if (val) {
        this.formInput.logo = URL.createObjectURL(val);
      }
    },
  },
  mounted() {
    this.fetchSetting();

    this.fetchData("branch", "branch");
    this.fetchData("materialType", "materialType");
    this.fetchData("classType", "classType");
    this.fetchData("studentType", "studentType");
    this.fetchData("teacherType", "teacherType");
    this.fetchData("materialFor", "materialFor");
    this.fetchData("materialCategory", "materialCategory");
    this.fetchData("currency", "currency");

    this.permission = this.userInfo.permissions.find(
      (it) => it.link === this.$route.path
    );
  },
  methods: {
    async fetchSetting() {
      // fetch data from api
      try {
        const { data } = await this.axios.get(`/setting`);

        if (data.length) {
          if (data[0].logo)
            this.formInput.logo = process.env.VUE_APP_API_IMAGE + data[0].logo;
          this.formInput.academyName = data[0].academyName;
        } else {
          this.formInput.logo = null;
          this.formInput.academyName = "";
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
      this.isSaving = true;
      try {
        const formData = new FormData();
        formData.append("logo", this.formInput.file);
        formData.append("academyName", this.formInput.academyName);

        const { data } = await this.axios.post(`/setting`, formData);

        // Update UI immediately with response data
        if (data.setting) {
          if (data.setting.logo) {
            this.formInput.logo =
              process.env.VUE_APP_API_IMAGE + data.setting.logo;
          } else {
            this.formInput.logo = null;
          }
          this.formInput.academyName =
            data.setting.academyName || this.formInput.academyName;
        }

        // Clear file input after successful save
        this.formInput.file = null;

        // Show success message
        this.$swal.fire({
          title: "Success!",
          text: "Settings updated successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        this.$swal.fire({
          title: error.response?.data?.error || "Error",
          text: error.response?.data?.details || error.message,
          icon: "error",
        });
      } finally {
        this.isSaving = false;
      }
    },
    async deleteLogo() {
      // confirm delete
      const { isDismissed } = await this.$swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this data!",
        icon: "warning",
        buttons: true,
      });

      if (isDismissed) return;

      this.isSaving = true;
      try {
        await this.axios.delete(`/setting/logo`);

        // Update UI immediately
        this.formInput.file = null;
        this.formInput.logo = null;

        // Show success message
        this.$swal.fire({
          title: "Success!",
          text: "Logo deleted successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        this.$swal.fire({
          title: error.response?.data?.error || "Error",
          text: error.response?.data?.details || error.message,
          icon: "error",
        });
      } finally {
        this.isSaving = false;
      }
    },
    async fetchData(uri, items) {
      // fetch data from api
      try {
        const { data } = await this.axios.get(`/${uri}`);
        this.items[items] = data;
      } catch (error) {
        this.$swal.fire({
          title: error.response.data.error,
          text: error.response.data.details,
          icon: "error",
        });
      }
    },
    async saveData(key, payload, id) {
      // save data to api
      try {
        if (id) {
          await this.axios.put(`/${key}/${id}`, { name: payload });
        } else {
          await this.axios.post(`/${key}`, { name: payload });
        }
        this.fetchData(key, key);
        this.isvisible[key] = !this.isvisible[key];
        this.formData[key] = "";
        this.editItems[key] = "";
      } catch (error) {
        this.$swal.fire({
          title: error.response.data.error,
          text: error.response.data.details,
          icon: "error",
        });
      }
    },
    async deleteData(key, id) {
      // confirm delete
      const { isDismissed } = await this.$swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this data!",
        icon: "warning",
        buttons: true,
      });

      if (isDismissed) return;

      // delete data from api
      try {
        await this.axios.delete(`/${key}/${id}`);
        this.fetchData(key, key);
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
