<template>
  <div class="projects-table">
    <table ref="tableRef">
      <thead>
        <tr>
          <th
            v-for="(header, index) in headersState"
            :key="String(header.key)"
            :style="{ width: header.width + 'px', minWidth: header.minWidth + 'px' }"
          >
            <div class="header-content" @click="sortBy(String(header.key))">
              {{ header.title }}
              <span v-if="header.sortable">
                <ChevronUpIcon
                  v-if="sortKey === String(header.key) && sortOrder === 'asc'"
                  class="icon active"
                />
                <ChevronDownIcon
                  v-else-if="sortKey === String(header.key) && sortOrder === 'desc'"
                  class="icon active"
                />
                <ChevronUpIcon v-else class="icon inactive" />
              </span>
            </div>
            <div class="resizer" @mousedown.stop.prevent="startResize(index, $event)"></div>
          </th>
        </tr>
        <tr>
          <th v-for="header in headersState" :key="String(header.key)">
            <input
              v-if="['name', 'assignee'].includes(String(header.key))"
              type="text"
              v-model="filters[String(header.key)]"
              :placeholder="`Search by ${String(header.key)}`"
              @click.stop
            />
            <select
              v-else-if="String(header.key) === 'status'"
              v-model="filters.status"
              name="status"
              @click.stop
            >
              <option value="">All</option>
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </th>
        </tr>
      </thead>

      <draggable v-model="draggableItems" tag="tbody" item-key="id" @end="onDragEnd">
        <template #item="{ element: row }">
          <tr v-if="tableType === 'projects'">
            <td v-for="header in headersState" :key="String(header.key)">
              <div v-if="header.key === 'actions'" class="action-buttons">
                <button
                  @click.stop="$emit('edit-project', row)"
                  class="btn-action btn-edit"
                  title="Edit Project"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button
                  @click.stop="$emit('delete-project', row)"
                  class="btn-action btn-delete"
                  title="Delete Project"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path
                      d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"
                    ></path>
                  </svg>
                </button>
              </div>
              <div v-else @click="goToProject(row.id)" class="clickable-cell">
                <span v-if="header.key === 'createdAt'">
                  {{ formatDate(row[String(header.key)]) }}
                </span>
                <span v-else-if="header.key === 'status'">
                  {{ getStatusLabel(row[String(header.key)]) }}
                </span>
                <span v-else>
                  {{ row[String(header.key)] }}
                </span>
              </div>
            </td>
          </tr>
          <tr v-else-if="tableType === 'tasks'">
            <td v-for="header in headersState" :key="String(header.key)">
              <div v-if="header.key === 'actions'" class="action-buttons">
                <button
                  @click.stop="$emit('edit-task', row)"
                  class="btn-action btn-edit"
                  title="Edit Task"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button
                  @click.stop="$emit('delete-task', row)"
                  class="btn-action btn-delete"
                  title="Delete Task"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path
                      d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"
                    ></path>
                  </svg>
                </button>
              </div>
              <span v-else-if="header.key === 'dueDate' || header.key === 'createdAt'">
                {{ formatDate(row[String(header.key)]) }}
              </span>
              <span v-else-if="header.key === 'status'">
                {{ getStatusLabel(row[String(header.key)]) }}
              </span>
              <span v-else>
                {{ row[String(header.key)] }}
              </span>
            </td>
          </tr>
        </template>
      </draggable>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, reactive, onMounted, onUnmounted } from 'vue'
import draggable from 'vuedraggable'
import { useRouter } from 'vue-router'

import {
  type Task,
  type Model,
  type Header,
  type Project,
  TaskStatus,
  ProjectStatus,
} from '@/types/types'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/24/solid'

const router = useRouter()

function goToProject(id: number) {
  router.push(`/projects/${id}`)
}

interface StatusOption {
  value: string
  label: string
}

const props = defineProps<{
  modelValue: Model[]
  headers: Header<Model>[]
  tableType: 'projects' | 'tasks'
  statusOptions?: StatusOption[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: typeof props.modelValue): void
  (e: 'edit-project', project: Project): void
  (e: 'delete-project', project: Project): void
  (e: 'edit-task', task: Task): void
  (e: 'delete-task', task: Task): void
}>()

const activeResizerIndex = ref<number | null>(null)
const startX = ref(0)
const startWidth = ref(0)
const isResizing = ref(false)
const tableRef = ref<HTMLTableElement | null>(null)

const sortKey = ref<string>('')
const sortOrder = ref<'asc' | 'desc'>('asc')

const filters = ref<Record<string, string>>({
  status: '',
  name: '',
  assignee: '',
})

const getStorageKey = () => `table-filters-${props.tableType}`

const saveFiltersToStorage = () => {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(filters.value))
  } catch (error) {
    console.error('Error saving filters to localStorage:', error)
  }
}

