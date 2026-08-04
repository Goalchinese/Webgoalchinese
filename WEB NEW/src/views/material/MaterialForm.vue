<template>
  <div>
    <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
      <div class="d-flex align-center mb-4">
        <v-avatar size="32" color="primary" class="mr-3">
          <v-icon color="white" size="20">tabler-info-circle</v-icon>
        </v-avatar>
        <span class="text-h5 font-weight-bold">Materials Information</span>
      </div>
      <v-row dense>
        <v-col cols="12" md="6">
          <AppTextField
            v-model="formInput.title"
            label="Materials title"
            density="compact"
            :rules="[(v) => !!v || 'Title is required']"
          >
          </AppTextField>
        </v-col>
        <v-col cols="12" md="6">
          <AppSelect
            v-model="formInput.materialTypeID"
            label="Materials type"
            :items="items.materialType"
            item-title="name"
            item-value="id"
            density="compact"
            :rules="[(v) => !!v || 'Type is required']"
          >
          </AppSelect>
        </v-col>
        <v-col cols="12" md="6">
          <AppSelect
            v-model="formInput.categoryID"
            label="Materials category"
            :items="items.materialCategory"
            item-title="name"
            item-value="id"
            density="compact"
            :rules="[(v) => !!v || 'Category is required']"
          >
          </AppSelect>
        </v-col>
        <v-col cols="12" md="6">
          <AppSelect
            v-model="formInput.materialForID"
            label="Materials for"
            :items="items.materialFor"
            item-title="name"
            item-value="id"
            density="compact"
            :rules="[(v) => !!v || 'Materials for is required']"
          >
          </AppSelect>
        </v-col>
        <v-col cols="12" md="6">
          <v-row align="center">
            <v-col cols="">
              <v-label class="mb-2 text-subtitle-2 font-weight-medium">
                Upload Photo
              </v-label>
              <v-file-input
                v-if="!formInput.photo || (flagEdit && photoFile)"
                v-model="photoFile"
                variant="outlined"
                density="compact"
                :placeholder="photoPlaceholder"
                accept="image/*"
                @change="onPhotoChange"
              >
              </v-file-input>
              <AppTextField
                v-else
                :value="
                  photoFile
                    ? photoFile[0]?.name
                    : getDocumentName(formInput.photo)
                "
                density="compact"
                readonly
                append-icon="tabler-trash"
                @click:append="deletePhoto"
              >
              </AppTextField>
            </v-col>
            <!-- <v-col cols="auto" v-if="flagEdit && formInput.photo">
              <v-btn color="error" icon variant="text" @click="deletePhoto">
                <v-icon>tabler-trash</v-icon>
              </v-btn>
            </v-col> -->
          </v-row>
        </v-col>
      </v-row>
    </v-card>

    <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
      <div class="d-flex align-center mb-4">
        <v-avatar size="32" color="info" class="mr-3">
          <v-icon color="white" size="20">tabler-cloud-upload</v-icon>
        </v-avatar>
        <span class="text-h5 font-weight-bold">Upload Materials</span>
      </div>

      <v-row dense>
        <v-col cols="12" md="6">
          <AppTextField
            v-model="formInput.no"
            label="Materials No"
            density="compact"
            :rules="[(v) => !!v || 'Materials No is required']"
          >
          </AppTextField>
        </v-col>
        <v-col cols="12" md="6">
          <v-label class="mb-2 text-subtitle-2 font-weight-medium">
            Materials Document
          </v-label>
          <v-file-input
            v-if="!formInput.document || (flagEdit && documentFile)"
            v-model="documentFile"
            variant="outlined"
            density="compact"
            
            :show-size="false"
            @change="onDocumentChange"
          >
          </v-file-input>
          <AppTextField
            v-else
            :value="
              documentFile?.length
                    ? documentFile[0]?.name
                    : getDocumentName(formInput.document) || 'No file chosen'
            "
            density="compact"
            readonly
            append-icon="tabler-trash"
            @click:append="clearDocument"
          >
          </AppTextField>
        </v-col>
        <v-col cols="12" md="6">
          <AppSelect
            v-model="formInput.documentType"
            label="Materials Document Type"
            density="compact"
            :items="['pptx', 'pdf', 'mp4', 'youtube', 'canva']"
            :rules="[(v) => !!v || 'Materials Document Type is required']"
          />
        </v-col>
        <v-col cols="12" md="6">
          <AppTextField
            v-model="formInput.link"
            label="Materials Link"
            density="compact"
          />
        </v-col>
        <v-col cols="12" md="6">
          <AppTextarea
            v-model="formInput.description"
            label="Description"
            density="compact"
            rows="1"
            auto-grow
          />
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useMaterialForm } from "@/composables/useMaterialForm";
import { v } from "unplugin-vue-router/options-DG3niQXy.mjs";

defineOptions({
  name: "MaterialForm",
});

const props = defineProps<{
  editItems?: Record<string, any> | null;
  flagEdit?: boolean;
}>();

const emit = defineEmits<{
  (e: "input", value: any): void;
}>();

const {
  editItems,
  flagEdit,
  formInput,
  photoFile,
  documentFile,
  items,
  photoPlaceholder,
  documentPlaceholder,
  getDocumentName,
  getOriginalDocumentName,
  onPhotoChange,
  onDocumentChange,
  clearDocument,
  deletePhoto,
} = useMaterialForm(props, emit);
</script>

<style scoped></style>
