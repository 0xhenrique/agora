<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white border-b border-gray-200 px-4 py-3">
      <div class="max-w-4xl mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <router-link to="/" class="flex flex-row items-center text-xl font-semibold text-gray-900 hover:text-gray-700">
<svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M18 9V7.2C18 6.0799 18 5.51984 17.782 5.09202C17.5903 4.71569 17.2843 4.40973 16.908 4.21799C16.4802 4 15.9201 4 14.8 4H7.2C6.0799 4 5.51984 4 5.09202 4.21799C4.71569 4.40973 4.40973 4.71569 4.21799 5.09202C4 5.51984 4 6.0799 4 7.2V18L8 16M20 20L17.8062 18.5374C17.5065 18.3377 17.3567 18.2378 17.1946 18.167C17.0507 18.1042 16.9 18.0586 16.7454 18.031C16.5713 18 16.3912 18 16.0311 18H11.2C10.0799 18 9.51984 18 9.09202 17.782C8.71569 17.5903 8.40973 17.2843 8.21799 16.908C8 16.4802 8 15.9201 8 14.8V12.2C8 11.0799 8 10.5198 8.21799 10.092C8.40973 9.71569 8.71569 9.40973 9.09202 9.21799C9.51984 9 10.0799 9 11.2 9H16.8C17.9201 9 18.4802 9 18.908 9.21799C19.2843 9.40973 19.5903 9.71569 19.782 10.092C20 10.5198 20 11.0799 20 12.2V20Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
          </router-link>
          <router-link 
            to="/"
            class="text-gray-600 hover:text-blue-600"
            :class="{ 'text-blue-600': $route.name === 'Home' }"
          >
            Posts
          </router-link>
          <router-link 
            to="/submit"
            class="text-gray-600 hover:text-blue-600"
            :class="{ 'text-blue-600': $route.name === 'Submit' }"
          >
            New post
          </router-link>
        </div>
        <div class="flex items-center space-x-4">
          <span v-if="currentUser" class="text-gray-700">{{ currentUser.username }}</span>
          <button 
            v-if="!currentUser"
            @click="showLogin = true"
            class="text-blue-600 hover:text-blue-800"
          >
            Login
          </button>
          <button 
            v-else
            @click="logout"
            class="text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 py-6">
      <router-view />
    </main>

    <!-- Login Modal -->
    <div v-if="showLogin" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">{{ isRegistering ? 'Register' : 'Login' }}</h2>
        <form @submit.prevent="handleAuth">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input 
                v-model="authForm.username"
                type="text" 
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                v-model="authForm.password"
                type="password" 
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <div class="flex space-x-4">
              <button 
                type="submit" 
                class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                :disabled="isLoading"
              >
                {{ isLoading ? 'Loading...' : (isRegistering ? 'Register' : 'Login') }}
              </button>
              <button 
                type="button"
                @click="showLogin = false"
                class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
            <div class="text-center">
              <button 
                type="button"
                @click="isRegistering = !isRegistering"
                class="text-sm text-blue-600 hover:text-blue-800"
              >
                {{ isRegistering ? 'Already have an account? Login' : 'Need an account? Register' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Report Modal -->
    <div v-if="showReportModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Report Content</h2>
        <p class="text-gray-700 mb-6">Are you sure you want to report this {{ reportType }}?</p>
        <div class="flex space-x-4">
          <button 
            @click="confirmReport"
            class="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Report
          </button>
          <button 
            @click="cancelReport"
            class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Comment Preview Tooltip -->
    <div 
      v-if="hoveredComment" 
      class="fixed bg-white border border-gray-300 rounded-lg shadow-lg p-3 max-w-md z-50 pointer-events-none"
      :style="{ left: tooltipPosition.x + 'px', top: tooltipPosition.y + 'px' }"
    >
      <div class="text-sm">
        <div class="font-medium text-blue-600 mb-1">{{ hoveredComment.author }}</div>
        <div class="text-gray-700 whitespace-pre-wrap">{{ hoveredComment.body }}</div>
        <div class="text-xs text-gray-500 mt-1">{{ formatDate(hoveredComment.createdAt) }}</div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="fixed top-4 right-4 space-y-2 z-50">
      <div 
        v-for="toast in toasts"
        :key="toast.id"
        :class="{
          'bg-red-500': toast.type === 'error',
          'bg-green-500': toast.type === 'success',
          'bg-blue-500': toast.type === 'info'
        }"
        class="px-4 py-2 rounded text-white shadow-lg max-w-sm"
      >
        <div class="flex justify-between items-center">
          <span>{{ toast.message }}</span>
          <button @click="removeToast(toast.id)" class="ml-2 text-white hover:text-gray-200">
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiService, type User, type Post, type Comment } from './services/api'
import { useToast } from './services/toast'

