import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

import DashboardLayout from '@/layouts/DashboardLayout.vue'

import Dashboard from '@/views/Dashboard.vue'
import AddTransactions from '@/views/AddTransactions.vue'
import TransactionList from '@/views/TransactionList.vue'
import Analytics from '@/views/Analytics.vue'
import Goals from '@/views/Goals.vue'
import Monthly from '@/views/Monthly.vue'

import Login from '@/views/Login.vue'
import Signup from '@/views/Signup.vue'

const routes = [
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true }, // apply to all children
    children: [
      { path: '', redirect: 'dashboard' }, // ✅ default route inside layout
      { path: 'dashboard', component: Dashboard },
      { path: 'add', component: AddTransactions },
      { path: 'transactions', component: TransactionList },
      { path: 'analytics', component: Analytics },
      { path: 'goals', component: Goals },
      { path: 'monthly', component: Monthly },
      {
        path: 'edit-profile',
        name: 'EditProfile',
        component: () => import('@/views/EditProfile.vue'),
        meta: { requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ✅ Global auth guard
router.beforeEach((to, from, next) => {
  const auth = getAuth()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth) {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe()
      if (user) {
        next()
      } else {
        next('/signup')
      }
    })
  } else {
    next()
  }
})

export default router
