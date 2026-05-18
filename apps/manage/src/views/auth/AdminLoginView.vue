<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const canSubmit = computed(() => username.value.trim().length > 0 && password.value.trim().length > 0)

const handleLogin = async () => {
  if (!canSubmit.value || isLoading.value) {
    return
  }

  isLoading.value = true
  authStore.loginWithMockSession()

  const redirectPath =
    typeof route.query.redirect === 'string' && route.query.redirect.length > 0
      ? route.query.redirect
      : undefined

  window.setTimeout(() => {
    isLoading.value = false
    void router.push(redirectPath ?? { name: 'AdminDashboard' })
  }, 600)
}
</script>

<template>
  <section class="login-page">
    <div class="login-background" aria-hidden="true">
      <span class="login-orb login-orb-primary"></span>
      <span class="login-orb login-orb-secondary"></span>
    </div>

    <div class="login-card">
      <p class="placeholder-meta">/admin/login</p>
      <div class="login-brand">
        <div class="login-brand-badge">WHUT</div>
        <div>
          <h1 class="auth-title">综合测评管理系统</h1>
          <p class="auth-subtitle">管理员登录</p>
        </div>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <label class="form-field">
          <span class="field-label">用户名</span>
          <input
            v-model="username"
            type="text"
            class="field-input"
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </label>

        <label class="form-field">
          <span class="field-label">密码</span>
          <div class="field-inline">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="field-input"
              placeholder="请输入密码"
              autocomplete="current-password"
            />
            <button type="button" class="inline-action-button" @click="showPassword = !showPassword">
              {{ showPassword ? '隐藏' : '显示' }}
            </button>
          </div>
        </label>

        <div class="login-options">
          <label class="checkbox-field">
            <input type="checkbox" />
            <span>记住我</span>
          </label>
          <button type="button" class="text-button">忘记密码？</button>
        </div>

        <div class="auth-actions">
          <button type="submit" class="primary-button" :disabled="!canSubmit || isLoading">
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
          <button type="button" class="secondary-button" @click="router.push({ name: 'NotFound' })">
            查看异常页
          </button>
        </div>
      </form>

      <p class="login-footnote">还没有账号？请联系超级管理员分配权限。</p>
    </div>
  </section>
</template>
