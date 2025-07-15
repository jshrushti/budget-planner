<template>
  <div class="ml-[60px] min-h-screen p-6 bg-gradient-to-tr from-purple-50 via-white to-purple-100">
    <div class="max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-8">
      <h2 class="text-2xl font-bold text-purple-700 mb-6">➕ Add New Transaction</h2>

      <form @submit.prevent="addTransaction" class="space-y-5">
        <!-- Title -->
        <div>
          <label class="block mb-1 text-sm text-gray-700">Title</label>
          <input v-model="title" type="text" required class="input-style" />
        </div>

        <!-- Amount -->
        <div>
          <label class="block mb-1 text-sm text-gray-700">Amount</label>
          <input v-model="amount" type="number" required class="input-style" />
        </div>

        <!-- Type -->
        <div>
          <label class="block mb-1 text-sm text-gray-700">Type</label>
          <select v-model="type" required class="input-style">
            <option disabled value="">Select Type</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>

        <!-- Category Dropdown -->
        <div v-if="type">
          <label class="block mb-1 text-sm text-gray-700">Category</label>
          <select v-model="category" required class="input-style">
            <option disabled value="">Select Category</option>
            <option
              v-for="cat in categoryOptions[type]"
              :key="cat"
              :value="cat"
            >
              {{ cat }}
            </option>
            <option value="Custom">Other (Add your own)</option>
          </select>
        </div>

        <!-- Custom Category Input -->
        <div v-if="category === 'Custom'">
          <label class="block mb-1 text-sm text-gray-700">Custom Category</label>
          <input v-model="customCategory" type="text" required class="input-style" placeholder="Enter your category" />
        </div>

        <!-- Date Picker -->
        <div>
          <label class="block mb-1 text-sm text-gray-700">Date</label>
          <input v-model="date" type="date" required class="input-style" />
        </div>
          <br> <br>
        <!-- Submit -->
        <button
          type="submit"
          class="bg-purple-600 text-white w-full py-2 rounded-lg hover:bg-purple-700 transition font-semibold"
        >
          💾 Save Transaction
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { db, auth } from '@/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

// Form fields
const title = ref('')
const amount = ref('')
const type = ref('')
const category = ref('')
const customCategory = ref('')
const date = ref(new Date().toISOString().substr(0, 10)) // Default: today's date
const uid = ref('')

// Income and Expense Categories
const categoryOptions = {
  Income: [
    'Salary',
    'Freelancing',
    'Business',
    'Investment Returns',
    'Rental Income',
    'Gift/Bonus',
    'Refunds',
  ],
  Expense: [
    'Food & Dining',
    'Groceries',
    'Transportation',
    'Bills & Utilities',
    'Entertainment',
    'Health & Medical',
    'Shopping',
    'Education',
    'Subscriptions',
    'Travel',
    'Rent',
    'Insurance',
    'Loan EMI',
    'Pets',
  ],
}

// Get UID
onAuthStateChanged(auth, (user) => {
  if (user) uid.value = user.uid
})

// Submit handler
const addTransaction = async () => {
  if (!uid.value) {
    alert('User not authenticated.')
    return
  }

  const chosenCategory = category.value === 'Custom' ? customCategory.value.trim() : category.value

  if (!chosenCategory) {
    alert('Please enter a category.')
    return
  }

  try {
    await addDoc(collection(db, 'transactions'), {
      title: title.value.trim(),
      amount: parseFloat(amount.value),
      type: type.value,
      category: chosenCategory,
      date: new Date(date.value), // saved as Timestamp
       uid: auth.currentUser.uid,
      createdAt: serverTimestamp(),
    })

    alert('✅ Transaction added successfully!')

    // Reset form
    title.value = ''
    amount.value = ''
    type.value = ''
    category.value = ''
    customCategory.value = ''
    date.value = new Date().toISOString().substr(0, 10)
  } catch (error) {
    console.error('Error adding transaction:', error)
    alert('❌ Failed to add transaction.')
  }
}
</script>

<style scoped>
.input-style {
  width: 100%;
  max-width: 500px;
  padding: 14px 14px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #f9f9fc;
  font-size: 14px;
  transition: 0.2s;
}
.input-style:focus {
  border-color: #a78bfa;
  outline: none;
  background-color: #f4f3ff;
}
button {
  background-color: #7c3aed;
  color: white;
  padding: 10px 15px;
  border-radius: 10px;
  font-weight: 500;
  margin-bottom: 12px;
  transition: 0.3s ease;
  border: none;
  cursor: pointer;
  max-width: 500px;
}
</style>
