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

const REMEMBERED_USERNAME_KEY = "rememberedUsername";

const credentials = ref({
  username: localStorage.getItem(REMEMBERED_USERNAME_KEY) || "",
  password: "",
  remember: !!localStorage.getItem(REMEMBERED_USERNAME_KEY),
});

const errorMessage = ref("");
const loading = ref(false);

const login = async () => {
  loading.value = true;
  errorMessage.value = "";
  try {
    const res = await $api<{ message: string; user: any }>("/auth/login", {
      method: "POST",
      body: {
        username: credentials.value.username,
        password: credentials.value.password,
      },
    });

    const { user } = res;

    if (credentials.value.remember) {
      localStorage.setItem(REMEMBERED_USERNAME_KEY, credentials.value.username);
    } else {
      localStorage.removeItem(REMEMBERED_USERNAME_KEY);
    }

    setSession(user, user.token);

    await nextTick(() => {
      router.replace({
        path: route.query.to ? String(route.query.to) : homeRoute(user.role),
      });
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
  <VRow no-gutters>
    <VCol cols="12" md="6" class="pa-2">
      <div class="bg-primary login-card d-flex align-center justify-center">
        <div class="login-dots login-dots--top" />
        <div class="login-blob login-blob--one" />
        <div class="login-blob login-blob--two" />
        <VCard flat class="mt-12 mt-sm-0 pa-4 login-card-inner">
          <VCardTitle class="text-center justify-center d-flex">
            <VImg
              :src="logo || fallbackLogo"
              alt="logo"
              class="mb-4"
              max-width="170px"
            />
          </VCardTitle>
          <VCardText>
            <div class="text-center mb-4 text-white">
              <h4 class="text-h4 mb-1 text-white text-center">
                Welcome to
                <span class="text-capitalize">
                  {{ academyName || themeConfig.app.title }} </span
                >!
              </h4>
              <p class="mb-0 text-center">
                Access your classes, schedule, and learning materials
              </p>
            </div>
            <v-row justify="center">
              <v-col cols="8">
                <VForm ref="refVForm" @submit.prevent="onSubmit" class="w-100">
                  <v-row>
                    <v-col v-if="errorMessage" cols="12" class="pt-0">
                      <VAlert type="error" variant="tonal" density="compact">
                        {{ errorMessage }}
                      </VAlert>
                    </v-col>

                    <!-- username -->
                    <v-col cols="12">
                      <VTextField
                        v-model="credentials.username"
                        autofocus
                        label="Username"
                        variant="solo"
                        single-line
                        class="login-field"
                        :rules="[requiredValidator]"
                      >
                        <template #prepend-inner>
                          <VIcon color="primary" size="25"
                            >tabler-user-filled</VIcon
                          >
                        </template>
                      </VTextField>
                    </v-col>

                    <!-- password -->
                    <v-col cols="12">
                      <VTextField
                        v-model="credentials.password"
                        label="Password"
                        placeholder="············"
                        single-line
                        variant="solo"
                        class="login-field"
                        :rules="[requiredValidator]"
                        :type="isPasswordVisible ? 'text' : 'password'"
                      >
                        <template #prepend-inner>
                          <VIcon color="primary" size="25"
                            >tabler-lock-filled</VIcon
                          >
                        </template>
                        <template #append-inner>
                          <VIcon
                            color="primary"
                            size="25"
                            @click="isPasswordVisible = !isPasswordVisible"
                            >{{
                              isPasswordVisible
                                ? "tabler-eye-off"
                                : "tabler-eye"
                            }}</VIcon
                          >
                        </template>
                      </VTextField>
                    </v-col>
                    <v-col cols="12">
                      <VCheckbox
                        v-model="credentials.remember"
                        base-color="white"
                      >
                        <template #label>
                          <span class="text-white">Remember Me</span>
                        </template>
                      </VCheckbox>
                    </v-col>
                    <v-col cols="12">
                      <VBtn
                        block
                        type="submit"
                        color="warning"
                        rounded="xl"
                        size="large"
                        :loading="loading"
                      >
                        Login
                      </VBtn>
                    </v-col>
                  </v-row>
                </VForm>
              </v-col>
            </v-row>
          </VCardText>
        </VCard>
      </div>
    </VCol>
    <VCol md="6" class="d-none d-md-flex pa-3">
      <VImg :src="auth" cover height="100%" width="90%" class="rounded-xl" />
    </VCol>
  </VRow>
</template>

<style lang="scss" scoped>
.login-field {
  :deep(.v-field) {
    border-radius: 18px;
  }
}

.login-card-inner {
  background-color: transparent !important;
}

.login-card {
  position: relative;
  overflow: hidden;
  border-radius: 64px;
  inline-size: 100%;
  block-size: 100%;

  &::before {
    content: "";
    position: absolute;
    inset-block-start: -90px;
    inset-inline-start: -90px;
    inline-size: 240px;
    block-size: 240px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    inset-block-end: -105px;
    inset-inline-end: -105px;
    inline-size: 240px;
    block-size: 240px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.07);
    pointer-events: none;
  }
}

.login-dots {
  position: absolute;
  inline-size: 144px;
  block-size: 96px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='white' fill-opacity='0.5'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 24px 24px;
  pointer-events: none;

  &--top {
    inset-block-start: 24px;
    inset-inline-end: 24px;
  }
}

.login-blob {
  position: absolute;
  pointer-events: none;
  background: rgba(255, 255, 255, 0.06);

  &--one {
    inset-block-end: -90px;
    inset-inline-start: -75px;
    inline-size: 390px;
    block-size: 240px;
    border-radius: 50% 50% 60% 40% / 60% 55% 45% 40%;
  }

  &--two {
    inset-block-end: -105px;
    inset-inline-start: 135px;
    inline-size: 300px;
    block-size: 180px;
    border-radius: 45% 55% 40% 60% / 50% 45% 55% 50%;
    background: rgba(255, 255, 255, 0.045);
  }
}
</style>
