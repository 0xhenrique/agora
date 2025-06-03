<template>
  <div class="bg-theme-primary rounded-lg border border-theme-primary p-6">
    <h2 class="text-xl font-semibold mb-4 text-theme-primary">Submit New Post</h2>
    
    <div v-if="!currentUser" class="text-center py-8">
      <p class="text-theme-secondary mb-4">Please log in to submit a post</p>
      <button 
        @click="showLogin = true"
        class="bg-accent-primary text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
      >
        Login
      </button>
    </div>
    
    <form v-else @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-theme-primary mb-1">Title</label>
          <input 
            v-model="form.title"
            type="text" 
            required
            maxlength="300"
            class="w-full border border-theme-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-primary text-theme-primary placeholder-theme-tertiary"
            :class="{ 'border-accent-error': titleTooLong }"
            :disabled="isSubmitting"
          >
          <div class="flex justify-between items-center mt-1">
            <div v-if="titleTooLong" class="text-accent-error text-sm">
              Title is too long
            </div>
            <div class="text-sm text-theme-tertiary ml-auto">
              {{ form.title.length }}/300 characters
            </div>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-theme-primary mb-1">URL (optional)</label>
          <input 
            v-model="form.url"
            type="url" 
            class="w-full border border-theme-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-primary text-theme-primary placeholder-theme-tertiary"
            :disabled="isSubmitting"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-theme-primary mb-1">Image URL (optional)</label>
          <input 
            v-model="form.imageUrl"
            type="url" 
            class="w-full border border-theme-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-primary text-theme-primary placeholder-theme-tertiary"
            :disabled="isSubmitting"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-theme-primary mb-1">Body Text</label>
          <textarea 
            v-model="form.body"
            rows="6"
            class="w-full border border-theme-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-primary text-theme-primary placeholder-theme-tertiary"
            :disabled="isSubmitting"
          ></textarea>
        </div>
        <button 
          type="submit" 
          class="bg-accent-primary text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          :disabled="isSubmitting || titleTooLong || !form.title.trim()"
        >
          {{ isSubmitting ? 'Submitting...' : 'Submit Post' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'

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

const titleTooLong = computed(() => form.value.title.length > 300)

const handleSubmit = async () => {
  if (!currentUser.value) {
    showLogin.value = true
    return
  }
  
  if (titleTooLong.value || !form.value.title.trim()) {
    return
  }
  
  isSubmitting.value = true
  try {
    // Filter out empty optional fields
    const postData: any = { title: form.value.title.trim() }
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
