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
    const token = localStorage.getItem('token')
    if (!token) {
      next('/')
      return
    }
    
    // Check if user has moderator role
    const userData = localStorage.getItem('userData')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (!user.role || !['moderator', 'admin'].includes(user.role)) {
          next('/')
          return
        }
      } catch (e) {
        next('/')
        return
      }
    } else {
      next('/')
      return
    }
  }
  
  next()
})

export default router
