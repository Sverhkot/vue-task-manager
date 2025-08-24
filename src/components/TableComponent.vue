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
                <ChevronUpIcon v-if="sortKey === String(header.key) && sortOrder === 'asc'" class="icon active" />
                <ChevronDownIcon v-else-if="sortKey === String(header.key) && sortOrder === 'desc'" class="icon active" />
                <ChevronUpIcon v-else class="icon inactive" />
              </span>
            </div>
            <div 
              class="resizer"
              @mousedown.stop.prevent="startResize(index, $event)"
            ></div>
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
              v-else-if="String(header.key) === 'status' && tableType === 'tasks'"
              v-model="filters.status"
              name="status"
              @click.stop
            >
              <option value="" selected>All</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>

            </select>
            <select
              v-else-if="String(header.key) === 'status' && tableType === 'projects'"
              v-model="filters.status"
              name="status"
              @click.stop
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </th>
        </tr>
      </thead>

      <draggable
        v-model="draggableItems"
        tag="tbody"
        item-key="id"
        @end="onDragEnd"
      >
        <template #item="{ element: row }">
          <tr v-if="tableType === 'projects'">
            <td v-for="header in headersState" :key="String(header.key)" @click="goToProject(row.id)">
              {{ row[String(header.key)] }}
            </td>
          </tr>
          <tr v-else-if="tableType === 'tasks'">
            <td v-for="header in headersState" :key="String(header.key)">
              {{ row[String(header.key)] }}
            </td>
          </tr>
        </template>
      </draggable>
    </table>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
  import draggable from 'vuedraggable'
  import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/24/solid'
  import { useRouter } from 'vue-router'
  import type { Header, Model } from '@/types/types'

  const router = useRouter()

  function goToProject(id: number) {
    router.push(`/projects/${id}`)
  }

  const props = defineProps<{
    modelValue: Model[]
    headers: Header<Model>[]
    tableType: string
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: typeof props.modelValue): void
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
    assignee: ''
  })

  const headersState = reactive(
    props.headers.map(h => ({ ...h, width: h.width || 150 }))
  )

  const filteredItems = computed(() => {
    if (!props.modelValue || !Array.isArray(props.modelValue)) {
      return []
    }
    
    let result = [...props.modelValue]

    for (const key in filters.value) {
      const val = filters.value[key]
      if (val) {
        result = result.filter(item => {
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

        const aComparable = (valA as string | number)
        const bComparable = (valB as string | number)

        if (aComparable < bComparable) return sortOrder.value === 'asc' ? -1 : 1
        if (aComparable > bComparable) return sortOrder.value === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  })

  const draggableItems = computed({
    get() { return filteredItems.value },
    set(newItems) { emit('update:modelValue', newItems) }
  })

  function sortBy(key: string) {
    if (sortKey.value === key) sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    else {
      sortKey.value = key
      sortOrder.value = 'asc'
    }
  }

  const onDragEnd = () => { sortKey.value = ''}

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

  onMounted(() => {
    document.addEventListener('mousemove', doResize)
    document.addEventListener('mouseup', stopResize)
    document.addEventListener('mouseleave', stopResize)
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

  th, td {
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

  input, select {
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
}
</style>