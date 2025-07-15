// src/stores/auth.js
import { ref } from 'vue'

export const isLoggedIn = ref(false)  // default is false

export function loginUser() {
  isLoggedIn.value = true
}

export function logoutUser() {
  isLoggedIn.value = false
}
