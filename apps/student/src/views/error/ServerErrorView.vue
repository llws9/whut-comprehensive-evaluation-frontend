<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section>
    <p class="placeholder-meta">/500</p>
    <h1 class="blank-title">500</h1>
    <p class="blank-subtitle">服务暂时不可用，后续会由统一错误处理与接口层接住异常状态。</p>
    <div class="blank-actions">
      <RouterLink class="primary-button" :to="{ name: 'StudentHome' }">返回首页</RouterLink>
    </div>
  </section>
</template>
