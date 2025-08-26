declare module 'vue3-toastify' {
  import type { Plugin } from 'vue'

  export type ToastPosition =
    | 'top-left'
    | 'top-right'
    | 'top-center'
    | 'bottom-left'
    | 'bottom-right'
    | 'bottom-center'

  export type ToastTheme = 'light' | 'dark' | 'colored'

  export type ToastTransition = 'bounce' | 'slide' | 'zoom' | 'flip'

  export interface ToastContainerOptions {
    autoClose?: number | false
    position?: ToastPosition
    hideProgressBar?: boolean
    newestOnTop?: boolean
    closeOnClick?: boolean
    rtl?: boolean
    pauseOnFocusLoss?: boolean
    draggable?: boolean
    pauseOnHover?: boolean
    draggablePercent?: number
    theme?: ToastTheme
    transition?: ToastTransition
    limit?: number
  }

  export interface ToastOptions extends Partial<ToastContainerOptions> {
    type?: 'info' | 'success' | 'warning' | 'error' | 'default'
  }

  export interface Toast {
    (message: string | HTMLElement, options?: ToastOptions): void
    success(message: string | HTMLElement, options?: ToastOptions): void
    info(message: string | HTMLElement, options?: ToastOptions): void
    error(message: string | HTMLElement, options?: ToastOptions): void
    warning(message: string | HTMLElement, options?: ToastOptions): void
    dark(message: string | HTMLElement, options?: ToastOptions): void
    dismiss(id?: string | number): void
    isActive(id: string | number): boolean
  }

  export const toast: Toast

  const Vue3Toastify: Plugin
  export default Vue3Toastify
}
