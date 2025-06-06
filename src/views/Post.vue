<template>
  <div v-if="isLoading" class="text-center py-8">
    <div class="text-theme-secondary">Loading post...</div>
  </div>

  <div v-else-if="post" class="space-y-6">
    <!-- Breadcrumb -->
    <div class="text-sm text-theme-secondary">
      <router-link to="/" class="hover:text-accent-primary transition-colors">Home</router-link>
      <span class="mx-2">></span>
      <span>{{ post.title }}</span>
    </div>

    <!-- Post Content -->
    <div class="bg-theme-primary rounded-lg border border-theme-primary p-4">
      <div class="flex items-start space-x-3">
        <!-- Vote Controls -->
        <div class="flex flex-col items-center space-y-1 mt-1">
          <button 
            @click="handleVote(post.id, 'up', 'post')"
            :class="post.userVote === 'up' ? 'text-accent-warning' : 'text-theme-tertiary'"
            class="hover:text-accent-warning transition-colors"
            :disabled="isVotingPost"
          >
            ▲
          </button>
          <span class="text-sm font-medium text-theme-primary">{{ post.votes }}</span>
          <button 
            @click="handleVote(post.id, 'down', 'post')"
            :class="post.userVote === 'down' ? 'text-accent-primary' : 'text-theme-tertiary'"
            class="hover:text-accent-primary transition-colors"
            :disabled="isVotingPost"
          >
            ▼
          </button>
        </div>

        <!-- Post Content -->
        <div class="flex-1 min-w-0">
          <h1 class="text-xl font-semibold text-theme-primary mb-2">{{ post.title }}</h1>
          
          <div v-if="post.url" class="text-accent-primary hover:text-accent-secondary mb-2 transition-colors">
            <a :href="post.url" target="_blank" class="text-sm truncate block max-w-full">
              {{ post.url }}
            </a>
          </div>

          <div v-if="post.imageUrl" class="mb-3">
            <img :src="post.imageUrl" :alt="post.title" class="max-w-full h-auto w-auto max-h-96 rounded border border-theme-primary object-contain">
          </div>

          <div v-if="post.body" class="text-theme-primary mb-3 whitespace-pre-wrap">
            <span v-if="!showFullBody && post.body.length > 600">
              {{ post.body.slice(0, 600) }}...
              <button 
                @click="showFullBody = true"
                class="text-accent-primary hover:text-accent-secondary ml-1 transition-colors"
              >
                read more
              </button>
            </span>
            <span v-else>
              {{ post.body }}
              <button 
                v-if="showFullBody && post.body.length > 600"
                @click="showFullBody = false"
                class="text-accent-primary hover:text-accent-secondary ml-1 transition-colors"
              >
                show less
              </button>
            </span>
          </div>

          <div class="flex items-center space-x-4 text-sm text-theme-secondary">
            <span>by {{ post.author }}</span>
            <span>{{ formatDate(post.createdAt) }}</span>
            <button 
              @click="sharePost(post.id)"
              class="hover:text-theme-primary transition-colors"
            >
              share
            </button>
            <button 
              @click="showReport(post.id, 'post')"
              class="hover:text-accent-error transition-colors"
            >
              report
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Comment Form -->
    <div v-if="currentUser" class="bg-theme-primary rounded-lg border border-theme-primary p-4">
      <form @submit.prevent="handleSubmitComment">
        <textarea 
          v-model="commentForm.body"
          rows="4"
          placeholder="Write a comment..."
          class="w-full border border-theme-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-primary text-theme-primary placeholder-theme-tertiary"
          required
        ></textarea>
        <button 
          type="submit" 
          class="mt-2 bg-accent-primary text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
          :disabled="isSubmittingComment"
        >
          {{ isSubmittingComment ? 'Posting...' : 'Post Comment' }}
        </button>
      </form>
    </div>

    <!-- Login prompt -->
    <div v-else class="bg-theme-primary rounded-lg border border-theme-primary p-4 text-center">
      <p class="text-theme-secondary mb-2">Please log in to comment</p>
      <button 
        @click="showLogin = true"
        class="bg-accent-primary text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
      >
        Login
      </button>
    </div>

    <!-- Comments List -->
    <div class="space-y-3">
      <div 
        v-for="comment in comments" 
        :key="comment.id"
        :data-comment-id="comment.id"
        class="bg-theme-primary rounded border border-theme-primary p-3 transition-all duration-300"
        :class="{ 
          'ring-2 ring-yellow-400 bg-yellow-50': highlightedCommentId === comment.id,
          'shadow-lg': highlightedCommentId === comment.id,
          'border-l-4 border-l-blue-500 bg-blue-50': isOwnComment(comment),
          'border-l-theme-primary': !isOwnComment(comment)
        }"
        >
        <div class="flex items-start space-x-3">
          <!-- Vote Controls -->
          <div class="flex flex-col items-center space-y-1">
            <button 
              @click="handleVote(comment.id, 'up', 'comment')"
              :class="comment.userVote === 'up' ? 'text-accent-warning' : 'text-theme-tertiary'"
              class="hover:text-accent-warning text-sm transition-colors"
              :disabled="isVoting[`comment_${comment.id}`]"
            >
              ▲
            </button>
            <span class="text-xs text-theme-primary">{{ comment.votes }}</span>
            <button 
              @click="handleVote(comment.id, 'down', 'comment')"
              :class="comment.userVote === 'down' ? 'text-accent-primary' : 'text-theme-tertiary'"
              class="hover:text-accent-primary text-sm transition-colors"
              :disabled="isVoting[`comment_${comment.id}`]"
            >
              ▼
            </button>
          </div>

          <!-- Comment Content -->
          <div class="flex-1">
            <div v-if="getReplies(comment.id).length > 0" class="mt-2 text-xs text-theme-tertiary">
              <span>Replies: </span>
              <span 
                v-for="(replyId, index) in getReplies(comment.id)" 
                :key="replyId"
                class="text-green-600 hover:underline cursor-pointer quote-link"
                :data-comment-id="replyId"
                @click.stop="handleQuoteClick"
                @mouseover="handleQuoteMouseEnter"
                @mouseout="handleQuoteMouseLeave"
              >
                >>{{ replyId }}{{ index < getReplies(comment.id).length - 1 ? ' ' : '' }}
              </span>
            </div>

            <div class="flex items-center space-x-2 mb-2">
              <span class="text-sm font-medium text-accent-primary">{{ comment.author }}</span>
              <span class="text-xs text-theme-tertiary">{{ formatDate(comment.createdAt) }}</span>
              <span class="text-xs text-theme-tertiary">No. {{ comment.id }}</span>
              <button 
                @click="replyToComment(comment.id)"
                class="text-xs text-accent-primary hover:text-accent-secondary transition-colors"
              >
                reply
              </button>
              <button 
                @click="showReport(comment.id, 'comment')"
                class="text-xs text-accent-error hover:opacity-80 transition-opacity"
              >
                report
              </button>
            </div>

            <div 
              class="text-theme-primary text-sm whitespace-pre-wrap"
              v-html="parseCommentBody(comment.body)"
              @click="handleQuoteClick"
              @mouseover="handleQuoteMouseEnter" 
              @mouseout="handleQuoteMouseLeave"
            >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 404 case -->
  <div v-else class="text-center py-8">
    <h2 class="text-xl font-semibold text-theme-primary mb-2">Post not found</h2>
    <p class="text-theme-secondary mb-4">The post you're looking for doesn't exist.</p>
    <router-link to="/" class="text-accent-primary hover:text-accent-secondary transition-colors">
      ← Back to posts
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiService, type Post, type Comment } from '../services/api'

