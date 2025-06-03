<template>
  <div>
    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="text-gray-600">Loading posts...</div>
    </div>

    <!-- Posts list -->
    <div v-else-if="posts.length > 0">
      <div v-for="post in posts" :key="post.id" class="bg-white rounded-lg border border-gray-200 mb-4 p-4">
        <div class="flex items-start space-x-3">
          <!-- Vote Controls -->
          <div class="flex flex-col items-center space-y-1 mt-1">
            <button 
              @click="handleVote(post.id, 'up', 'post')"
              :class="post.userVote === 'up' ? 'text-orange-600' : 'text-gray-400'"
              class="hover:text-orange-600"
              :disabled="isVoting[`post_${post.id}`]"
            >
              ▲
            </button>
            <span class="text-sm font-medium">{{ post.votes }}</span>
            <button 
              @click="handleVote(post.id, 'down', 'post')"
              :class="post.userVote === 'down' ? 'text-blue-600' : 'text-gray-400'"
              class="hover:text-blue-600"
              :disabled="isVoting[`post_${post.id}`]"
            >
              ▼
            </button>
          </div>

          <!-- Post Content -->
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              <router-link :to="`/post/${post.id}`" class="hover:text-blue-600">
                {{ post.title }}
              </router-link>
            </h3>
            
            <!-- Link Preview -->
            <div v-if="post.url" class="text-blue-600 hover:text-blue-800 mb-2">
              <a :href="post.url" target="_blank" class="text-sm truncate block max-w-full">
                {{ post.url }}
              </a>
            </div>

            <!-- Post Meta -->
            <div class="flex items-center space-x-4 text-sm text-gray-500">
              <span>by {{ post.author }}</span>
              <span>{{ formatDate(post.createdAt) }}</span>
              <router-link 
                :to="`/post/${post.id}`"
                class="hover:text-gray-700"
              >
                {{ post.commentCount || 0 }} comments
              </router-link>
              <button 
                @click="sharePost(post.id)"
                class="hover:text-gray-700"
              >
                share
              </button>
              <button 
                @click="showReport(post.id, 'post')"
                class="hover:text-red-600"
              >
                report
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMore" class="text-center mt-6">
        <button 
          @click="loadMore"
          :disabled="isLoadingMore"
          class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {{ isLoadingMore ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">No posts yet</h2>
      <p class="text-gray-600 mb-4">Be the first to share something!</p>
      <router-link 
        to="/submit"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Submit Post
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue'
import { apiService, type Post } from '../services/api'

const showReport = inject('showReport') as Function
const sharePost = inject('sharePost') as Function
const formatDate = inject('formatDate') as Function
const vote = inject('vote') as Function
const showError = inject('showError') as Function

const posts = ref<Post[]>([])
const isLoading = ref(true)
const isLoadingMore = ref(false)
const isVoting = ref<Record<string, boolean>>({})
const currentPage = ref(1)
const hasMore = ref(false)

const loadPosts = async (page = 1, append = false) => {
  try {
    const response = await apiService.getPosts(page, 20)
    
    if (append) {
      posts.value = [...posts.value, ...response.posts]
    } else {
      posts.value = response.posts
    }
    
    hasMore.value = response.pagination.hasMore
    currentPage.value = response.pagination.page
  } catch (error) {
    showError()
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

const loadMore = async () => {
  isLoadingMore.value = true
  await loadPosts(currentPage.value + 1, true)
}

const handleVote = async (postId: number, voteType: 'up' | 'down', itemType: 'post') => {
  const key = `${itemType}_${postId}`
  isVoting.value[key] = true
  
  try {
    const response = await vote(postId, voteType, itemType)
    if (response) {
      // Update the post in the local state
      const post = posts.value.find(p => p.id === postId)
      if (post) {
        post.votes = response.votes
        post.userVote = response.userVote
      }
    }
  } catch (error) {
    // Error already handled in the vote function
  } finally {
    delete isVoting.value[key]
  }
}

onMounted(() => {
  loadPosts()
})
</script>
