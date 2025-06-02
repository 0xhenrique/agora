// src/services/toast.ts
import { ref } from 'vue'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
  duration: number
}

const toasts = ref<Toast[]>([])
let toastIdCounter = 0

export function useToast() {
  const showToast = (
    message: string, 
    type: 'success' | 'error' | 'info' = 'info', 
    duration = 3000
  ) => {
    const toast: Toast = {
      id: ++toastIdCounter,
      message,
      type,
      duration,
    }
    
    toasts.value.push(toast)
    
    setTimeout(() => {
      removeToast(toast.id)
    }, duration)
  }

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const showError = (message = 'Request was not successful') => {
    showToast(message, 'error')
  }

  const showSuccess = (message: string) => {
    showToast(message, 'success')
  }

  return {
    toasts,
    showToast,
    showError,
    showSuccess,
    removeToast,
  }
}
