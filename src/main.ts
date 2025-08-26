import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'

import '@/main.ts'
import App from '@/App.vue'
import 'vue3-toastify/dist/index.css'
import router from '@/router/index.ts'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(Vue3Toastify, {
  autoClose: 3000,
  position: 'top-right',
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'light',
} as ToastContainerOptions)
app.mount('#app')
