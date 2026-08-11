<template>
  <v-row>
    <v-col cols="12" class="d-flex align-center ga-2 mb-4">
      <v-btn icon="tabler-arrow-left" variant="text" to="/admin/teacher/all" />
      <div>
        <h4 class="text-h4 font-weight-bold">Teacher View</h4>
        <p class="text-body-small text-medium-emphasis mb-0">
          View teacher profile, materials and class list.
        </p>
      </div>
    </v-col>
  </v-row>

  <v-card rounded="xl">
    <VImg :src="pages2" cover height="80" />
    <VCardText class="position-relative">

      <v-avatar
        class="avatar-center"
        size="120"
        :color="dataTeacher.photo ? '' : 'grey-lighten-4'"
        :variant="!dataTeacher.photo ? 'tonal' : undefined"
      >
        <v-img
          v-if="dataTeacher.photo"
          :src="`${baseUrl}${dataTeacher.photo}`"
        />
        <v-img v-else :src="iconTeacher" />
      </v-avatar>
      <div class="d-flex flex-column justify-center ml-16">
        <h4 class="text-h4 font-weight-bold text-primary ml-16">
          {{ dataTeacher?.name }} 
        </h4>
      </div>

      <v-row class="mt-6">
        <v-col cols="12">
          <v-tabs v-model="tab" class="text-h6 font-weight-bold" background-color="transparent">
            <v-tab key="0"> General </v-tab>
            <v-tab key="1"> Materials list </v-tab>
            <v-tab key="2"> Class list </v-tab>
          </v-tabs>

          <v-window v-model="tab">
            <v-window-item :key="0">
              <v-container fluid>
                <v-row>
                  <v-col cols="12">
                    <v-card
                      rounded="lg"
                      elevation="1"
                      class="pa-4"
                      min-height="250"
                    >
                      <div class="d-flex align-center mb-4">
                        <span class="text-h5 font-weight-bold">General</span>
                        <v-spacer></v-spacer>
                        <v-btn
                          icon="tabler-edit"
                          variant="text"
                          :to="`/admin/teacher/edit/${$route.params.id}`"
                        />
                      </div>
                      <TeacherViewDetail :item-data="dataTeacher" />
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </v-window-item>
            <v-window-item :key="1">
              <v-container fluid>
                <v-row>
                  <v-col cols="12">
                    <v-card
                      rounded="lg"
                      elevation="1"
                      class="pa-4"
                      min-height="250"
                    >
                      <div class="d-flex align-center mb-4">
                        <span class="text-h5 font-weight-bold"
                          >Materials list</span
                        >
                        <v-spacer></v-spacer>
                        <v-icon>tabler-edit</v-icon>
                      </div>
                      <v-table height="300px" fixed-header>
                        <thead>
                          <tr>
                            <th class="text-left">Material No.</th>
                            <th class="text-left">Title</th>
                            <th class="text-left">Update date</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(item, inx) in dataMaterials" :key="inx">
                            <td width="150px">{{ item?.material?.no }}</td>
                            <td>{{ item?.material?.title }}</td>
                            <td>
                              {{
                                new Date(item.updatedAt).toLocaleDateString(
                                  "en-GB",
                                )
                              }}
                            </td>
                          </tr>
                        </tbody>
                      </v-table>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </v-window-item>
            <v-window-item :key="2">
              <v-container fluid>
                <v-row class="fill-height">
                  <v-col cols="12">
                    <v-card rounded="lg" elevation="1" class="pa-4 fill-height">
                      <div class="d-flex align-center mb-4">
                        <span class="text-h5 font-weight-bold">Class list</span>
                      </div>
                      <Calendar
                        @fetch-events="onFetchEvents"
                        :events-items="events"
                      />
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </v-window-item>
          </v-window>
        </v-col>
      </v-row>
    </VCardText>
  </v-card>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import TeacherViewDetail from "@/views/teacher/TeacherViewDetail.vue";
import { useTeacherView } from "@/composables/useTeacherView";
import pages2 from "@images/pages/2.png";
import avatar1 from "@images/avatars/avatar-1.png";

const $route = useRoute();

const {
  iconTeacher,
  baseUrl,
  tab,
  dataTeacher,
  dataMaterials,
  events,
  fetchDataById,
  fetchDataMaterials,
  onFetchEvents,
} = useTeacherView();
</script>

<style lang="scss" scoped>
.avatar-center {
  position: absolute;
  border: 3px solid rgb(var(--v-theme-surface));
  inset-block-start: -3rem;
  inset-inline-start: 1rem;
}

// membership pricing
.member-pricing-bg {
  position: relative;
  background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
}

.membership-pricing {
  sup {
    inset-block-start: 9px;
  }
}

.v-btn {
  transform: none;
}
</style>
