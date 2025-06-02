<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <h1 class="text-2xl font-semibold text-gray-900">Moderation Panel</h1>
      <p class="text-gray-600 mt-1">Manage posts, comments, and users</p>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="text-sm text-gray-600">Total Posts</div>
        <div class="text-2xl font-semibold">{{ stats.totalPosts }}</div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="text-sm text-gray-600">Total Comments</div>
        <div class="text-2xl font-semibold">{{ stats.totalComments }}</div>
      </div>
      <div class="bg-red-50 rounded-lg border border-red-200 p-4">
        <div class="text-sm text-red-600">Reported Posts</div>
        <div class="text-2xl font-semibold text-red-700">{{ stats.reportedPosts }}</div>
      </div>
      <div class="bg-red-50 rounded-lg border border-red-200 p-4">
        <div class="text-sm text-red-600">Reported Comments</div>
        <div class="text-2xl font-semibold text-red-700">{{ stats.reportedComments }}</div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="bg-white rounded-lg border border-gray-200">
      <div class="border-b border-gray-200">
        <nav class="flex space-x-8 px-6">
          <button
            @click="activeTab = 'posts'"
            :class="activeTab === 'posts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            Posts Management
          </button>
          <button
            @click="activeTab = 'comments'"
            :class="activeTab === 'comments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            Comments Management
          </button>
          <button
            @click="activeTab = 'users'"
            :class="activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            Users Management
          </button>
        </nav>
      </div>

      <!-- Posts Tab -->
      <div v-if="activeTab === 'posts'" class="p-6">
        <!-- Posts Filters -->
        <div class="mb-6 space-y-4">
          <div class="flex flex-wrap gap-4">
            <div class="flex-1 min-w-64">
              <input
                v-model="postsFilter.search"
                @input="debouncedLoadPosts"
                type="text"
                placeholder="Search posts by title or content..."
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <div>
              <input
                v-model="postsFilter.author"
                @input="debouncedLoadPosts"
                type="text"
                placeholder="Filter by author..."
                class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <div>
              <select
                v-model="postsFilter.sortBy"
                @change="loadPosts"
                class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at">Newest First</option>
                <option value="votes">Most Voted</option>
              </select>
            </div>
            <div>
              <select
                v-model="postsFilter.status"
                @change="loadPosts"
                class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Posts</option>
                <option value="reported">Reported Only</option>
                <option value="normal">Normal Only</option>
              </select>
            </div>
          </div>
          
          <!-- Bulk Actions -->
          <div v-if="selectedPosts.length > 0" class="flex items-center gap-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <span class="text-sm text-blue-700">{{ selectedPosts.length }} posts selected</span>
            <button
              @click="bulkDeletePosts"
              class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Delete Selected
            </button>
            <button
              @click="selectedPosts = []"
              class="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
            >
              Clear Selection
            </button>
          </div>
        </div>

        <!-- Posts List -->
        <div v-if="isLoadingPosts" class="text-center py-8">
          <div class="text-gray-600">Loading posts...</div>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="post in posts"
            :key="post.id"
            :class="post.isReported ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'"
            class="border rounded-lg p-4"
          >
            <div class="flex items-start gap-3">
              <input
                type="checkbox"
                :value="post.id"
                v-model="selectedPosts"
                class="mt-1"
              >
              
              <div class="flex-1 space-y-2">
                <!-- Post Header -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <h3 class="font-medium text-gray-900">{{ post.title }}</h3>
                    <span v-if="post.isReported" class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      REPORTED
                    </span>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-gray-500">
                    <span>{{ formatDate(post.createdAt) }}</span>
                    <span>•</span>
                    <span>{{ post.votes }} votes</span>
                    <span>•</span>
                    <span>{{ post.commentCount }} comments</span>
                  </div>
                </div>

                <!-- Post Content Preview -->
                <div class="text-sm text-gray-600">
                  <div v-if="post.url" class="text-blue-600 mb-1">{{ post.url }}</div>
                  <div v-if="post.body" class="line-clamp-2">{{ post.body }}</div>
                </div>

                <!-- Author & Actions -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4 text-sm">
                    <span class="text-gray-600">by</span>
                    <button
                      @click="viewUserProfile(post.author)"
                      class="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {{ post.author }}
                    </button>
                    <span v-if="post.authorBanned" class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      BANNED
                    </span>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <button
                      @click="viewPost(post.id)"
                      class="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View
                    </button>
                    <button
                      @click="deletePost(post.id)"
                      class="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                    <button
                      v-if="!post.authorBanned"
                      @click="banUser(post.author)"
                      class="text-orange-600 hover:text-orange-800 text-sm"
                    >
                      Ban User
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Posts Pagination -->
        <div v-if="posts.length > 0 && postsPagination.hasMore" class="mt-6 flex justify-center">
          <button
            @click="loadMorePosts"
            :disabled="isLoadingMorePosts"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ isLoadingMorePosts ? 'Loading...' : 'Load More Posts' }}
          </button>
        </div>
      </div>

      <!-- Comments Tab -->
      <div v-if="activeTab === 'comments'" class="p-6">
        <!-- Comments Filters -->
        <div class="mb-6 space-y-4">
          <div class="flex flex-wrap gap-4">
            <div class="flex-1 min-w-64">
              <input
                v-model="commentsFilter.search"
                @input="debouncedLoadComments"
                type="text"
                placeholder="Search comments..."
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <div>
              <input
                v-model="commentsFilter.author"
                @input="debouncedLoadComments"
                type="text"
                placeholder="Filter by author..."
                class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <div>
              <select
                v-model="commentsFilter.sortBy"
                @change="loadComments"
                class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at">Newest First</option>
                <option value="votes">Most Voted</option>
              </select>
            </div>
            <div>
              <select
                v-model="commentsFilter.status"
                @change="loadComments"
                class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Comments</option>
                <option value="reported">Reported Only</option>
                <option value="normal">Normal Only</option>
              </select>
            </div>
          </div>

          <!-- Bulk Actions for Comments -->
          <div v-if="selectedComments.length > 0" class="flex items-center gap-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <span class="text-sm text-blue-700">{{ selectedComments.length }} comments selected</span>
            <button
              @click="bulkDeleteComments"
              class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Delete Selected
            </button>
            <button
              @click="selectedComments = []"
              class="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
            >
              Clear Selection
            </button>
          </div>
        </div>

        <!-- Comments List -->
        <div v-if="isLoadingComments" class="text-center py-8">
          <div class="text-gray-600">Loading comments...</div>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="comment in comments"
            :key="comment.id"
            :class="comment.isReported ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'"
            class="border rounded-lg p-4"
          >
            <div class="flex items-start gap-3">
              <input
                type="checkbox"
                :value="comment.id"
                v-model="selectedComments"
                class="mt-1"
              >
              
              <div class="flex-1 space-y-2">
                <!-- Comment Header -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="text-sm text-gray-600">Comment #{{ comment.id }}</span>
                    <span v-if="comment.isReported" class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      REPORTED
                    </span>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-gray-500">
                    <span>{{ formatDate(comment.createdAt) }}</span>
                    <span>•</span>
                    <span>{{ comment.votes }} votes</span>
                  </div>
                </div>

                <!-- Comment Content -->
                <div class="text-sm text-gray-700 bg-white p-3 rounded border">
                  {{ comment.body }}
                </div>

                <!-- Post Context -->
                <div class="text-xs text-gray-500">
                  On post: 
                  <button
                    @click="viewPost(comment.postId)"
                    class="text-blue-600 hover:text-blue-800"
                  >
                    {{ comment.postTitle }}
                  </button>
                </div>

                <!-- Author & Actions -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4 text-sm">
                    <span class="text-gray-600">by</span>
                    <button
                      @click="viewUserProfile(comment.author)"
                      class="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {{ comment.author }}
                    </button>
                    <span v-if="comment.authorBanned" class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      BANNED
                    </span>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <button
                      @click="viewPost(comment.postId)"
                      class="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Post
                    </button>
                    <button
                      @click="deleteComment(comment.id)"
                      class="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                    <button
                      v-if="!comment.authorBanned"
                      @click="banUser(comment.author)"
                      class="text-orange-600 hover:text-orange-800 text-sm"
                    >
                      Ban User
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Comments Pagination -->
        <div v-if="comments.length > 0 && commentsPagination.hasMore" class="mt-6 flex justify-center">
          <button
            @click="loadMoreComments"
            :disabled="isLoadingMoreComments"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ isLoadingMoreComments ? 'Loading...' : 'Load More Comments' }}
          </button>
        </div>
      </div>

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'" class="p-6">
        <!-- User Search -->
        <div class="mb-6">
          <input
            v-model="userSearch"
            @input="debouncedLoadUsers"
            type="text"
            placeholder="Search users by username..."
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>

        <!-- Users List -->
        <div v-if="isLoadingUsers" class="text-center py-8">
          <div class="text-gray-600">Loading users...</div>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="user in users"
            :key="user.id"
            class="bg-gray-50 border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-gray-900">{{ user.username }}</span>
                    <span v-if="user.isBanned" class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      BANNED
                    </span>
                    <span v-if="user.role === 'moderator'" class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      MODERATOR
                    </span>
                    <span v-if="user.role === 'admin'" class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                      ADMIN
                    </span>
                  </div>
                  <div class="text-sm text-gray-600">
                    Joined {{ formatDate(user.createdAt) }} • {{ user.postCount }} posts • {{ user.commentCount }} comments
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <button
                  @click="viewUserProfile(user.username)"
                  class="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View Profile
                </button>
                <button
                  v-if="!user.isBanned"
                  @click="banUser(user.username)"
                  class="text-red-600 hover:text-red-800 text-sm"
                >
                  Ban User
                </button>
                <button
                  v-else
                  @click="unbanUser(user.username)"
                  class="text-green-600 hover:text-green-800 text-sm"
                >
                  Unban User
                </button>
                <button
                  @click="deleteAllUserContent(user.username)"
                  class="text-red-800 hover:text-red-900 text-sm"
                >
                  Delete All Content
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Users Pagination -->
        <div v-if="users.length > 0 && usersPagination.hasMore" class="mt-6 flex justify-center">
          <button
            @click="loadMoreUsers"
            :disabled="isLoadingMoreUsers"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ isLoadingMoreUsers ? 'Loading...' : 'Load More Users' }}
          </button>
        </div>
      </div>
    </div>

    <!-- User Profile Modal -->
    <div v-if="selectedUserProfile" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h2 class="text-xl font-semibold">{{ selectedUserProfile.username }}</h2>
            <div class="text-sm text-gray-600">
              Joined {{ formatDate(selectedUserProfile.createdAt) }}
            </div>
          </div>
          <button
            @click="selectedUserProfile = null"
            class="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <!-- User Stats -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-gray-50 p-3 rounded">
            <div class="text-sm text-gray-600">Posts</div>
            <div class="text-xl font-semibold">{{ selectedUserProfile.posts?.length || 0 }}</div>
          </div>
          <div class="bg-gray-50 p-3 rounded">
            <div class="text-sm text-gray-600">Comments</div>
            <div class="text-xl font-semibold">{{ selectedUserProfile.comments?.length || 0 }}</div>
          </div>
          <div class="bg-gray-50 p-3 rounded">
            <div class="text-sm text-gray-600">Total Votes</div>
            <div class="text-xl font-semibold">{{ calculateUserVotes(selectedUserProfile) }}</div>
          </div>
        </div>

        <!-- User Content Tabs -->
        <div class="border-b border-gray-200 mb-4">
          <nav class="flex space-x-8">
            <button
              @click="userProfileTab = 'posts'"
              :class="userProfileTab === 'posts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'"
              class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
            >
              Posts
            </button>
            <button
              @click="userProfileTab = 'comments'"
              :class="userProfileTab === 'comments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'"
              class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
            >
              Comments
            </button>
          </nav>
        </div>

        <!-- User Posts -->
        <div v-if="userProfileTab === 'posts'" class="space-y-3">
          <div
            v-for="post in selectedUserProfile.posts"
            :key="post.id"
            class="border border-gray-200 rounded p-3"
          >
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-medium">{{ post.title }}</h4>
                <div class="text-sm text-gray-600">{{ formatDate(post.createdAt) }} • {{ post.votes }} votes</div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="viewPost(post.id)"
                  class="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View
                </button>
                <button
                  @click="deletePost(post.id)"
                  class="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- User Comments -->
        <div v-if="userProfileTab === 'comments'" class="space-y-3">
          <div
            v-for="comment in selectedUserProfile.comments"
            :key="comment.id"
            class="border border-gray-200 rounded p-3"
          >
            <div class="text-sm text-gray-700 mb-2">{{ comment.body }}</div>
            <div class="flex justify-between items-center text-sm text-gray-600">
              <div>{{ formatDate(comment.createdAt) }} • {{ comment.votes }} votes</div>
              <div class="flex gap-2">
                <button
                  @click="viewPost(comment.postId)"
                  class="text-blue-600 hover:text-blue-800"
                >
                  View Post
                </button>
                <button
                  @click="deleteComment(comment.id)"
                  class="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">{{ confirmModal.title }}</h3>
        <p class="text-gray-700 mb-6">{{ confirmModal.message }}</p>
        <div class="flex gap-4">
          <button
            @click="confirmAction"
            class="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            {{ confirmModal.confirmText }}
          </button>
          <button
            @click="showConfirmModal = false"
            class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import { modApiService } from '../services/api'

