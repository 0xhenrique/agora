import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Submit from '../views/Submit.vue'
import Post from '../views/Post.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
