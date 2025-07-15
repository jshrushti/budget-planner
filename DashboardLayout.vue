<template>
  <div class="flex">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1 class="logo">💸 trackIt</h1>
       <p class="user-email">👤 {{ userName }}</p>

      </div>

      <nav class="menu">
        <router-link
          v-for="item in menuItems"
          :key="item.name"
          :to="item.path"
          class="menu-item"
          active-class="active"
        >
          <span class="icon">{{ item.icon }}</span>
          <span class="label">{{ item.name }}</span>
        </router-link>
      </nav>
<div class="sidebar-buttons">
      <button @click="goToEditProfile" class="logout-button">
        👤 Edit Profile
      </button> 
      <button @click="handleLogout" class="logout-button">
        🚪 Logout
      </button>
    </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto bg-gradient-to-tr from-purple-50 via-white to-purple-100 p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/firebase'
import { signOut } from 'firebase/auth'

const router = useRouter()
const userName = ref('')
const goToEditProfile = () => {
  router.push('/edit-profile')
}

onMounted(() => {          
  const user = auth.currentUser
  if (user) {
    // Use displayName if available, fallback to email
    userName.value = user.displayName || 'Welcome!'
  }
})


const handleLogout = async () => {
  try {
    await signOut(auth)
    alert('Logged out successfully!')
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
    alert('Something went wrong. Please try again.')
  }
}

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: '📊' },
  { name: 'Add Transaction', path: '/add', icon: '➕' },
  { name: 'Transactions', path: '/transactions', icon: '📁' },
  { name: 'Analytics', path: '/analytics', icon: '📈' },
  { name: 'Monthly View', path: '/monthly', icon: '📅' },
  { name: 'Goals', path: '/goals', icon: '🎯' }
]
</script>

<style scoped>
.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 230px;
  background: #f9f5ff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-shadow: 2px 0 8px rgba(100, 100, 111, 0.1);
  border-radius: 0 20px 20px 0;
}

.sidebar-header {
  margin-bottom: 20px;
  text-align: center;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #7c3aed;
}

.user-email {
  font-size: 14px;
  color: #6b7280;
  margin-top: 5px;
  word-break: break-word;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 15px;
  font-weight: 500;
  border-radius: 12px;
  color: #5b21b6;
  background-color: transparent;
  transition: 0.3s ease;
  text-decoration: none;
}

.menu-item:hover {
  background-color: #ede9fe;
  transform: scale(1.02);
}

.menu-item.active {
  background-color: #c4b5fd;
  color: white;
}

.icon {
  font-size: 18px;
}

.label {
  font-size: 16px;
}

.logout-button {
  background-color: #7c3aed;
  color: white;
  padding: 10px 15px;
  border-radius: 10px;
  font-weight: 500;
  margin-bottom: 12px; /* Stack spacing */
  transition: 0.3s ease;
  border: none;
  cursor: pointer;
  width: 100%; /* Full width in sidebar */
}

.logout-button:hover {
  background-color: #6d28d9;
  transform: scale(1.03);
}

.sidebar-buttons {
  display: flex;
  flex-direction: column;
  margin-top: auto;
  padding: 20px;
}
</style>
