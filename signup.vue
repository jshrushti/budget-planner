<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-100 via-white to-purple-200 px-4">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center text-purple-700">📝 Create an Account</h2>

      <form @submit.prevent="handleSignup" class="flex flex-col space-y-4">
        <div class="flex flex-col">
          <label class="mb-1 text-sm text-gray-700">Full Name</label>
          <input v-model="name" type="text" required class="input-style" />
        </div>

        <div class="flex flex-col">
          <label class="mb-1 text-sm text-gray-700">Email</label>
          <input v-model="email" type="email" required class="input-style" />
        </div>

        <div class="flex flex-col">
          <label class="mb-1 text-sm text-gray-700">Password</label>
          <input v-model="password" type="password" required class="input-style" />
        </div>
        <br> <br>
        <!-- ✅ CENTERED BUTTON WITH SAME WIDTH AS INPUT -->
        <div class="flex justify-center">
          <button type="submit" class="btn-style">🚀 Sign Up</button>
        </div>

        <p class="text-center text-sm mt-2">
          Already have an account?
          <router-link to="/login" class="text-purple-600 hover:underline">Login</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { auth, db } from '@/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useRouter } from 'vue-router'

const name = ref('')
const email = ref('')
const password = ref('')
const router = useRouter()

const handleSignup = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user

    await setDoc(doc(db, 'users', user.uid), {
      userId: user.uid,
      name: name.value,
      email: email.value,
      createdAt: serverTimestamp()
    })

    alert('Signup successful!')
    router.push('/dashboard')
  } catch (err) {
    console.error('Signup error:', err)
    alert(err.message)
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

.btn-style:hover {
  background-color: #6d28d9;
}
</style>
