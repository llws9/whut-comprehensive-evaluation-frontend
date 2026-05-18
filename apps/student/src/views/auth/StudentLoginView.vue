<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, Eye, EyeOff, GraduationCap, Lock, User } from 'lucide-vue-next'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) {
    return
  }

  isLoading.value = true

  await new Promise((resolve) => setTimeout(resolve, 600))
  authStore.loginWithMockSession()

  const redirectPath =
    typeof route.query.redirect === 'string' && route.query.redirect.length > 0
      ? route.query.redirect
      : undefined

  isLoading.value = false
  await router.push(redirectPath ?? { name: 'StudentHome' })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-100 opacity-50 blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-100 opacity-50 blur-3xl"></div>
    </div>

    <div class="relative z-10 mx-4 w-full max-w-md animate-fade-in">
      <div class="card-shadow rounded-3xl bg-white p-8 shadow-xl">
        <div class="mb-8 text-center">
          <div class="bg-gradient-primary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl">
            <GraduationCap class="h-8 w-8 text-white" />
          </div>
          <h1 class="mb-2 text-2xl font-bold text-gray-800">学生综合测评系统</h1>
          <p class="text-gray-500">登录您的学生账号</p>
        </div>

        <form class="space-y-6" @submit.prevent="handleLogin">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">学号</label>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <User class="h-5 w-5 text-gray-400" />
              </div>
              <input
                v-model="username"
                type="text"
                placeholder="请输入学号"
                class="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">密码</label>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Lock class="h-5 w-5 text-gray-400" />
              </div>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-12 transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex items-center pr-4"
                @click="showPassword = !showPassword"
              >
                <Eye v-if="showPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600" />
                <EyeOff v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between text-sm">
            <label class="flex cursor-pointer items-center gap-2">
              <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span class="text-gray-500">记住我</span>
            </label>
            <a href="#" class="text-blue-600 hover:text-blue-700 hover:underline">忘记密码?</a>
          </div>

          <button
            type="submit"
            :disabled="isLoading || !username || !password"
            class="bg-gradient-primary flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white transition-all duration-300 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span v-if="isLoading" class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            <span>{{ isLoading ? '登录中...' : '登 录' }}</span>
            <ArrowRight v-if="!isLoading" class="h-5 w-5" />
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-500">
            还没有账号?
            <a href="#" class="font-medium text-blue-600 hover:text-blue-700">联系管理员</a>
          </p>
        </div>
      </div>

      <div class="mt-6 text-center text-sm text-gray-400">© 2024 武汉理工大学 综合测评系统</div>
    </div>
  </div>
</template>