const route = useRoute()
const router = useRouter()

const currentUser = inject('currentUser') as any
const showLogin = inject('showLogin') as any
const allComments = inject('allComments') as any
const submitComment = inject('submitComment') as Function
const vote = inject('vote') as Function
const showReport = inject('showReport') as Function
const sharePost = inject('sharePost') as Function
const showCommentPreview = inject('showCommentPreview') as Function
const hideCommentPreview = inject('hideCommentPreview') as Function
const formatDate = inject('formatDate') as Function
const showError = inject('showError') as Function

const post = ref<Post | null>(null)
const comments = ref<Comment[]>([])
const isLoading = ref(true)
const isSubmittingComment = ref(false)
const isVotingPost = ref(false)
const isVoting = ref<Record<string, boolean>>({})
const showFullBody = ref(false)

const commentForm = ref({
  body: ''
})

const postId = computed(() => parseInt(route.params.id as string))

const isOwnComment = (comment: Comment): boolean => {
  return currentUser.value && comment.author === currentUser.value.username
}

const getReplies = (commentId: number): number[] => {
  return replyMap.value[commentId] || []
}

const replyMap = computed(() => {
  const map: Record<number, number[]> = {}
  
  comments.value.forEach(comment => {
    // Extract all >>number references from comment body
    const matches = comment.body.match(/>>(\d+)/g)
    if (matches) {
      // Get unique referenced IDs to avoid duplicates from the same comment
      const uniqueReferencedIds = [...new Set(matches.map(match => parseInt(match.replace('>>', ''))))]
      
      uniqueReferencedIds.forEach(referencedId => {
        if (!map[referencedId]) {
          map[referencedId] = []
        }
        map[referencedId].push(comment.id)
      })
    }
  })
  
  return map
})