const router = useRouter()
const formatDate = inject('formatDate') as Function
const showSuccess = inject('showSuccess') as Function
const showError = inject('showError') as Function

// Debounce function
const debounce = (func: Function, delay: number) => {
  let timeoutId: number
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// State
const activeTab = ref('posts')
const userProfileTab = ref('posts')
const selectedUserProfile = ref<any>(null)
const showConfirmModal = ref(false)
const confirmModal = ref({
  title: '',
  message: '',
  confirmText: '',
  action: () => {}
})

// Data
const stats = ref({
  totalPosts: 0,
  totalComments: 0,
  reportedPosts: 0,
  reportedComments: 0,
  totalUsers: 0,
  bannedUsers: 0
})

const posts = ref<any[]>([])
const comments = ref<any[]>([])
const users = ref<any[]>([])

// Pagination
const postsPagination = ref({ page: 1, hasMore: false })
const commentsPagination = ref({ page: 1, hasMore: false })
const usersPagination = ref({ page: 1, hasMore: false })

// Loading states
const isLoadingPosts = ref(false)
const isLoadingComments = ref(false)
const isLoadingUsers = ref(false)
const isLoadingMorePosts = ref(false)
const isLoadingMoreComments = ref(false)
const isLoadingMoreUsers = ref(false)

// Selections
const selectedPosts = ref<number[]>([])
const selectedComments = ref<number[]>([])

// Filters
const postsFilter = ref({
  search: '',
  author: '',
  sortBy: 'created_at',
  status: 'all'
})

const commentsFilter = ref({
  search: '',
  author: '',
  sortBy: 'created_at', 
  status: 'all'
})

const userSearch = ref('')

// Debounced functions
const debouncedLoadPosts = debounce(() => loadPosts(), 500)
const debouncedLoadComments = debounce(() => loadComments(), 500)
const debouncedLoadUsers = debounce(() => loadUsers(), 500)

// Methods
const loadStats = async () => {
  try {
    const response = await modApiService.getStats()
    stats.value = response
  } catch (error) {
    showError('Failed to load statistics')
  }
}

const loadPosts = async (append = false) => {
  try {
    if (!append) {
      isLoadingPosts.value = true
      postsPagination.value.page = 1
    } else {
      isLoadingMorePosts.value = true
      postsPagination.value.page++
    }

    const response = await modApiService.getPosts({
      page: postsPagination.value.page,
      limit: 20,
      search: postsFilter.value.search || undefined,
      author: postsFilter.value.author || undefined,
      sortBy: postsFilter.value.sortBy,
      status: postsFilter.value.status
    })

    if (append) {
      posts.value = [...posts.value, ...response.posts]
    } else {
      posts.value = response.posts
      selectedPosts.value = []
    }

    postsPagination.value.hasMore = response.pagination.hasMore
  } catch (error) {
    showError('Failed to load posts')
  } finally {
    isLoadingPosts.value = false
    isLoadingMorePosts.value = false
  }
}

const loadComments = async (append = false) => {
  try {
    if (!append) {
      isLoadingComments.value = true
      commentsPagination.value.page = 1
    } else {
      isLoadingMoreComments.value = true
      commentsPagination.value.page++
    }

    const response = await modApiService.getComments({
      page: commentsPagination.value.page,
      limit: 20,
      search: commentsFilter.value.search || undefined,
      author: commentsFilter.value.author || undefined,
      sortBy: commentsFilter.value.sortBy,
      status: commentsFilter.value.status
    })

    if (append) {
      comments.value = [...comments.value, ...response.comments]
    } else {
      comments.value = response.comments
      selectedComments.value = []
    }

    commentsPagination.value.hasMore = response.pagination.hasMore
  } catch (error) {
    showError('Failed to load comments')
  } finally {
    isLoadingComments.value = false
    isLoadingMoreComments.value = false
  }
}

const loadUsers = async (append = false) => {
  try {
    if (!append) {
      isLoadingUsers.value = true
      usersPagination.value.page = 1
    } else {
      isLoadingMoreUsers.value = true
      usersPagination.value.page++
    }

    const response = await modApiService.getUsers({
      page: usersPagination.value.page,
      limit: 20,
      search: userSearch.value || undefined
    })

    if (append) {
      users.value = [...users.value, ...response.users]
    } else {
      users.value = response.users
    }

    usersPagination.value.hasMore = response.pagination.hasMore
  } catch (error) {
    showError('Failed to load users')
  } finally {
    isLoadingUsers.value = false
    isLoadingMoreUsers.value = false
  }
}

const loadMorePosts = () => loadPosts(true)
const loadMoreComments = () => loadComments(true)
const loadMoreUsers = () => loadUsers(true)

const viewPost = (postId: number) => {
  router.push(`/post/${postId}`)
}

const viewUserProfile = async (username: string) => {
  try {
    const response = await modApiService.getUserProfile(username)
    selectedUserProfile.value = response
  } catch (error) {
    showError('Failed to load user profile')
  }
}

const calculateUserVotes = (userProfile: any) => {
  const postVotes = userProfile.posts?.reduce((sum: number, post: any) => sum + post.votes, 0) || 0
  const commentVotes = userProfile.comments?.reduce((sum: number, comment: any) => sum + comment.votes, 0) || 0
  return postVotes + commentVotes
}

const deletePost = (postId: number) => {
  showConfirmModal.value = true
  confirmModal.value = {
    title: 'Delete Post',
    message: 'Are you sure you want to delete this post? This action cannot be undone.',
    confirmText: 'Delete',
    action: () => confirmDeletePost(postId)
  }
}

const confirmDeletePost = async (postId: number) => {
  try {
    await modApiService.deletePost(postId)
    await loadPosts()
    await loadStats()
    showSuccess('Post deleted successfully')
  } catch (error) {
    showError('Failed to delete post')
  } finally {
    showConfirmModal.value = false
  }
}

const deleteComment = (commentId: number) => {
  showConfirmModal.value = true
  confirmModal.value = {
    title: 'Delete Comment',
    message: 'Are you sure you want to delete this comment? This action cannot be undone.',
    confirmText: 'Delete',
    action: () => confirmDeleteComment(commentId)
  }
}

const confirmDeleteComment = async (commentId: number) => {
  try {
    await modApiService.deleteComment(commentId)
    await loadComments()
    await loadStats()
    showSuccess('Comment deleted successfully')
  } catch (error) {
    showError('Failed to delete comment')
  } finally {
    showConfirmModal.value = false
  }
}

const banUser = (username: string) => {
  showConfirmModal.value = true
  confirmModal.value = {
    title: 'Ban User',
    message: `Are you sure you want to ban user "${username}"? They will not be able to create new posts or comments.`,
    confirmText: 'Ban User',
    action: () => confirmBanUser(username)
  }
}

const confirmBanUser = async (username: string) => {
  try {
    await modApiService.banUser(username)
    await loadPosts()
    await loadComments() 
    await loadUsers()
    await loadStats()
    showSuccess(`User ${username} has been banned`)
  } catch (error) {
    showError('Failed to ban user')
  } finally {
    showConfirmModal.value = false
  }
}

const unbanUser = (username: string) => {
  showConfirmModal.value = true
  confirmModal.value = {
    title: 'Unban User',
    message: `Are you sure you want to unban user "${username}"?`,
    confirmText: 'Unban User',
    action: () => confirmUnbanUser(username)
  }
}

const confirmUnbanUser = async (username: string) => {
  try {
    await modApiService.unbanUser(username)
    await loadPosts()
    await loadComments()
    await loadUsers()
    await loadStats()
    showSuccess(`User ${username} has been unbanned`)
  } catch (error) {
    showError('Failed to unban user')
  } finally {
    showConfirmModal.value = false
  }
}

const deleteAllUserContent = (username: string) => {
  showConfirmModal.value = true
  confirmModal.value = {
    title: 'Delete All User Content',
    message: `Are you sure you want to delete ALL posts and comments by "${username}"? This action cannot be undone.`,
    confirmText: 'Delete All Content',
    action: () => confirmDeleteAllUserContent(username)
  }
}

const confirmDeleteAllUserContent = async (username: string) => {
  try {
    const response = await modApiService.deleteAllUserContent(username)
    await loadPosts()
    await loadComments()
    await loadStats()
    showSuccess(`Deleted ${response.deletedPosts} posts and ${response.deletedComments} comments by ${username}`)
  } catch (error) {
    showError('Failed to delete user content')
  } finally {
    showConfirmModal.value = false
  }
}

const bulkDeletePosts = () => {
  if (selectedPosts.value.length === 0) return
  
  showConfirmModal.value = true
  confirmModal.value = {
    title: 'Bulk Delete Posts',
    message: `Are you sure you want to delete ${selectedPosts.value.length} selected posts? This action cannot be undone.`,
    confirmText: 'Delete All',
    action: () => confirmBulkDeletePosts()
  }
}

const confirmBulkDeletePosts = async () => {
  try {
    await modApiService.bulkDeletePosts(selectedPosts.value)
    await loadPosts()
    await loadStats()
    showSuccess('Selected posts deleted successfully')
  } catch (error) {
    showError('Failed to delete posts')
  } finally {
    showConfirmModal.value = false
  }
}

const bulkDeleteComments = () => {
  if (selectedComments.value.length === 0) return
  
  showConfirmModal.value = true
  confirmModal.value = {
    title: 'Bulk Delete Comments',
    message: `Are you sure you want to delete ${selectedComments.value.length} selected comments? This action cannot be undone.`,
    confirmText: 'Delete All',
    action: () => confirmBulkDeleteComments()
  }
}

const confirmBulkDeleteComments = async () => {
  try {
    await modApiService.bulkDeleteComments(selectedComments.value)
    await loadComments()
    await loadStats()
    showSuccess('Selected comments deleted successfully')
  } catch (error) {
    showError('Failed to delete comments')
  } finally {
    showConfirmModal.value = false
  }
}

const confirmAction = () => {
  confirmModal.value.action()
}

// Watch for tab changes to load data
watch(activeTab, (newTab) => {
  if (newTab === 'posts' && posts.value.length === 0) {
    loadPosts()
  } else if (newTab === 'comments' && comments.value.length === 0) {
    loadComments()
  } else if (newTab === 'users' && users.value.length === 0) {
    loadUsers()
  }
})

// Initialize data on mount
onMounted(async () => {
  await loadStats()
  await loadPosts() // Load posts by default
})
</script>
