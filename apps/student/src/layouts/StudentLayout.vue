<script setup lang="ts">
import { studentMenus } from '@whut/shared'
import { computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const visibleMenus = computed(() =>
  studentMenus.filter((item) => authStore.hasPermission(item.permissionCode))
)

const activeMenuKey = computed(() => String(route.meta.menuKey ?? ''))
const pageTitle = computed(() => String(route.meta.title ?? '学生端'))
const breadcrumb = computed(() => (Array.isArray(route.meta.breadcrumb) ? route.meta.breadcrumb : []))
const layoutKind = computed(() => String(route.meta.layout ?? 'student'))
const displayName = computed(() => authStore.session?.userName ?? '未登录用户')

const navigateTo = async (path: string) => {
  if (route.path !== path) {
    await router.push(path)
  }
}

const handleLogout = async () => {
  authStore.logout()
  await router.push({ name: 'StudentLogin' })
}
</script>

<template>
  <div class="student-shell" :data-layout="layoutKind">
    <header class="student-header">
      <div>
        <p class="student-brand">WHUT Student</p>
        <p v-if="breadcrumb.length > 0" class="student-breadcrumb">{{ breadcrumb.join(' / ') }}</p>
        <h1 class="student-page-title">{{ pageTitle }}</h1>
      </div>

      <div class="student-user-panel">
        <span class="student-user-name">{{ displayName }}</span>
        <button type="button" class="secondary-button" @click="handleLogout">退出登录</button>
      </div>
    </header>

    <nav class="student-nav">
      <button
        v-for="item in visibleMenus"
        :key="item.key"
        type="button"
        class="student-nav-item"
        :class="{ 'is-active': activeMenuKey === item.key }"
        @click="navigateTo(item.path)"
      >
        {{ item.label }}
      </button>
    </nav>

    <main class="student-content">
      <RouterView />
    </main>
  </div>
</template>
