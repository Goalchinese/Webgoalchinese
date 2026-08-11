<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-card rounded="lg" elevation="1" class="pa-4 mb-4">
          <v-row dense>
            <v-col cols="12" md="4">
              <AppTextField
                v-model="formInput.name"
                label="Personal Name"
                density="compact"
                placeholder="Enter Personal name"
                persistent-placeholder
                :rules="[(v) => !!v || 'Personal name is required']"
              />
            </v-col>
            <v-col cols="12" md="auto">
              <label class="v-label mb-2 text-body-large"
                ><span class="text-error mr-2">*</span> Gender :
              </label>
              <v-radio-group
                v-model="formInput.gender"
                inline
                density="compact"
                hide-details="auto"
              >
                <v-radio label="Male" value="Male" color="primary" />
                <v-radio label="Female" value="Female" color="primary" />
                <v-radio label="Other" value="Other" color="primary" />
              </v-radio-group>
            </v-col>
            <v-col cols="12" md="">
              <AppTextField
                v-model="age"
                label="Age *"
                density="compact"
                readonly
              />
            </v-col>

            <v-col cols="12" md="4">
              <AppDateTimePicker
                v-model="formInput.dateOfBirth"
                label="Date of Birth"
                density="compact"
                placeholder="Select date"
                :rules="[requiredValidator]"
                prepend-inner-icon="tabler-calendar"
              />
            </v-col>

            <v-col cols="12" md="8">
              <v-row dense>
                <v-col cols="12" md="6">
                  <AppTextField
                    v-model="formInput.username"
                    label="User Name"
                    density="compact"
                    placeholder="Enter user name"
                    :disabled="flagEdit"
                    :rules="[(v) => !!v || 'User Name is required']"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <AppTextField
                    v-model="formInput.duty"
                    label="Duty"
                    density="compact"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <AppTextField
                    v-model="formInput.password"
                    label="User Password"
                    density="compact"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Enter password"
                    :append-inner-icon="
                      showPassword ? 'tabler-eye-off' : 'tabler-eye'
                    "
                    @click:append-inner="showPassword = !showPassword"
                    :rules="[
                      (v) => (flagEdit ? true : !!v || 'Password is required'),
                    ]"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <AppTextField
                    v-model="formInput.phone"
                    label="Phone"
                    density="compact"
                    rounded="lg"
                    single-line
                    hide-details="auto"
                    placeholder="Enter phone number"
                    persistent-placeholder
                  />
                </v-col>
              </v-row>
            </v-col>

            <v-col cols="12" md="4">
              <AppTextarea
                v-model="formInput.address"
                label="Address"
                density="compact"
                rounded="lg"
                single-line
                hide-details="auto"
                placeholder="Enter address"
                persistent-placeholder
              />
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-row dense class="mt-2">
      <v-col cols="12">
        <v-card rounded="lg" elevation="1" class="pa-4">
          <div
            class="d-flex align-center justify-space-between mb-2 flex-wrap ga-2"
          >
            <h6 class="text-h6 font-weight-bold">Permissions Access</h6>
            <v-checkbox
              v-model="isSelectAll"
              :indeterminate="isIndeterminate"
              label="Select All"
              color="primary"
              density="compact"
              class="flex-grow-0"
            />
          </div>

          <v-table density="compact">
            <template #default>
              <thead>
                <tr>
                  <th class="text-left">Module</th>
                  <th class="text-center">View</th>
                  <th class="text-center">Edit</th>
                  <th class="text-center">Delete</th>
                  <th class="text-center">Create</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="permission in permissions" :key="permission.name" >
                  <td>
                    <div class="d-flex align-center ga-2">
                        <VChip color="primary">
                          <v-icon color="primary" >{{ permission.icon }}</v-icon>
                        </VChip>
                      <h6 class="text-h6 font-weight-bold text-primary-darken-1">{{ permission.name }}</h6>
                    </div>
                  </td>
                  <td class="text-center">
                    <v-checkbox-btn
                      v-model="permission.view"
                      color="primary"
                      hide-details
                      class="d-flex justify-center"
                    />
                  </td>
                  <td class="text-center">
                    <v-checkbox-btn
                      v-show="permission.flagEdit"
                      v-model="permission.edit"
                      color="primary"
                      hide-details
                      class="d-flex justify-center"
                    />
                  </td>
                  <td class="text-center">
                    <v-checkbox-btn
                      v-show="permission.flagDelete"
                      v-model="permission.delete"
                      color="primary"
                      hide-details
                      class="d-flex justify-center"
                    />
                  </td>
                  <td class="text-center">
                    <v-checkbox-btn
                      v-show="permission.flagCreate"
                      v-model="permission.create"
                      color="primary"
                      hide-details
                      class="d-flex justify-center"
                    />
                  </td>
                </tr>
              </tbody>
            </template>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useUserForm, type UserFormProps } from "@/composables/useUserForm";

defineOptions({
  name: "UserForm",
});

const props = withDefaults(defineProps<UserFormProps>(), {
  editItems: () => ({}),
  flagEdit: false,
  userPermissions: () => [],
});

const emit = defineEmits<{
  (event: "input", value: Record<string, unknown>): void;
}>();

const {
  date,
  menu,
  isSelectAll,
  age,
  showPassword,
  formInput,
  permissions,
  isIndeterminate,
} = useUserForm(props, emit);
</script>

<style scoped></style>
