<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-100 via-white to-purple-200 px-4">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center text-purple-700">🔐 Log In</h2>

      <p v-if="error" class="text-red-600 text-center mb-4 text-sm font-medium">{{ error }}</p>

      <form @submit.prevent="login" class="space-y-5">
        <div>
          <label class="block mb-1 text-sm text-gray-700">Email</label>
          <input v-model="email" type="email" required class="input-style" placeholder="you@example.com" />
        </div>

        <div>
          <label class="block mb-1 text-sm text-gray-700">Password</label>
          <input v-model="password" type="password" required class="input-style" placeholder="********" />
        </div>
        <br><br>
        <div class="flex justify-center">
          <button type="submit" class="btn-style">🔓 Log In</button>
        </div>

        <p class="text-center text-sm mt-4">
          Don't have an account?
          <router-link to="/signup" class="text-purple-600 hover:underline font-semibold">Sign up</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const login = async () => {
  try {
    const auth = getAuth()
    await signInWithEmailAndPassword(auth, email.value, password.value)
    router.push('/dashboard')
  } catch (err) {
    error.value = 'Invalid email or password'
  }
}
</script>

<style scoped>
.input-style {
  width: 1400px;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #f3f0ff;
  font-size: 14px;
  transition: 0.2s ease;
}

.input-style:focus {
  border-color: #a78bfa;
  outline: none;
  background-color: #ede9fe;
}

.btn-style {
  width: 100%;
  max-width: 220px;
  padding: 10px 14px;
  background-color: #7c3aed;
  color: white;
  font-weight: 600;
  border-radius: 10px;
  transition: 0.2s ease;
  text-align: center;
}
</style>
