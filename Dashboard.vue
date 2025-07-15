<template>
  <div class="ml-[60px] p-4">
    <div>
      <h2 class="text-2xl font-bold text-purple-700 mb-6">👋 Hi, {{ userName }}</h2>

      <!-- 💳 Summary Cards in One Row -->
      <div class="flex flex-col md:flex-row gap-6 mb-8">
        <div class="card income-card">
          <p class="text-sm font-medium">💰 Income</p>
          <p class="text-2xl font-bold mt-1">₹ {{ totalIncome }}</p>
        </div>
        <div class="card expense-card">
          <p class="text-sm font-medium">🧾 Expenses</p>
          <p class="text-2xl font-bold mt-1">₹ {{ totalExpense }}</p>
        </div>
        <div class="card balance-card">
          <p class="text-sm font-medium">🧮 Balance</p>
          <p class="text-2xl font-bold mt-1">₹ {{ totalBalance }}</p>
        </div>
      </div>

      <!-- 📍 Quick Buttons -->
      <div class="flex flex-wrap justify-between items-center mb-6 gap-2">
        <h3 class="text-lg font-semibold text-purple-700">🧾 Recent Transactions</h3>
        <div class="flex gap-2">
          <router-link to="/add" class="quick-btn">➕ Add Transaction</router-link>
          <router-link to="/transactions" class="quick-btn">📄 View All</router-link>
        </div>
      </div>

      <!-- 🔄 Recent Transactions -->
      <div v-if="recentTransactions.length > 0" class="space-y-4">
        <div
          v-for="tx in recentTransactions"
          :key="tx.id"
          class="recent-item hover:shadow-md transition"
        >
          <div class="flex justify-between items-center">
            <div>
              <p class="font-medium text-gray-700">{{ tx.title }}</p>
              <p class="text-sm text-gray-500">{{ formatDate(tx.date) }}</p>
            </div>
            <p :class="tx.type === 'Income' ? 'text-green-600' : 'text-red-600'">
              ₹ {{ tx.amount }}
            </p>
          </div>
        </div>
      </div>
      <div v-else class="text-gray-500">No transactions yet.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { auth, db } from '@/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const userName = ref('User')
const uid = ref('')
const transactions = ref([])

const totalIncome = ref(0)
const totalExpense = ref(0)
const totalBalance = ref(0)
const recentTransactions = ref([])

const formatDate = (timestamp) => {
  if (!timestamp?.toDate) return ''
  const date = timestamp.toDate()
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      uid.value = user.uid

      const userDoc = await getDoc(doc(db, 'users', uid.value))
      if (userDoc.exists()) {
        userName.value = userDoc.data().name || 'User'
      }

      const q = query(
        collection(db, 'transactions'),
        where('uid', '==', uid.value),
        orderBy('date', 'desc')
      )
      const snapshot = await getDocs(q)
      transactions.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      calculateSummary()
      recentTransactions.value = transactions.value.slice(0, 3)
    }
  })
})

const calculateSummary = () => {
  let income = 0
  let expense = 0

  transactions.value.forEach(tx => {
    if (tx.type === 'Income') income += tx.amount
    else if (tx.type === 'Expense') expense += tx.amount
  })

  totalIncome.value = income
  totalExpense.value = expense
  totalBalance.value = income - expense
}
</script>

<style scoped>
.card {
  flex: 1;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease-in-out;
  min-width: 200px;
}
.card:hover {
  transform: translateY(-3px);
}
.income-card {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #065f46;
  border: 1px solid #a7f3d0;
}
.expense-card {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #991b1b;
  border: 1px solid #fecaca;
}
.balance-card {
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
  color: #5b21b6;
  border: 1px solid #ddd6fe;
}
.recent-item {
  @apply bg-white p-4 rounded-xl border border-purple-100;
}
.quick-btn {
  @apply bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition duration-300;
}
</style>
