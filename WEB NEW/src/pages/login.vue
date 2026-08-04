<script setup lang="ts">
import { VForm } from "vuetify/components/VForm";
import auth from "@images/pages/auth.png";
import fallbackLogo from "@images/pages/logo.png";
import { themeConfig } from "@themeConfig";
import { useAuth } from "@/composables/useAuth";
import { useLoginForm } from "@/composables/useLoginForm";
import { useSwal } from "@/composables/useSwal";

definePage({
  meta: {
    layout: "blank",
    public: true,
  },
});

const isPasswordVisible = ref(false);
const route = useRoute();
const router = useRouter();
const { setSession, homeRoute } = useAuth();
const { showApiError } = useSwal();
const { logo, academyName } = useLoginForm();

const refVForm = ref();

const credentials = ref({
  username: "",
  password: "",
});

const errorMessage = ref("");
const loading = ref(false);

const login = async () => {
  loading.value = true;
  errorMessage.value = "";
  try {
    const res = await $api<{ message: string, user: any }>("/auth/login", {
      method: "POST",
      body: {
        username: credentials.value.username,
        password: credentials.value.password,
      },
    });

    const { user } = res;

    setSession(user, user.token);

    await nextTick(() => {
      router.replace({ path: route.query.to ? String(route.query.to) : homeRoute(user.role) });
    });
  } catch (err: any) {
    errorMessage.value = err?.data?.error || "Invalid username or password";
    showApiError({ response: { data: err?.data } });
  } finally {
    loading.value = false;
  }
};

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) login();
  });
};
</script>

<template>
  <VRow no-gutters class="auth-wrapper bg-surface">
    <VCol md="7" class="d-none d-md-flex">
      <div class="position-relative bg-background w-100 me-0">
        <div class="d-flex align-center justify-center w-100 h-100">
          <VImg
            height="calc(100vh - 0px)"
            :src="auth"
            class="auth-illustration"
          />
        </div>
      </div>
    </VCol>

    <VCol
      cols="12"
      md=""
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard flat class="mt-12 mt-sm-0 pa-4">
        <VCardTitle class="text-center justify-center d-flex">
          <VImg
            :src="logo || fallbackLogo"
            alt="logo"
            class="mb-4"
            max-width="170px"
          />
        </VCardTitle>
        <VCardText class="text-center">
          <h4 class="text-h4 mb-1">
            Welcome to
            <span class="text-capitalize"> {{ academyName || themeConfig.app.title }} </span>!
          </h4>
          <p class="mb-0">
            Access your classes, schedule, and learning materials
          </p>
        </VCardText>
        <VCardText>
          <VForm ref="refVForm" @submit.prevent="onSubmit">
            <VRow>
              <VCol v-if="errorMessage" cols="12" class="pt-0">
                <VAlert type="error" variant="tonal" density="compact">
                  {{ errorMessage }}
                </VAlert>
              </VCol>

              <!-- username -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.username"
                  autofocus
                  label="Username"
                  placeholder="username"
                  :rules="[requiredValidator]"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.password"
                  label="Password"
                  placeholder="············"
                  :rules="[requiredValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="
                    isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                  "
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <VBtn block type="submit" class="mt-4" :loading="loading">
                  Login
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
