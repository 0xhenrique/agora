<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white border-b border-gray-200 px-4 py-3">
      <div class="max-w-4xl mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <router-link to="/" class="text-xl font-semibold text-gray-900 hover:text-gray-700">
            Political Forum
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
            Submit
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
        <h2 class="text-xl font-semibold mb-4">Login / Register</h2>
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
              <button type="submit" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Login/Register
              </button>
              <button 
                type="button"
                @click="showLogin = false"
                class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
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
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import { useRouter } from 'vue-router'

// Types
interface User {
  id: number
  username: string
}

interface Post {
  id: number
  title: string
  url?: string
  imageUrl?: string
  body?: string
  author: string
  createdAt: Date
  votes: number
  commentCount: number
}

interface Comment {
  id: number
  postId: number
  author: string
  body: string
  replyToId?: number
  createdAt: Date
  votes: number
}

interface Vote {
  itemId: number
  itemType: 'post' | 'comment'
  type: 'up' | 'down'
  userId: number
}

// Global state
const currentUser = ref<User | null>(null)
const showLogin = ref(false)
const showReportModal = ref(false)
const reportType = ref<'post' | 'comment'>('post')
const reportItemId = ref<number | null>(null)
const hoveredComment = ref<Comment | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })

const router = useRouter()

// Forms
const authForm = ref({
  username: '',
  password: ''
})

// Mock data
const users = ref<User[]>([
  { id: 1, username: 'testuser1' },
  { id: 2, username: 'testuser2' },
  { id: 3, username: 'testuser3' }
])

const posts = ref<Post[]>([
  {
    id: 1,
    title: 'Test Post About Current Politics',
    body: 'This is a test post discussing current political events. What do you think about the recent developments?',
    author: 'testuser1',
    createdAt: new Date('2025-06-01'),
    votes: 5,
    commentCount: 3
  },
  {
    id: 2,
    title: 'Link to Political Article',
    url: 'https://example.com/political-article',
    body: 'Found this interesting article, thoughts?',
    author: 'testuser2',
    createdAt: new Date('2025-06-01'),
    votes: 12,
    commentCount: 7
  },
  {
    id: 3,
    title: 'Image Post Example',
    imageUrl: 'https://www.purina.co.uk/sites/default/files/styles/square_medium_440x440/public/2022-06/Sphynx.1.jpg?h=ee36b89e&itok=2fNViXNl',
    body: 'Check out this political cartoon',
    author: 'testuser3',
    createdAt: new Date('2025-06-02'),
    votes: -2,
    commentCount: 15
  }
])

const comments = ref<Comment[]>([
  {
    id: 1,
    postId: 1,
    author: 'testuser2',
    body: 'I agree with your perspective on this issue.',
    createdAt: new Date('2025-06-01'),
    votes: 3
  },
  {
    id: 2,
    postId: 1,
    author: 'testuser3',
    body: 'Actually, I think you\'re missing an important point here.',
    replyToId: 1,
    createdAt: new Date('2025-06-01'),
    votes: 1
  },
  {
    id: 3,
    postId: 1,
    author: 'testuser1',
    body: 'Thanks for the discussion, both of you make valid points.',
    createdAt: new Date('2025-06-02'),
    votes: 2
  }
])

const votes = ref<Vote[]>([])

// Methods
const handleAuth = () => {
  let user = users.value.find(u => u.username === authForm.value.username)
  if (!user) {
    user = {
      id: users.value.length + 1,
      username: authForm.value.username
    }
    users.value.push(user)
  }
  currentUser.value = user
  showLogin.value = false
  authForm.value = { username: '', password: '' }
}

const logout = () => {
  currentUser.value = null
}

const submitPost = (postData: { title: string; url?: string; imageUrl?: string; body?: string }) => {
  if (!currentUser.value) return
  
  const post: Post = {
    id: posts.value.length + 1,
    title: postData.title,
    url: postData.url || undefined,
    imageUrl: postData.imageUrl || undefined,
    body: postData.body || undefined,
    author: currentUser.value.username,
    createdAt: new Date(),
    votes: 0,
    commentCount: 0
  }
  
  posts.value.unshift(post)
  router.push('/')
}

const submitComment = (postId: number, commentData: { body: string; replyToId?: number }) => {
  if (!currentUser.value) return
  
  const comment: Comment = {
    id: comments.value.length + 1,
    postId: postId,
    author: currentUser.value.username,
    body: commentData.body,
    replyToId: commentData.replyToId,
    createdAt: new Date(),
    votes: 0
  }
  
  comments.value.push(comment)
  
  // Update comment count
  const post = posts.value.find(p => p.id === postId)
  if (post) post.commentCount++
}

const vote = (itemId: number, voteType: 'up' | 'down', itemType: 'post' | 'comment') => {
  if (!currentUser.value) {
    showLogin.value = true
    return
  }

  const existingVoteIndex = votes.value.findIndex(v => 
    v.itemId === itemId && v.itemType === itemType && v.userId === currentUser.value!.id
  )

  let voteDelta = 0

  if (existingVoteIndex >= 0) {
    const existingVote = votes.value[existingVoteIndex]
    if (existingVote.type === voteType) {
      votes.value.splice(existingVoteIndex, 1)
      voteDelta = voteType === 'up' ? -1 : 1
    } else {
      existingVote.type = voteType
      voteDelta = voteType === 'up' ? 2 : -2
    }
  } else {
    votes.value.push({
      itemId,
      itemType,
      type: voteType,
      userId: currentUser.value.id
    })
    voteDelta = voteType === 'up' ? 1 : -1
  }

  if (itemType === 'post') {
    const post = posts.value.find(p => p.id === itemId)
    if (post) post.votes += voteDelta
  } else {
    const comment = comments.value.find(c => c.id === itemId)
    if (comment) comment.votes += voteDelta
  }
}

const getUserVote = (itemId: number, itemType: 'post' | 'comment'): 'up' | 'down' | null => {
  if (!currentUser.value) return null
  const vote = votes.value.find(v => 
    v.itemId === itemId && v.itemType === itemType && v.userId === currentUser.value!.id
  )
  return vote ? vote.type : null
}

const showReport = (itemId: number, type: 'post' | 'comment') => {
  reportItemId.value = itemId
  reportType.value = type
  showReportModal.value = true
}

const confirmReport = () => {
  // Mock report functionality
  console.log(`Reported ${reportType.value} ${reportItemId.value}`)
  showReportModal.value = false
  reportItemId.value = null
}

const cancelReport = () => {
  showReportModal.value = false
  reportItemId.value = null
}

const showCommentPreview = (commentId: number, event: MouseEvent) => {
  const comment = comments.value.find(c => c.id === commentId)
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
    // Could add a toast notification here
    console.log('URL copied to clipboard')
  } catch (err) {
    console.error('Failed to copy URL:', err)
  }
}

const formatDate = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  
  if (diffHours < 1) return 'just now'
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

// Provide data to child components
provide('currentUser', currentUser)
provide('posts', posts)
provide('comments', comments)
provide('users', users)
provide('votes', votes)
provide('showLogin', showLogin)
provide('submitPost', submitPost)
provide('submitComment', submitComment)
provide('vote', vote)
provide('getUserVote', getUserVote)
provide('showReport', showReport)
provide('showCommentPreview', showCommentPreview)
provide('hideCommentPreview', hideCommentPreview)
provide('sharePost', sharePost)
provide('formatDate', formatDate)
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}
</style>
