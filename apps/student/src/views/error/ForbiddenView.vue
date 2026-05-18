<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section>
    <p class="placeholder-meta">/403</p>
    <h1 class="blank-title">403</h1>
    <p class="blank-subtitle">当前身份没有访问此页面的权限，后续会由学生端鉴权守卫统一拦截。</p>
    <div class="blank-actions">
      <RouterLink class="primary-button" :to="{ name: 'StudentLogin' }">返回登录页</RouterLink>
    </div>
  </section>
</template>
