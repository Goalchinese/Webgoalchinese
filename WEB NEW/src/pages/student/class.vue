<template>
  <v-row justify="center" class="mt-10 mt-md-0">
    <v-col class="d-flex gap-2">
      <v-avatar
        class="mt-2 mx-2"
        rounded="xl"
        size="100"
        :color="dataStudent.photo ? '' : 'grey-lighten-4'"
        :variant="!dataStudent.photo ? 'tonal' : undefined"
      >
        <v-img
          v-if="dataStudent.photo"
          :src="`${baseUrl}${dataStudent.photo}`"
        />
        <v-img v-else :src="iconStudent" />
      </v-avatar>
      <div class="d-flex text-white flex-column justify-center ">
        <h4 class="text-h4 font-weight-bold text-primary-darken-4">{{ dataStudent?.name }}</h4>
        <div>
          <v-icon color="secondary"> tabler-star </v-icon>
          {{ dataStudent?.pointStructure?.pointAfterUpdate }} points
        </div>
      </div>
    </v-col>
    <v-col cols="auto">
      <v-card
        rounded="lg"
        elevation="1"
        width="250"
        height="100"
        class="d-flex justify-center align-center gap-4 pa-0"
      >
        <VAvatar color="primary" size="52" variant="tonal">
          <VIcon color="primary" icon="tabler-clock" size="32" />
        </VAvatar>
        <div>
          <div class="text-grey">Remaining class:</div>
          <div class="d-flex justify-center align-center fill-height">
            <h4 class="text-h4 font-weight-bold">
              {{ totalClassTimes - totalAttendTimes }} / {{ totalClassTimes }}
            </h4>
            <small class="mt-5 text-grey pl-4"> times</small>
          </div>
        </div>
      </v-card>
    </v-col>
    <v-col cols="auto">
      <v-card
        rounded="lg"
        elevation="1"
        width="250"
        height="100"
        class="d-flex justify-center align-center gap-4 pa-0"
      >
        <VAvatar color="warning" size="52" variant="tonal">
          <VIcon color="warning" icon="tabler-logout" size="32" />
        </VAvatar>
        <div>
          <div class="text-grey">Leave class:</div>
          <div class="d-flex justify-center align-center fill-height">
            <h4 class="text-h4 font-weight-bold">
              {{ studentLeaveTimes }} / {{ totalLeaveTimes }}
            </h4>
            <small class="mt-5 text-grey pl-4"> times</small>
          </div>
        </div>
      </v-card>
    </v-col>
    <v-col> </v-col>
  </v-row>

  <v-row class="fill-height">
    <v-col>
      <Calendar
        class="mt-6"
        :events-items="events"
        @fetch-events="onFetchEvents"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useStudentClassPage } from "@/composables/useStudentClassPage";

const {
  iconStudent,
  baseUrl,
  dataStudent,
  totalClassTimes,
  totalAttendTimes,
  totalLeaveTimes,
  studentLeaveTimes,
  events,
  onFetchEvents,
} = useStudentClassPage();
</script>

<style lang="scss" scoped></style>
