<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section>
    <p class="placeholder-meta">/404</p>
    <h1 class="blank-title">404</h1>
    <p class="blank-subtitle">请求的学生端页面不存在，未匹配路由已统一收口到异常页。</p>
    <div class="blank-actions">
      <RouterLink class="primary-button" :to="{ name: 'StudentLogin' }">返回登录页</RouterLink>
    </div>
  </section>
</template>
