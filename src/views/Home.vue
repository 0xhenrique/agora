<template>
  <div>
    <div v-for="post in posts" :key="post.id" class="bg-white rounded-lg border border-gray-200 mb-4 p-4">
      <div class="flex items-start space-x-3">
        <!-- Vote Controls -->
        <div class="flex flex-col items-center space-y-1 mt-1">
          <button 
            @click="vote(post.id, 'up', 'post')"
            :class="getUserVote(post.id, 'post') === 'up' ? 'text-orange-600' : 'text-gray-400'"
            class="hover:text-orange-600"
          >
            ▲
          </button>
          <span class="text-sm font-medium">{{ post.votes }}</span>
          <button 
            @click="vote(post.id, 'down', 'post')"
            :class="getUserVote(post.id, 'post') === 'down' ? 'text-blue-600' : 'text-gray-400'"
            class="hover:text-blue-600"
          >
            ▼
          </button>
        </div>

        <!-- Post Content -->
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            <router-link :to="`/post/${post.id}`" class="hover:text-blue-600">
              {{ post.title }}
            </router-link>
          </h3>
          
          <!-- Link Preview -->
          <div v-if="post.url" class="text-blue-600 hover:text-blue-800 mb-2">
            <a :href="post.url" target="_blank" class="text-sm">{{ post.url }}</a>
          </div>

          <!-- Image -->
          <div v-if="post.imageUrl" class="mb-3">
            <img :src="post.imageUrl" :alt="post.title" class="max-w-md rounded border">
          </div>

          <!-- Body Text -->
          <div v-if="post.body" class="text-gray-700 mb-3 whitespace-pre-wrap">{{ post.body }}</div>

          <!-- Post Meta -->
          <div class="flex items-center space-x-4 text-sm text-gray-500">
            <span>by {{ post.author }}</span>
            <span>{{ formatDate(post.createdAt) }}</span>
            <router-link 
              :to="`/post/${post.id}`"
              class="hover:text-gray-700"
            >
              {{ post.commentCount }} comments
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
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'

const posts = inject('posts')
const vote = inject('vote')
const getUserVote = inject('getUserVote')
const showReport = inject('showReport')
const sharePost = inject('sharePost')
const formatDate = inject('formatDate')
</script>
