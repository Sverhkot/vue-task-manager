<template>
  <div class="projects-table">
    <table ref="tableRef">
      <thead>
        <tr>
          <th
            v-for="(header, index) in headers"
            :key="header.key"
            :style="{ width: header.width + 'px', minWidth: header.minWidth + 'px' }"
            @click="sortBy(header.key)"
          >
            <div 
              v-if="index > 0"
              class="resizer left-resizer" 
              @mousedown.stop.prevent="startResize(index - 1, $event)"
              :class="{ 'resizing': activeResizerIndex === index - 1 }"
            ></div>
            
            <div class="header-content">
              {{ header.title }}
              <span v-if="header.sortable">
                <ChevronUpIcon v-if="sortKey === header.key && sortOrder === 'asc'" class="icon active" />
                <ChevronDownIcon v-else-if="sortKey === header.key && sortOrder === 'desc'" class="icon active" />
                <ChevronUpIcon v-else class="icon inactive" />
              </span>
            </div>
            
            <div 
              v-if="index === headers.length - 1"
              class="resizer right-resizer" 
              @mousedown.stop.prevent="startResize(index, $event)"
              :class="{ 'resizing': activeResizerIndex === index }"
            ></div>
          </th>
        </tr>
        <tr>
          <th :style="{ width: headers[0].width + 'px', minWidth: headers[0].minWidth + 'px' }"></th>
          <th :style="{ width: headers[1].width + 'px', minWidth: headers[1].minWidth + 'px' }">
            <input
              type="text"
              v-model="filters.name"
              placeholder="Search by name..."
              @click.stop
            />
          </th>
          <th :style="{ width: headers[2].width + 'px', minWidth: headers[2].minWidth + 'px' }"></th>
          <th :style="{ width: headers[3].width + 'px', minWidth: headers[3].minWidth + 'px' }">
            <select v-model="filters.status" @click.stop>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </th>
          <th :style="{ width: headers[4].width + 'px', minWidth: headers[4].minWidth + 'px' }"></th>
        </tr>
      </thead>
      <draggable
        v-model="draggableProjects"
        tag="tbody"
        item-key="id"
        @end="onDragEnd"
      >
        <template #item="{ element: project }">
          <tr @click="goToProject(project.id)">
            <td :style="{ width: headers[0].width + 'px', minWidth: headers[0].minWidth + 'px' }">{{ project.id }}</td>
            <td :style="{ width: headers[1].width + 'px', minWidth: headers[1].minWidth + 'px' }">{{ project.name }}</td>
            <td :style="{ width: headers[2].width + 'px', minWidth: headers[2].minWidth + 'px' }">{{ project.tasksCount }}</td>
            <td :style="{ width: headers[3].width + 'px', minWidth: headers[3].minWidth + 'px' }">{{ project.status }}</td>
            <td :style="{ width: headers[4].width + 'px', minWidth: headers[4].minWidth + 'px' }">{{ project.createdAt }}</td>
          </tr>
        </template>
      </draggable>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/24/solid'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import draggable from 'vuedraggable'

interface Project {
  id: number
  name: string
  tasksCount: number
  status: 'active' | 'archived'
  createdAt: string
}

type ProjectKey = keyof Project;

interface Header {
  key: ProjectKey
  title: string
  width: number
  minWidth: number
  sortable: boolean
}

const projects = ref<Project[]>([
  { id: 1, name: 'Frontend app', tasksCount: 5, status: 'active', createdAt: '2025-01-10' },
  { id: 2, name: 'Backend API', tasksCount: 8, status: 'archived', createdAt: '2025-02-02' },
  { id: 3, name: 'Mobile app', tasksCount: 2, status: 'active', createdAt: '2025-03-01' },
  { id: 4, name: 'Design System', tasksCount: 12, status: 'active', createdAt: '2024-12-15' },
  { id: 5, name: 'E-commerce Platform', tasksCount: 25, status: 'archived', createdAt: '2024-11-20' },
])

