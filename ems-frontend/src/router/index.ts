import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // { path: '/login', component: () => import('@/views/auth/LoginView.vue'), meta: { public: true } },
    // { path: '/', component: () => import('@/views/dashboard/DashboardView.vue') },
    // { path: '/students', component: () => import('@/views/students/StudentListView.vue') },
    // { path: '/courses', component: () => import('@/views/courses/CourseListView.vue') },
    // { path: '/enrollments', component: () => import('@/views/enrollments/EnrollmentListView.vue') },
  ]
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isAuthenticated) {
    return '/login'
  }
})

export default router