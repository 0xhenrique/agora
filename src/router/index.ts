import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Submit from '../views/Submit.vue'
import Post from '../views/Post.vue'
import ModPanel from '../views/ModPanel.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/submit',
    name: 'Submit',
    component: Submit
  },
  {
    path: '/post/:id',
    name: 'Post',
    component: Post,
    props: true
  },
  {
    path: '/mod',
    name: 'ModPanel',
    component: ModPanel,
    meta: { requiresModerator: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guard for moderator-only routes
router.beforeEach((to, from, next) => {
  if (to.meta.requiresModerator) {
    // TODO: Check if user is actually a moderator
    // For now, just check if they're logged in
    const token = localStorage.getItem('token')
    if (!token) {
      // Redirect to home and show login
      next('/')
      return
    }
    
    // TODO: Add actual moderator check when backend is ready
    // const user = getCurrentUser()
    // if (!user || user.role !== 'moderator') {
    //   next('/')
    //   return
    // }
  }
  
  next()
})

export default router
