<template>
  <button class="btn btn-primary" @click="$emit('create-project')">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    Add
  </button>
</template>

<script setup lang="ts">
  defineEmits<{
    (e: 'create-project'): void
  }>()
</script>

<style lang="scss" scoped>
.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  margin-top: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.btn-primary {
  background: #3b82f6;
  color: white;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
}
</style>