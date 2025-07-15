

<script setup>
import { ref, onMounted } from 'vue'
import { auth, db } from '@/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import {
  updateEmail,
  updatePassword,
} from 'firebase/auth' 

const name = ref('')
const email = ref('')
const password = ref('')
const uid = auth.currentUser?.uid

onMounted(async () => {
  if (!uid) return
  const docRef = doc(db, 'users', uid)
  const snapshot = await getDoc(docRef)
  if (snapshot.exists()) {
    const data = snapshot.data()
    name.value = data.name
    email.value = data.email
  }
})

const updateProfile = async () => {
  try {
    const user = auth.currentUser
    if (!user) return

    // ✅ REMOVE verification check
    if (email.value !== user.email) {
      await updateEmail(user, email.value)
    }

    if (password.value) {
      await updatePassword(user, password.value)
    }

    await updateDoc(doc(db, 'users', uid), {
      name: name.value,
      email: email.value
    })

    alert('✅ Profile updated successfully!')
    password.value = ''
  } catch (err) {
    console.error('Error:', err)
    alert('❌ Failed to update profile: ' + err.message)
  }
}
</script>

<template>
  <div class="ml-[60px] min-h-screen p-6 bg-gradient-to-br from-purple-50 via-white to-purple-100">
    <div class="max-w-xl mx-auto bg-white shadow-2xl rounded-2xl px-8 py-10 animate-fade-in">
      <h2 class="text-3xl font-extrabold text-purple-700 mb-8 text-center">👤 Edit Profile</h2>

      <form @submit.prevent="updateProfile" class="space-y-6">
        <div>
          <label class="label">Name</label>
          <input v-model="name" class="input" type="text" required />
        </div>

        <div>
          <label class="label">Email</label>
          <input v-model="email" class="input" type="email" required />
        </div>

        <div>
          <label class="label">New Password (optional)</label>
          <input v-model="password" class="input" type="password" />
        </div>
        <br>
        <div class="space-y-3 pt-4">
          <button type="submit" class="btn-primary w-full">
            💾 Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 12px;
  background-color: #f9fafb;
  font-size: 15px;
  transition: all 0.2s ease;
}
.input:focus {
  border-color: #a78bfa;
  background-color: #f4f3ff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.2);
}

.label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #117279b2;
  margin-bottom: 6px;
}

.btn-primary {
  background-color: #117279b2;
  color: white;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  transition: background 0.3s ease;
  border: none;
}
.btn-primary:hover {
  background-color: #53a2cf;
  transform: scale(1.02);
}

.btn-secondary {
  background-color: #e0e7ff;
  color: #4338ca;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  transition: background 0.3s ease;
  border: none;
}
.btn-secondary:hover {
  background-color: #c7d2fe;
  transform: scale(1.02);
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
