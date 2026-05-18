<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section>
    <p class="placeholder-meta">/403</p>
    <h1 class="blank-title">403</h1>
    <p class="blank-subtitle">你没有权限访问这个页面。</p>
    <div class="blank-actions">
      <RouterLink class="primary-button" :to="{ name: 'AdminLogin' }">返回登录页</RouterLink>
    </div>
  </section>
</template>
