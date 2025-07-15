<template>
  <div class="ml-[60px] p-6 min-h-screen bg-gradient-to-tr from-purple-50 via-white to-purple-100">
    <div class="max-w-5xl mx-auto">
      <h2 class="text-3xl font-bold text-purple-800 text-center mb-6 drop-shadow-md">📁 Transaction List</h2>

      <!-- Not Logged In -->
      <div v-if="!isLoggedIn && !loading" class="text-center text-gray-600 italic text-lg">
        Please log in to view your transactions.
      </div>

      <!-- Loading -->
      <div v-else-if="loading" class="text-center text-sm text-gray-500 animate-pulse">
        Loading transactions...
      </div>

      <!-- Empty -->
      <div v-else-if="transactions.length === 0" class="text-center text-gray-500 italic">
        No transactions found. Add your first one!
      </div>

      <!-- Transactions Table -->
      <div v-else class="overflow-x-auto shadow-lg rounded-xl bg-white animate-fade-in">
        <table class="min-w-full divide-y divide-gray-200 text-sm text-left text-gray-700">
          <thead class="bg-purple-600 text-white">
            <tr>
              <th class="px-6 py-4">Title</th>
              <th class="px-6 py-4">Amount</th>
              <th class="px-6 py-4">Type</th>
              <th class="px-6 py-4">Category</th>
              <th class="px-6 py-4">Date</th>
              <th class="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="txn in transactions"
              :key="txn.id"
              class="hover:bg-purple-50 transition-all group"
            >
              <td class="px-6 py-4 font-semibold text-gray-800 group-hover:text-purple-700">
                {{ getTransactionTitle(txn) }}
              </td>
              <td class="px-6 py-4">₹{{ txn.amount }}</td>
              <td class="px-6 py-4">
                <span
                  :class="txn.type === 'Income' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'"
                  class="px-2 py-1 rounded-full text-xs font-semibold"
                >
                  {{ txn.type }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                  {{ txn.category }}
                </span>
              </td>
              <td class="px-6 py-4">{{ formatDate(txn.date) }}</td>
              <td class="px-6 py-4 text-center space-x-2">
                <button
                  @click="startEditing(txn)"
                  class="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-1 rounded-md font-medium text-sm transition duration-300 transform hover:scale-105"
                >
                  ✏️ Edit
                </button>
                <button
                  @click="deleteTransaction(txn.id)"
                  class="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-md font-medium text-sm transition duration-300 transform hover:scale-105"
                >
                  🗑️ Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Edit Form -->
        <div v-if="editingTxn" class="mt-10 max-w-xl mx-auto bg-white shadow-xl rounded-2xl p-8">
          <h3 class="text-2xl font-bold text-purple-700 mb-6 text-center">✏️ Edit Transaction</h3>

          <form @submit.prevent="updateTransaction" class="space-y-5">
            <div>
              <label class="block mb-1 text-sm text-gray-700">Title</label>
              <input v-model="editTitle" type="text" required class="input-style" />
            </div>
            <div>
              <label class="block mb-1 text-sm text-gray-700">Amount</label>
              <input v-model="editAmount" type="number" required class="input-style" />
            </div>
            <div>
              <label class="block mb-1 text-sm text-gray-700">Type</label>
              <select v-model="editType" required class="input-style">
                <option disabled value="">Select Type</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
            <div>
              <label class="block mb-1 text-sm text-gray-700">Category</label>
              <input v-model="editCategory" type="text" required class="input-style" />
            </div>
            <div>
              <label class="block mb-1 text-sm text-gray-700">Date</label>
              <input v-model="editDate" type="date" required class="input-style" />
            </div>

            <div class="flex justify-between pt-4">
              <button
                type="submit"
                class="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
              >
                💾 Save Changes
              </button>
              <button
                @click="cancelEdit"
                type="button"
                class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-lg shadow transition"
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  orderBy
} from 'firebase/firestore'
import { db, auth } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'

const editingTxn = ref(null)
const editTitle = ref('')
const editAmount = ref('')
const editType = ref('')
const editCategory = ref('')
const editDate = ref('')

const transactions = ref([])
const loading = ref(true)
const isLoggedIn = ref(false)
const goals = ref([])

const getTransactionTitle = (txn) => {
  if (txn.goalId) {
    const goal = goals.value.find(g => g.id === txn.goalId)
    return goal ? `Saved for: ${goal.title}` : txn.title
  }
  return txn.title
}

const startEditing = (txn) => {
  editingTxn.value = txn
  editTitle.value = txn.title
  editAmount.value = txn.amount
  editType.value = txn.type
  editCategory.value = txn.category
  editDate.value = txn.date.toDate().toISOString().substr(0, 10)
}

const updateTransaction = async () => {
  if (!editingTxn.value) return

  try {
    const txnRef = doc(db, 'transactions', editingTxn.value.id)
    await updateDoc(txnRef, {
      title: editTitle.value,
      amount: parseFloat(editAmount.value),
      type: editType.value,
      category: editCategory.value,
      date: new Date(editDate.value),
    })

    alert('✅ Transaction updated!')
    editingTxn.value = null
    fetchTransactions(auth.currentUser.uid)
  } catch (err) {
    console.error('Error updating transaction:', err)
    alert('❌ Failed to update transaction.')
  }
}

const cancelEdit = () => {
  editingTxn.value = null
}

const fetchTransactions = async (uid) => {
  loading.value = true
  try {
    const q = query(
      collection(db, 'transactions'),
      where('uid', '==', uid),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    transactions.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (err) {
    console.error("Error fetching transactions:", err)
  } finally {
    loading.value = false
  }
}

const fetchGoals = async (uid) => {
  try {
    const q = query(
      collection(db, 'goals'),
      where('userId', '==', uid)
    )
    const snapshot = await getDocs(q)
    goals.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (err) {
    console.error("Error fetching goals:", err)
  }
}

const deleteTransaction = async (id) => {
  const confirmDelete = confirm('Are you sure you want to delete this transaction?')
  if (!confirmDelete) return

  await deleteDoc(doc(db, 'transactions', id))
  transactions.value = transactions.value.filter(txn => txn.id !== id)
}

const formatDate = (timestamp) => {
  if (!timestamp?.toDate) return ''
  return timestamp.toDate().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      isLoggedIn.value = true
      await fetchGoals(user.uid)
      await fetchTransactions(user.uid)
    } else {
      isLoggedIn.value = false
      transactions.value = []
      loading.value = false
    }
  })
})
</script>

<style scoped>
.input-style {
  width: 100%;
  padding: 10px 14px;
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

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}
</style>