const headers = ref<Header[]>([
  { key: 'id', title: 'ID', width: 80, minWidth: 60, sortable: true },
  { key: 'name', title: 'Name', width: 200, minWidth: 120, sortable: true },
  { key: 'tasksCount', title: 'Tasks', width: 100, minWidth: 80, sortable: true },
  { key: 'status', title: 'Status', width: 120, minWidth: 100, sortable: true },
  { key: 'createdAt', title: 'Created At', width: 150, minWidth: 120, sortable: true },
]);

const filters = ref({
  name: '',
  status: ''
})

const sortKey = ref<ProjectKey | null>('id')
const sortOrder = ref<'asc' | 'desc'>('asc')

const router = useRouter()

const tableRef = ref<HTMLTableElement | null>(null);
const activeResizerIndex = ref<number | null>(null);
const startX = ref(0);
const startWidth = ref(0);
const isResizing = ref(false);

const startResize = (index: number, event: MouseEvent) => {
  activeResizerIndex.value = index;
  startX.value = event.clientX;
  startWidth.value = headers.value[index].width;
  isResizing.value = true;
  
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
};

const doResize = (event: MouseEvent) => {
  if (activeResizerIndex.value === null || !isResizing.value) return;
  
  event.preventDefault();
  const deltaX = event.clientX - startX.value;
  const newWidth = startWidth.value + deltaX;
  
  const minWidth = headers.value[activeResizerIndex.value].minWidth;
  const maxWidth = 800;
  
  headers.value[activeResizerIndex.value].width = Math.min(Math.max(minWidth, newWidth), maxWidth);
};

const stopResize = () => {
  if (isResizing.value) {
    activeResizerIndex.value = null;
    isResizing.value = false;

    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
};

onMounted(() => {
  document.addEventListener('mousemove', doResize);
  document.addEventListener('mouseup', stopResize);
  document.addEventListener('mouseleave', stopResize);
});

onUnmounted(() => {
  document.removeEventListener('mousemove', doResize);
  document.removeEventListener('mouseup', stopResize);
  document.removeEventListener('mouseleave', stopResize);
});

function sortBy(key: ProjectKey) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const filteredProjects = computed(() => {
  let result = [...projects.value]

  if (filters.value.name) {
    result = result.filter(p =>
      p.name.toLowerCase().includes(filters.value.name.toLowerCase())
    )
  }
  if (filters.value.status) {
    result = result.filter(p => p.status === filters.value.status)
  }

  if (sortKey.value) {
    const key = sortKey.value;
    result.sort((a, b) => {
      const valA = a[key]
      const valB = b[key]
      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return result
})

const draggableProjects = computed({
  get() {
    return filteredProjects.value;
  },
  set(reorderedItems: Project[]) {
    const reorderedIds = reorderedItems.map(p => p.id);
    const originalProjectsCopy = [...projects.value];
    const otherItems = originalProjectsCopy.filter(p => !reorderedIds.includes(p.id));
    const newProjects = reorderedItems.concat(otherItems);
    projects.value = newProjects;
  }
});

const onDragEnd = () => {
  sortKey.value = null;
}

function goToProject(id: number) {
  router.push(`/projects/${id}`)
}
</script>

<style scoped lang="scss">
.projects-table {
  overflow-x: auto;

  table {
    width: 100%;
    min-width: fit-content;
    border-collapse: collapse;
    table-layout: fixed;
  }

  th, td {
    padding: 10px 14px;
    border: 1px solid #e2e8f0;
    text-align: left;
    word-wrap: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    box-sizing: border-box;
  }

  th {
    background-color: #f8fafc;
    font-weight: 600;
    color: #475569;
    cursor: pointer;
    user-select: none;
    position: relative;
    
    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
    }
  }

  tr {
    transition: background-color 0.2s ease;
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
    width: 6px;
    height: 100%;
    cursor: col-resize;
    z-index: 10;
    background: transparent;

    &:hover {
      background: rgba(59, 130, 246, 0.3);
    }
    
    &.resizing {
      background: rgba(59, 130, 246, 0.5);
    }
  }

  .left-resizer {
    left: -3px;
  }

  .right-resizer {
    right: -3px;
  }

  &.resizing {
    user-select: none;
  }
}
</style>