const loadPost = async (showLoadingState = true) => {
  if (showLoadingState) {
    isLoading.value = true
  }
  
  try {
    const response = await apiService.getPost(postId.value)
    post.value = response.post
    comments.value = response.comments
    
    // Update global comments for tooltip preview
    allComments.value = response.comments
  } catch (error) {
    showError()
    router.push('/')
  } finally {
    if (showLoadingState) {
      isLoading.value = false
    }
  }
}

const handleSubmitComment = async () => {
  if (!currentUser.value) {
    showLogin.value = true
    return
  }
  
  isSubmittingComment.value = true
  try {
    await submitComment(postId.value, {
      body: commentForm.value.body
    })
    
    await loadPost(false)
    commentForm.value = { body: '' }
    
    // Scroll to bottom after comment is added
    setTimeout(() => {
      window.scrollTo({ 
        top: document.body.scrollHeight, 
        behavior: 'smooth' 
      })
    }, 100) // Small delay to ensure DOM is updated
    
  } catch (error) {
    // Error already handled in submitComment
  } finally {
    isSubmittingComment.value = false
  }
}

const parseCommentBody = (body: string): string => {
  return body.replace(/>>(\d+)/g, (match, commentId) => {
    const id = parseInt(commentId)
    const targetComment = comments.value.find(c => c.id === id)
    if (targetComment) {
      return `<span class="text-green-600 hover:underline cursor-pointer quote-link" data-comment-id="${id}">${match}</span>`
    }
    return `<span class="text-green-600">${match}</span>`
  })
}

const highlightedCommentId = ref<number | null>(null)

const handleQuoteClick = (event: Event) => {
  const target = event.target as HTMLElement
  if (target.classList.contains('quote-link')) {
    const commentId = parseInt(target.dataset.commentId || '0')
    if (commentId) {
      // Highlight the target comment
      highlightedCommentId.value = commentId
      
      // Scroll to the comment
	  const commentElement = document.querySelector(`div[data-comment-id="${commentId}"]`)
      if (commentElement) {
        commentElement.scrollIntoView(true)
      }
      
      // Remove highlight after 5 seconds
      setTimeout(() => {
        highlightedCommentId.value = null
      }, 5000)
    }
  }
}

const handleQuoteMouseEnter = (event: Event) => {
  const target = event.target as HTMLElement
  if (target.classList.contains('quote-link')) {
    const commentId = parseInt(target.dataset.commentId || '0')
    if (commentId) {
      showCommentPreview(commentId, event as MouseEvent)
    }
  }
}

const handleQuoteMouseLeave = (event: Event) => {
  const target = event.target as HTMLElement
  if (target.classList.contains('quote-link')) {
    hideCommentPreview()
  }
}

const replyToComment = (commentId: number) => {
  commentForm.value.body = `>>${commentId}\n` + commentForm.value.body
  
  // Focus the textarea
  const textarea = document.querySelector('textarea')
  if (textarea) {
    textarea.focus()
    // Move cursor to end
    textarea.setSelectionRange(textarea.value.length, textarea.value.length)
  }
}

const handleVote = async (itemId: number, voteType: 'up' | 'down', itemType: 'post' | 'comment') => {
  if (itemType === 'post') {
    isVotingPost.value = true
  } else {
    const key = `${itemType}_${itemId}`
    isVoting.value[key] = true
  }
  
  try {
    const response = await vote(itemId, voteType, itemType)
    if (response) {
      if (itemType === 'post' && post.value) {
        post.value.votes = response.votes
        post.value.userVote = response.userVote
      } else {
        const comment = comments.value.find(c => c.id === itemId)
        if (comment) {
          comment.votes = response.votes
          comment.userVote = response.userVote
        }
      }
    }
  } catch (error) {
    // Error already handled in the vote function
  } finally {
    if (itemType === 'post') {
      isVotingPost.value = false
    } else {
      const key = `${itemType}_${itemId}`
      delete isVoting.value[key]
    }
  }
}

onMounted(() => {
  loadPost()
})
</script>
