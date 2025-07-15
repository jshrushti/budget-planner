import { ref } from 'vue'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/firebase' // make sure this path points to your firebase.js file

// ✅ Reactive login state flag
export const isLoggedIn = ref(!!localStorage.getItem('loggedIn'))

// ✅ Get current user ID (may return null on page reload)
export function getCurrentUserId() {
  const currentAuth = getAuth()
  return currentAuth.currentUser ? currentAuth.currentUser.uid : null
}

// ✅ Wait for Firebase to resolve auth state (use in onMounted for safe access)
export function waitForUserAuth() {
  const currentAuth = getAuth()
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(currentAuth, (user) => {
      unsubscribe()
      resolve(user)
    }, reject)
  })
}

// ✅ Logout logic
export async function logoutUser() {
  await signOut(auth)
  isLoggedIn.value = false
  localStorage.removeItem('loggedIn')
}
