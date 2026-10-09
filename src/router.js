import { createRouter, createWebHistory } from 'vue-router'
import store from '@/modules/store'

const routes = [
  {
    path: '/',
    name: 'Homepage',
    component: () => import('@/components/layout/BaseLayout.vue'),
    redirect: {
      name: 'AdminLayout'
    },
    children: [
      {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue')
      },
      {
        path: '/logout',
        name: 'Logout',
        component: () => import('@/views/Logout.vue')
      },
      {
        path: '/',
        name: 'AdminLayout',
        component: () => import('@/components/layout/AdminLayout.vue'),
        redirect: {
          name: 'ProjectList'
        },
        children: [
          {
            path: 'projects',
            name: 'ProjectList',
            component: () => import('@/views/ProjectList.vue')
          },
          {
            path: 'users',
            name: 'UserList',
            component: () => import('@/views/UserList.vue')
          },
          {
            path: 'issues',
            name: 'IssueList',
            component: () => import('@/views/IssueList.vue')
          },
          {
            path: 'files',
            name: 'FileList',
            component: () => import('@/views/FileList.vue')
          },
          {
            path: 'docs',
            name: 'DocList',
            component: () => import('@/views/DocList.vue')
          },
          {
            path: 'docs/:docId',
            name: 'DocView',
            component: () => import('@/views/DocView.vue')
          }
        ]
      }
    ]
  }
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  let user = store.get('user')
  const publicRoutes = ['BaseLayout', 'Login']
  if (!publicRoutes.includes(to.name) && !user) {
    localStorage.setItem('lastUrl', to.fullPath)
    console.warn('Requested url rejected: ' + to.fullPath)
    next({ name: 'Login' })
    return
  }

  next()
})

export default router
