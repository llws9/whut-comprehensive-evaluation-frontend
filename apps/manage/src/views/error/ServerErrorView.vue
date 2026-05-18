<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section>
    <p class="placeholder-meta">/500</p>
    <h1 class="blank-title">500</h1>
    <p class="blank-subtitle">这里是服务异常占位页，后续可接入统一错误处理。</p>
    <div class="blank-actions">
      <RouterLink class="primary-button" :to="{ name: 'AdminLogin' }">返回登录页</RouterLink>
    </div>
  </section>
</template>