const loadFiltersFromStorage = () => {
  try {
    const stored = localStorage.getItem(getStorageKey())
    if (stored) {
      const parsedFilters = JSON.parse(stored)
      Object.keys(filters.value).forEach((key) => {
        if (parsedFilters[key] !== undefined) {
          filters.value[key] = parsedFilters[key]
        }
      })
    }
  } catch (error) {
    console.error('Error loading filters from localStorage:', error)
  }
}

const headersState = reactive(props.headers.map((h) => ({ ...h, width: h.width || 150 })))

const statusOptions = computed(() => {
  if (props.statusOptions) {
    return props.statusOptions
  }

  if (props.tableType === 'tasks') {
    return [
      { value: TaskStatus.TODO, label: 'To Do' },
      { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
      { value: TaskStatus.DONE, label: 'Done' },
    ]
  } else if (props.tableType === 'projects') {
    return [
      { value: ProjectStatus.ACTIVE, label: 'Active' },
      { value: ProjectStatus.ARCHIVED, label: 'Archived' },
    ]
  }
  return []
})

const getStatusLabel = (statusValue: string) => {
  const option = statusOptions.value.find((opt) => opt.value === statusValue)
  return option ? option.label : statusValue
}

const filteredItems = computed(() => {
  if (!props.modelValue || !Array.isArray(props.modelValue)) {
    return []
  }

  let result = [...props.modelValue]

  for (const key in filters.value) {
    const val = filters.value[key]
    if (val) {
      result = result.filter((item) => {
        const itemVal = item[key]
        if (itemVal == null) return false
        return String(itemVal).toLowerCase().includes(val.toLowerCase())
      })
    }
  }

  if (sortKey.value) {
    result.sort((a, b) => {
      const valA = a[sortKey.value as keyof typeof a]
      const valB = b[sortKey.value as keyof typeof b]

      const aComparable = valA as string | number
      const bComparable = valB as string | number

      if (aComparable < bComparable) return sortOrder.value === 'asc' ? -1 : 1
      if (aComparable > bComparable) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return result
})

const draggableItems = computed({
  get() {
    return filteredItems.value
  },
  set(newItems) {
    emit('update:modelValue', newItems)
  },
})

function sortBy(key: string) {
  if (sortKey.value === key) sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const onDragEnd = () => {
  sortKey.value = ''
}

const startResize = (index: number, event: MouseEvent) => {
  activeResizerIndex.value = index
  startX.value = event.clientX
  startWidth.value = headersState[index].width || 150
  isResizing.value = true

  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const doResize = (event: MouseEvent) => {
  if (!isResizing.value || activeResizerIndex.value === null) return
  event.preventDefault()
  const deltaX = event.clientX - startX.value
  const index = activeResizerIndex.value
  const minWidth = headersState[index].minWidth || 50
  headersState[index].width = Math.max(minWidth, startWidth.value + deltaX)
}

const stopResize = () => {
  if (isResizing.value) {
    isResizing.value = false
    activeResizerIndex.value = null
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return ''

  const date = new Date(dateString)

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

watch(filters, saveFiltersToStorage, { deep: true })

onMounted(() => {
  document.addEventListener('mousemove', doResize)
  document.addEventListener('mouseup', stopResize)
  document.addEventListener('mouseleave', stopResize)

  loadFiltersFromStorage()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', doResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('mouseleave', stopResize)
})
</script>

<style scoped lang="scss">
.projects-table {
  overflow-x: auto;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);

  table {
    width: 100%;
    min-width: fit-content;
    border-collapse: collapse;
    table-layout: fixed;
  }

  th,
  td {
    padding: 10px 14px;
    border: 0.5px solid #e2e8f0;
    text-align: left;
    word-wrap: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    box-sizing: border-box;
    position: relative;
  }

  th {
    background-color: #f8fafc;
    font-weight: 600;
    color: #475569;
    cursor: pointer;
    user-select: none;

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  tbody tr:hover {
    background-color: #f1f5f9;
  }

  input,
  select {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
    }
  }

  .icon {
    width: 16px;
    height: 16px;
    display: inline-block;
    margin-left: 8px;
    vertical-align: middle;
    flex-shrink: 0;
  }

  .icon.active {
    color: #1e293b;
  }

  .icon.inactive {
    color: #94a3b8;
    opacity: 0.5;
  }

  .resizer {
    position: absolute;
    top: 0;
    right: 0;
    width: 6px;
    height: 100%;
    cursor: col-resize;
    z-index: 10;
    background: transparent;

    &:hover {
      background: rgba(59, 130, 246, 0.3);
    }
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  .btn-action {
    padding: 6px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.1);
    }
  }

  .btn-edit {
    background-color: #f0f9ff;
    color: #0369a1;

    &:hover {
      background-color: #e0f2fe;
      color: #0c4a6e;
    }
  }

  .btn-delete {
    background-color: #fef2f2;
    color: #dc2626;

    &:hover {
      background-color: #fee2e2;
      color: #b91c1c;
    }
  }

  .clickable-cell {
    cursor: pointer;
  }
}
</style>
