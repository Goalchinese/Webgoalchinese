<template>
  <v-row class="mb-4">
    <v-col cols="12">
      <div class="text-h4 font-weight-bold mb-0">Setting</div>
      <p class="text-body-small text-medium-emphasis mb-0">
        Manage your academy settings and preferences.
      </p>
    </v-col>
  </v-row>

  <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
    <v-card-title>
      <h5 class="text-h5 font-weight-bold mb-0">Academy Information</h5>
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="auto">
          <label class="v-label text-body-small font-weight-bold mb-2 d-block">
            Upload School Logo
          </label>
          <v-avatar rounded="lg" size="120" class="border border-1 border-light">
            <v-img v-if="formInput.logo" :src="formInput.logo" cover />
            <span v-else class="text-white text-h6">logo</span>
          </v-avatar>
          <div class="mt-2">
            <v-file-input
              v-if="userInfo?.role === 'superadmin'"
              v-model="formInput.file"
              density="compact"
              variant="outlined"
              hide-details
              accept="image/*"
              label="Choose a file..."
            />
            <v-btn
              v-if="userInfo?.role === 'superadmin'"
              color="error"
              variant="text"
              class="text-none mt-1"
              size="small"
              :loading="isSaving"
              :disabled="isSaving"
              @click="deleteLogo"
            >
              Remove Logo
            </v-btn>
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <AppTextField
            v-model="formInput.academyName"
            label="Academy Name"
            density="compact"
            hide-details
          />
          <v-btn
            v-if="userInfo?.role !== 'user' || permission?.edit"
            color="primary"
            class="text-none mt-3"
            prepend-icon="tabler-device-floppy"
            :loading="isSaving"
            :disabled="isSaving"
            @click="saveSetting"
          >
            Save Changes
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
    <v-card-title>
      <h5 class="text-h5 font-weight-bold mb-0">Academy Contact</h5>
    </v-card-title>
    <v-card-text>
      <v-row
        v-for="(contact, index) in contacts"
        :key="index"
        dense
        align="center"
      >
        <v-col cols="4" md="3">
          <AppTextField
            v-model="contact.label"
            density="compact"
            placeholder="Line"
            hide-details
          />
        </v-col>
        <v-col cols="6" md="7">
          <AppTextField
            v-model="contact.url"
            density="compact"
            placeholder="https://line.me/..."
            hide-details
          />
        </v-col>
        <v-col cols="auto">
          <v-btn
            icon="tabler-x"
            variant="text"
            size="small"
            :disabled="contacts.length <= 1"
            @click="removeContact(index)"
          />
        </v-col>
      </v-row>
      <v-btn
        variant="tonal"
        size="small"
        prepend-icon="tabler-plus"
        class="mt-2"
        @click="addContact"
      >
        Add contact link
      </v-btn>
      <div>
        <v-btn
          v-if="userInfo?.role !== 'user' || permission?.edit"
          color="primary"
          class="text-none mt-4"
          prepend-icon="tabler-device-floppy"
          :loading="isSaving"
          :disabled="isSaving"
          @click="saveSetting"
        >
          Save Contacts
        </v-btn>
      </div>
    </v-card-text>
  </v-card>

  <v-card rounded="lg" elevation="1" class="pa-4">
    <v-card-title>
      <h5 class="text-h5 font-weight-bold mb-0">Academy Tags</h5>
    </v-card-title>
    <v-card-text>
      <div v-for="key in TAG_CATEGORIES" :key="key" class="mb-4">
        <label
          class="v-label text-body-small font-weight-bold text-capitalize d-block mb-1"
        >
          {{ key }}
        </label>
        <div class="d-flex flex-wrap align-center ga-2">
          <v-chip
            v-for="item in items[key]"
            :key="item.id"
            size="large"
            label
            rounded="lg"
            :closable="userInfo?.role === 'superadmin'"
            @click="
              userInfo?.role !== 'user' || permission?.edit
                ? startEditTag(key, item)
                : null
            "
            @click:close="deleteTag(key, item.id)"
          >
            {{ item.name }}
          </v-chip>

          <template v-if="isVisible[key]">
            <div class="d-flex gap-4">
              <AppTextField
                v-model="formData[key]"
                density="compact"
                hide-details
                :placeholder="`Enter ${key}`"
                style="width: 220px"
              />
              <v-btn
                color="success"
                size="small"
                class="text-none"
                @click="saveTag(key)"
              >
                Save
              </v-btn>
              <v-btn
                color="error"
                variant="text"
                size="small"
                class="text-none"
                @click="isVisible[key] = false"
              >
                Cancel
              </v-btn>
            </div>
          </template>
          <v-btn
            v-else-if="userInfo?.role !== 'user' || permission?.create"
            icon="tabler-plus"
            size="x-small"
            color="info"
            @click="startCreateTag(key)"
          />
        </div>
      </div>

      <v-btn
        variant="tonal"
        to="/admin/logs"
        prepend-icon="tabler-history"
        class="text-none mt-2"
      >
        View history details
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { useSetting, TAG_CATEGORIES } from "@/composables/useSetting";

const { userInfo } = useAuth();
const route = useRoute();

const permission = computed(() =>
  userInfo.value?.permissions?.find(
    (it: { link?: string }) => it.link === route.path,
  ),
);

const {
  formInput,
  contacts,
  isSaving,
  isVisible,
  formData,
  items,
  saveSetting,
  deleteLogo,
  saveTag,
  deleteTag,
  startEditTag,
  startCreateTag,
  addContact,
  removeContact,
} = useSetting();
</script>

<style lang="scss" scoped></style>
