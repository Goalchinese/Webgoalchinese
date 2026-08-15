<template>
  <v-row>
    <v-col cols="12" md="6" class="d-flex ga-2 align-center mb-4">
      <v-btn icon="tabler-arrow-left" variant="text" to="/admin/classes/all" />
      <div>
        <h4 class="text-h4 font-weight-bold">Attendance</h4>
        <p class="text-body-small text-medium-emphasis mb-0">
          Track and update class attendance records.
        </p>
      </div>
    </v-col>
  </v-row>

  <v-card rounded="lg" elevation="1">
    <v-row>
      <v-col>
        <v-col cols="12" md="4" class="ml-md-auto">
          <AppTextField
            v-model="search"
            placeholder="Search..."
            prepend-inner-icon="tabler-search"
            density="compact"
            rounded="lg"
            hide-details="auto"
            clearable
          />
        </v-col>
      </v-col>
    </v-row>
    <v-data-table
      :headers="headers"
      :filter-keys="['title', 'category', 'type']"
      mobile-breakpoint="0"
      :items="items"
    >
      <template #item.studyDay="{ item }">
        <div v-for="(it, i) in item.classStudy" :key="i" class="mb-1">
          <StatusChip type="day" :value="it.day" rounded="lg" />
        </div>
      </template>
      <template #item.timeSlot="{ item }">
        <div v-for="(it, i) in item.classStudy" :key="i" class="mb-1">
          <StatusChip
            type="timeSlot"
            :value="`${it.startTime} - ${it.endTime}`"
            rounded="lg"
          />
        </div>
      </template>

      <template #item.teacherLeave="{ item }">
        <v-form ref="formTeacherLeave" lazy-validation>
          <AppTextField
            v-model="item.inputTeacherLeave"
            density="compact"
            rounded="lg"
            hide-details="auto"
            :suffix="`/ ${item.teacherLeave}`"
            class="w-50"
            style="inline-size: 80px"
            :rules="[
              () => item.inputTeacherLeave >= 0 || 'Required',
              () =>
                (item.inputTeacherLeave >= 0 &&
                  item.inputTeacherLeave <= item.teacherLeave) ||
                'Invalid',
            ]"
            @keydown.enter.prevent="
              updateClass(item.id, {
                inputTeacherLeave: item.inputTeacherLeave,
              })
            "
          ></AppTextField>
        </v-form>
      </template>

      <template #item.studentLeave="{ item }">
        <v-form ref="formStudentLeave" lazy-validation>
          <AppTextField
            v-model="item.inputStudentLeave"
            density="compact"
            rounded="lg"
            hide-details="auto"
            :suffix="`/ ${item.studentLeave}`"
            class="w-50"
            style="inline-size: 80px"
            :rules="[
              () => item.inputStudentLeave >= 0 || 'Required',
              () =>
                (item.inputStudentLeave >= 0 &&
                  item.inputStudentLeave <= item.studentLeave) ||
                'Invalid',
            ]"
            @keydown.enter.prevent="
              updateClass(item.id, {
                inputStudentLeave: item.inputStudentLeave,
              })
            "
          ></AppTextField>
        </v-form>
      </template>

      <template #item.times="{ item }">
        <div style="width: 350px" class="text-no-wrap overflow-auto">
          <v-chip
            v-for="(time, i) in genarateTimes(item)"
            :key="i"
            class="ma-1 pa-2"
            label
            size="small"
            variant="tonal"
            :color="resolveStatus(time.status)"
            @click.stop="showDialog(item.id, time)"
          >
            {{ i + 1 }}
          </v-chip>
        </div>
      </template>

      <template #item.action="{ item }">
        <v-menu>
          <template #activator="{ props }">
            <v-btn
              icon="tabler-dots-vertical"
              variant="text"
              size="small"
              v-bind="props"
            />
          </template>

          <v-list density="compact">
            <v-list-item
              v-for="(menu, i) in [
                { title: 'View', to: `./view/${item.id}` },
                { title: 'Edit', to: `./edit/${item.id}` },
              ]"
              :key="i"
              :to="menu.to"
              :title="menu.title"
            />
          </v-list>
        </v-menu>
      </template>
    </v-data-table>
  </v-card>

  <v-dialog v-model="dialog" max-width="350" persistent>
    <v-card rounded="lg">
      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12">
            <AppDateTimePicker
              v-model="editItem.studyDate"
              label="Study date"
              density="compact"
              placeholder="Select date"
              :rules="[requiredValidator]"
              prepend-inner-icon="tabler-calendar"
            />
          </v-col>
          <v-col cols="12">
            <v-radio-group
              v-model="editItem.status"
              column
              hide-details="auto"
              density="compact"
            >
              <template v-for="(status, i) in statusList" :key="i">
                <div class="d-flex py-1 align-center">
                  <v-radio
                    :label="status.text"
                    :color="status.color"
                    :value="status.value"
                  ></v-radio>
                  <v-chip inline :color="status.color"></v-chip>
                </div>
              </template>
            </v-radio-group>
          </v-col>
          <v-col cols="12">
            <AppTextarea
              v-model="editItem.note"
              label="Note"
              density="comfortable"
              rounded="lg"
              hide-details="auto"
              placeholder="Enter note"
              rows="2"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" @click="dialog = false"> Cancel </v-btn>
        <v-btn color="primary" @click="saveAttendance"> Save </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useClassesAttendance } from "@/composables/useClassesAttendance";
import { v } from "unplugin-vue-router/options-DG3niQXy.mjs";

const {
  dialog,
  menu2,
  search,
  headers,
  items,
  date,
  statusList,
  selectedStatus,
  itemsAttendance,
  editClassID,
  editTimeID,
  editItem,
  formTeacherLeave,
  formStudentLeave,
  datePicker,
  fetchData,
  resolveStatus,
  showDialog,
  genarateTimes,
  saveAttendance,
  updateClass,
} = useClassesAttendance();
</script>

<style scoped></style>