const router = useRouter()
const { toasts, showError, showSuccess, removeToast } = useToast()

// Global state
const currentUser = ref<User | null>(null)
const showLogin = ref(false)
const isRegistering = ref(false)
const isLoading = ref(false)
const showReportModal = ref(false)
const reportType = ref<'post' | 'comment'>('post')
const reportItemId = ref<number | null>(null)
const hoveredComment = ref<Comment | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })

// Mock data for comments (for preview tooltip functionality)
const allComments = ref<Comment[]>([])

// Forms
const authForm = ref({
  username: '',
  password: ''
})

// Authentication methods
const handleAuth = async () => {
  isLoading.value = true
  try {
    const response = isRegistering.value 
      ? await apiService.register(authForm.value.username, authForm.value.password)
      : await apiService.login(authForm.value.username, authForm.value.password)
    
    localStorage.setItem('token', response.token)
    currentUser.value = response.user
    showLogin.value = false
    isRegistering.value = false
    authForm.value = { username: '', password: '' }
    showSuccess(response.message)
  } catch (error) {
    showError()
  } finally {
    isLoading.value = false
  }
}

const logout = () => {
  localStorage.removeItem('token')
  currentUser.value = null
  showSuccess('Logged out successfully')
}

const verifyAuth = async () => {
  const token = localStorage.getItem('token')
  if (!token) return

  try {
    const response = await apiService.verifyToken()
    currentUser.value = response.user
  } catch (error) {
    localStorage.removeItem('token')
    currentUser.value = null
  }
}

// Post and comment methods
const submitPost = async (postData: { title: string; url?: string; imageUrl?: string; body?: string }) => {
  if (!currentUser.value) {
    showLogin.value = true
    return
  }
  
  try {
    const response = await apiService.createPost(postData)
    showSuccess(response.message)
    router.push('/')
  } catch (error) {
    showError()
  }
}

const submitComment = async (postId: number, commentData: { body: string }) => {
  if (!currentUser.value) {
    showLogin.value = true
    return
  }
  
  try {
    const response = await apiService.createComment({
      postId,
      body: commentData.body
    })
    showSuccess(response.message)
    return response.comment
  } catch (error) {
    showError()
    throw error
  }
}

const vote = async (itemId: number, voteType: 'up' | 'down', itemType: 'post' | 'comment') => {
  if (!currentUser.value) {
    showLogin.value = true
    return
  }

  try {
    const response = await apiService.vote(itemId, itemType, voteType)
    return response
  } catch (error) {
    showError()
  }
}

// Utility methods
const showReport = (itemId: number, type: 'post' | 'comment') => {
  reportItemId.value = itemId
  reportType.value = type
  showReportModal.value = true
}

const confirmReport = () => {
  // TODO: Implement when API endpoint is ready
  showSuccess(`${reportType.value} reported successfully`)
  showReportModal.value = false
  reportItemId.value = null
}

const cancelReport = () => {
  showReportModal.value = false
  reportItemId.value = null
}

const showCommentPreview = (commentId: number, event: MouseEvent) => {
  const comment = allComments.value.find(c => c.id === commentId)
  if (comment) {
    hoveredComment.value = comment
    tooltipPosition.value = {
      x: event.clientX + 10,
      y: event.clientY - 10
    }
  }
}

const hideCommentPreview = () => {
  hoveredComment.value = null
}

const sharePost = async (postId: number) => {
  const url = `${window.location.origin}/post/${postId}`
  try {
    await navigator.clipboard.writeText(url)
    showSuccess('URL copied to clipboard')
  } catch (err) {
    showError('Failed to copy URL')
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  
  if (diffHours < 1) return 'just now'
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

// Initialize auth on mount
onMounted(() => {
  verifyAuth()
})

// Provide data to child components
provide('currentUser', currentUser)
provide('allComments', allComments)
provide('showLogin', showLogin)
provide('submitPost', submitPost)
provide('submitComment', submitComment)
provide('vote', vote)
provide('showReport', showReport)
provide('showCommentPreview', showCommentPreview)
provide('hideCommentPreview', hideCommentPreview)
provide('sharePost', sharePost)
provide('formatDate', formatDate)
provide('showError', showError)
provide('showSuccess', showSuccess)
</script>
