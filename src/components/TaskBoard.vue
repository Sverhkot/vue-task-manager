<template>
  <div class="task-board">
    <div class="board-columns">
      <div
        v-for="status in taskStatuses"
        :key="status.value"
        class="board-column"
      >
        <div class="column-header">
          <h3 class="column-title">{{ status.label }}</h3>
          <span class="task-count">{{ getTasksByStatus(status.value).length }}</span>
        </div>
        
        <draggable
          :list="getTasksByStatus(status.value)"
          :group="{ name: 'tasks', pull: true, put: true }"
          :animation="200"
          ghost-class="task-ghost"
          chosen-class="task-chosen"
          drag-class="task-drag"
          class="task-list"
          item-key="id"
          @change="(event: any) => handleTaskMove(event, status.value)"
        >
          <template #item="{ element: task }">
            <div class="task-card" @click="$emit('task-click', task)">
              <div class="task-header">
                <h4 class="task-name">{{ task.name }}</h4>
                <div class="task-actions">
                  <button
                    class="task-action-btn"
                    @click.stop="$emit('edit-task', task)"
                    title="Edit task"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    class="task-action-btn delete"
                    @click.stop="$emit('delete-task', task)"
                    title="Delete task"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3,6 5,6 21,6"></polyline>
                      <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="task-meta">
                <div class="task-assignee">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  {{ task.assignee }}
                </div>
                
                <div class="task-due-date" :class="{ overdue: isOverdue(task.dueDate) }">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  {{ formatDate(task.dueDate) }}
                </div>
              </div>
            </div>
          </template>
        </draggable>
        
        <div v-if="getTasksByStatus(status.value).length === 0" class="empty-column">
          <p>No tasks</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'

import { TaskStatus, type Task } from '../types/types'

interface Props {
  tasks: Task[]
}

interface Emits {
  (e: 'task-move', payload: { taskId: string; newStatus: TaskStatus; newIndex: string }): void
  (e: 'task-click', task: Task): void
  (e: 'edit-task', task: Task): void
  (e: 'delete-task', task: Task): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const taskStatuses = [
  { value: TaskStatus.TODO, label: 'To Do' },
  { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
  { value: TaskStatus.DONE, label: 'Done' }
]

function getTasksByStatus(status: TaskStatus): Task[] {
  return props.tasks.filter(task => task.status === status)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleTaskMove(event: any, status: TaskStatus) {
  if (event.added) {
    const task = event.added.element
    emit('task-move', {
      taskId: task.id,
      newStatus: status,
      newIndex: event.added.newIndex
    })
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
}

function isOverdue(dateString: string) {
  const dueDate = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return dueDate < today
}
</script>

<style lang="scss" scoped>
.task-board {
  height: 100%;
  overflow: hidden;
}

.board-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  height: 100%;
  padding: 1rem;
}

.board-column {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.column-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #334155;
}

.task-count {
  background: #64748b;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  min-width: 1.5rem;
  text-align: center;
}

.task-list {
  flex: 1;
  overflow-y: auto;
  min-height: 200px;
}

.task-card {
  background: white;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
}

.task-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.task-name {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
  flex: 1;
  margin-right: 0.5rem;
}

.task-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.task-card:hover .task-actions {
  opacity: 1;
}

.task-action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f1f5f9;
    color: #334155;
  }
  
  &.delete:hover {
    background: #fef2f2;
    color: #dc2626;
  }
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.task-assignee,
.task-due-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #64748b;
}

.task-due-date.overdue {
  color: #dc2626;
}

.empty-column {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #94a3b8;
  font-style: italic;
}

.task-ghost {
  opacity: 0.5;
  background: #3b82f6;
  color: white;
}

.task-chosen {
  transform: rotate(5deg);
}

.task-drag {
  transform: rotate(5deg);
  opacity: 0.8;
}

.board-column:nth-child(1) {
  .column-header {
    border-bottom-color: #f59e0b;
  }
  .task-count {
    background: #f59e0b;
  }
}

.board-column:nth-child(2) {
  .column-header {
    border-bottom-color: #3b82f6;
  }
  .task-count {
    background: #3b82f6;
  }
}

.board-column:nth-child(3) {
  .column-header {
    border-bottom-color: #10b981;
  }
  .task-count {
    background: #10b981;
  }
}
</style>
