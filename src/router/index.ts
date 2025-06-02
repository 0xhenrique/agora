import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Submit from '../views/Submit.vue'
import Post from '../views/Post.vue'
import ModPanel from '../views/ModPanel.vue'
import { apiService } from '../services/api'

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
router.beforeEach(async (to, _from, next) => {
  if (to.meta.requiresModerator) {
    const token = localStorage.getItem('token')
    if (!token) {
      next('/')
      return
    }
    
    try {
      // Verify token and get fresh user data
      const response = await apiService.verifyToken()
      const user = response.user
      
      if (!user.role || !['moderator', 'admin'].includes(user.role)) {
        console.warn('User lacks moderator permissions:', user)
        next('/')
        return
      }
      
      console.log('Moderator access granted for:', user.username)
      next()
    } catch (error) {
      console.error('Token verification failed:', error)
      localStorage.removeItem('token')
      next('/')
      return
    }
  } else {
    next()
  }
})

export default router
