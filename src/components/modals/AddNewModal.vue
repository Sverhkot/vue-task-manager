<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" :class="sizeClass" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button class="modal-close" @click="$emit('close')" aria-label="Close modal">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
          <div class="modal-footer" v-if="$slots.footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

interface Props {
  show: boolean
  title: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnOverlay?: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closeOnOverlay: true,
})

const emit = defineEmits<Emits>()

const sizeClass = computed(() => `modal-${props.size}`)

function handleOverlayClick() {
  if (props.closeOnOverlay) {
    emit('close')
  }
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.show) {
    emit('close')
  }
}

watch(
  () => props.show,
  (show) => {
    if (show) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }
)
</script>

<style lang="scss" scoped>
.modal-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
}

.modal-container {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  background: white;
  border-radius: 8px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);

  &.modal-sm {
    width: 100%;
    max-width: 400px;
  }

  &.modal-md {
    width: 100%;
    max-width: 500px;
  }

  &.modal-lg {
    width: 100%;
    max-width: 700px;
  }

  &.modal-xl {
    width: 100%;
    max-width: 900px;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #6b7280;
  border-radius: 4px;

  &:hover {
    color: #374151;
    background: #f3f4f6;
  }
}

.modal-body {
  box-sizing: border-box;
  max-width: 95%;
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(-20px);
}
</style>
