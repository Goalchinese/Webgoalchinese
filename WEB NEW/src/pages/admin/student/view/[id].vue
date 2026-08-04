<template>
  <v-row>
    <v-col cols="12" class="d-flex align-center ga-2 mb-4">
      <v-btn icon="tabler-arrow-left" variant="text" to="/admin/student/all" />
      <div>
        <h4 class="text-h4 font-weight-bold">Students View</h4>
        <p class="text-body-small text-medium-emphasis mb-0">
          View student profile, materials and history.
        </p>
      </div>
    </v-col>
  </v-row>

  <v-card rounded="xl">
    <VImg :src="pages1" cover height="80" />
    <VCardText class="position-relative">
      <v-avatar
        class="avatar-center"
        size="120"
        :color="dataStudent.photo ? '' : 'grey-lighten-4'"
        :variant="!dataStudent.photo ? 'tonal' : undefined"
      >
        <v-img
          v-if="dataStudent.photo"
          :src="`${baseUrl}${dataStudent.photo}`"
        />
        <v-img v-else :src="iconStudent" />
      </v-avatar>
      <div
        class="d-flex text-white flex-column justify-center"
        style="margin-left: 8rem"
      >
        <h4 class="text-h4 font-weight-bold">{{ dataStudent?.name }}</h4>
        <div>
          <v-icon color="secondary"> tabler-star </v-icon>
          {{ dataStudent?.pointStructure?.pointAfterUpdate }} points
        </div>
      </div>

      <v-row class="mt-6">
        <v-col cols="12">
          <v-tabs v-model="tab" color="primary">
            <v-tab :key="1"> General </v-tab>
            <v-tab :key="2"> Materials list </v-tab>
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
                          :to="`/admin/student/edit/${$route.params.id}`"
                        />
                      </div>
                      <StudentViewDetail :item-data="dataStudent" />
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
                          >Payment History</span
                        >
                      </div>
                      <v-table height="300px" fixed-header>
                        <thead>
                          <tr>
                            <th class="text-left">Pay date</th>
                            <th class="text-left">Class type</th>
                            <th class="text-left">Amount</th>
                            <th class="text-left">Class fee</th>
                            <th class="text-left">Discount</th>
                            <th class="text-left">Total fee</th>
                            <th class="text-left">note</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(item, inx) in dataPayment" :key="inx">
                            <td>{{ item.payDate }}</td>
                            <td>{{ item.classType }}</td>
                            <td>{{ item.amount.toLocaleString() }}</td>
                            <td>{{ item.classFee.toLocaleString() }}</td>
                            <td>{{ item.discount.toLocaleString() }}</td>
                            <td>
                              {{
                                (
                                  item.amount +
                                  item.classFee -
                                  item.discount
                                ).toLocaleString()
                              }}
                            </td>
                            <td>{{ item.note || "N/A" }}</td>
                          </tr>
                        </tbody>
                      </v-table>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </v-window-item>
            <v-window-item :key="3">
              <v-container fluid>
                <v-row>
                  <v-col cols="12">
                    <v-card
                      rounded="lg"
                      elevation="1"
                      class="pa-4"
                      height="250"
                    >
                      <div class="d-flex align-center mb-4">
                        <span class="text-h5 font-weight-bold"
                          >Class History</span
                        >
                      </div>
                      <v-table height="300px" fixed-header>
                        <thead>
                          <tr>
                            <th class="text-left">Create Date</th>
                            <th class="text-left">Class Name</th>
                            <th class="text-left">Update date</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(item, inx) in dataClass" :key="inx">
                            <td width="150px">
                              {{
                                new Date(item.createdAt).toLocaleDateString(
                                  "en-GB",
                                )
                              }}
                            </td>
                            <td>{{ item?.name }}</td>
                            <td>
                              {{
                                new Date(item.createdAt).toLocaleDateString(
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
          </v-window>
        </v-col>
      </v-row>
    </VCardText>
  </v-card>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import StudentViewDetail from "@/views/student/StudentViewDetail.vue";
import { useStudentView } from "@/composables/useStudentView";
import pages1 from "@images/pages/1.png";

const $route = useRoute();

const {
  iconStudent,
  baseUrl,
  tab,
  dataStudent,
  dataMaterials,
  dataPayment,
  dataClass,
} = useStudentView();
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
