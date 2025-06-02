<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <h2 class="text-xl font-semibold mb-4">Submit New Post</h2>
    <form @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input 
            v-model="form.title"
            type="text" 
            required
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">URL (optional)</label>
          <input 
            v-model="form.url"
            type="url" 
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
          <input 
            v-model="form.imageUrl"
            type="url" 
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Body Text</label>
          <textarea 
            v-model="form.body"
            rows="6"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Submit Post
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const submitPost = inject('submitPost') as Function
const currentUser = inject('currentUser')
const showLogin = inject('showLogin')

const form = ref({
  title: '',
  url: '',
  imageUrl: '',
  body: ''
})

const handleSubmit = () => {
  if (!currentUser.value) {
    showLogin.value = true
    return
  }
  
  submitPost(form.value)
  form.value = { title: '', url: '', imageUrl: '', body: '' }
}
</script>
