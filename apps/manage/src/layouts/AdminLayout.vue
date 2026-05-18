<script setup lang="ts">
import { manageMenus } from '@whut/shared'
import { computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const visibleMenus = computed(() =>
  manageMenus.filter((item) => authStore.hasPermission(item.permissionCode))
)

const activeMenuKey = computed(() => String(route.meta.menuKey ?? ''))
const pageTitle = computed(() => String(route.meta.title ?? '管理端'))
const breadcrumb = computed(() => (Array.isArray(route.meta.breadcrumb) ? route.meta.breadcrumb : []))
const layoutKind = computed(() => String(route.meta.layout ?? 'admin'))
const displayName = computed(() => authStore.session?.userName ?? '未登录用户')

const navigateTo = async (path: string) => {
  if (route.path !== path) {
    await router.push(path)
  }
}

const handleLogout = async () => {
  authStore.logout()
  await router.push({ name: 'AdminLogin' })
}
</script>

<template>
  <div class="admin-shell" :data-layout="layoutKind">
    <aside class="admin-sidebar">
      <div class="admin-brand">
        <p class="admin-brand-title">WHUT Manage</p>
        <p class="admin-brand-subtitle">综合测评管理端</p>
      </div>

      <nav class="admin-menu">
        <button
          v-for="item in visibleMenus"
          :key="item.key"
          type="button"
          class="admin-menu-item"
          :class="{ 'is-active': activeMenuKey === item.key }"
          @click="navigateTo(item.path)"
        >
          {{ item.label }}
        </button>
      </nav>
    </aside>

    <div class="admin-main">
      <header class="admin-header">
        <div>
          <p v-if="breadcrumb.length > 0" class="admin-breadcrumb">{{ breadcrumb.join(' / ') }}</p>
          <h1 class="admin-page-title">{{ pageTitle }}</h1>
        </div>

        <div class="admin-user-panel">
          <span class="admin-user-name">{{ displayName }}</span>
          <button type="button" class="secondary-button" @click="handleLogout">退出登录</button>
        </div>
      </header>

      <main class="admin-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>
