<script setup lang="ts">
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import misc401 from '@images/pages/401.png'
import miscMaskDark from '@images/pages/misc-mask-dark.png'
import miscMaskLight from '@images/pages/misc-mask-light.png'

const authThemeMask = useGenerateImageVariant(miscMaskLight, miscMaskDark)

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})
</script>

<template>
  <div class="misc-wrapper">
    <ErrorHeader
      status-code="403"
      title="You are not authorized! 🔐"
      description="You don't have permission to access this page."
    />

    <VBtn to="/" class="mb-11">
      Back to Home
    </VBtn>

    <div class="misc-avatar w-100 text-center">
      <VImg
        :src="misc401"
        alt="error 403"
        :max-height="$vuetify.display.smAndDown ? 350 : 500"
        class="mx-auto"
      />
    </div>

    <img
      class="misc-footer-img d-none d-md-block"
      :src="authThemeMask"
      alt="misc-footer-img"
      height="320"
    >
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/misc.scss";
</style>
