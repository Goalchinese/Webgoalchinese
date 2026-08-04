<script setup lang="ts">
import avatar1 from "@images/avatars/avatar-1.png";
import { useAuth } from "@/composables/useAuth";

const router = useRouter();
const { userInfo, logout } = useAuth();

const onLogout = () => {
  logout();
  router.replace({ name: "login" });
};
</script>

<template>
  <VBadge
    dot
    location="bottom right"
    offset-x="3"
    offset-y="3"
    bordered
    color="success"
  >
    <VAvatar class="cursor-pointer" color="primary" variant="tonal">
      <VImg v-if="userInfo?.photo" :src="userInfo?.photo" />
      <VIcon v-else icon="tabler-user" size="22" />

      <!-- SECTION Menu -->
      <VMenu activator="parent" width="230" location="bottom end" offset="14px">
        <VList>
          <!-- 👉 User Avatar & Name -->
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                >
                  <VAvatar color="primary" variant="tonal">
                    <VImg v-if="userInfo?.photo" :src="userInfo?.photo" />
                    <VIcon v-else icon="tabler-user" size="22" />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-semibold">
              {{ userInfo?.name || userInfo?.username }}
            </VListItemTitle>
            <VListItemSubtitle class="text-capitalize">
              {{ userInfo?.role }}
            </VListItemSubtitle>
          </VListItem>

          <VDivider class="my-2" />

          <!-- 👉 Settings -->
          <VListItem
            v-if="
              userInfo?.role && ['admin', 'superadmin'].includes(userInfo.role)
            "
            to="/admin/setting"
          >
            <template #prepend>
              <VIcon class="me-2" icon="tabler-settings" size="22" />
            </template>

            <VListItemTitle>Settings</VListItemTitle>
          </VListItem>

          <!-- Divider -->
          <VDivider class="my-2" />

          <!-- 👉 Logout -->
          <VListItem @click="onLogout">
            <template #prepend>
              <VIcon class="me-2" icon="tabler-logout" size="22" />
            </template>

            <VListItemTitle>Logout</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
