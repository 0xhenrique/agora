<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <h2 class="text-xl font-semibold mb-4">Submit New Post</h2>
    
    <div v-if="!currentUser" class="text-center py-8">
      <p class="text-gray-600 mb-4">Please log in to submit a post</p>
      <button 
        @click="showLogin = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Login
      </button>
    </div>
    
    <form v-else @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input 
            v-model="form.title"
            type="text" 
            required
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="isSubmitting"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">URL (optional)</label>
          <input 
            v-model="form.url"
            type="url" 
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="isSubmitting"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
          <input 
            v-model="form.imageUrl"
            type="url" 
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="isSubmitting"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Body Text</label>
          <textarea 
            v-model="form.body"
            rows="6"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="isSubmitting"
          ></textarea>
        </div>
        <button 
          type="submit" 
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Submitting...' : 'Submit Post' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'

const submitPost = inject('submitPost') as Function
const currentUser = inject('currentUser') as any
const showLogin = inject('showLogin') as any

const isSubmitting = ref(false)

const form = ref({
  title: '',
  url: '',
  imageUrl: '',
  body: ''
})

const handleSubmit = async () => {
  if (!currentUser.value) {
    showLogin.value = true
    return
  }
  
  isSubmitting.value = true
  try {
    // Filter out empty optional fields
    const postData: any = { title: form.value.title }
    if (form.value.url.trim()) postData.url = form.value.url.trim()
    if (form.value.imageUrl.trim()) postData.imageUrl = form.value.imageUrl.trim()
    if (form.value.body.trim()) postData.body = form.value.body.trim()
    
    await submitPost(postData)
    form.value = { title: '', url: '', imageUrl: '', body: '' }
  } catch (error) {
    // Error already handled in submitPost
  } finally {
    isSubmitting.value = false
  }
}
</script>
