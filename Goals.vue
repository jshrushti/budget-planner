<script setup>
import { ref, onMounted } from 'vue'
import { db, auth } from '@/firebase'
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'

const goals = ref([])
const transactions = ref([])
const title = ref('')
const amount = ref('')
const targetMonth = ref('')
const description = ref('')
const saveAmounts = ref({})
const editGoalId = ref(null)

async function fetchGoals() {
  const userId = auth.currentUser?.uid
  if (!userId) return

  const q = query(collection(db, 'goals'), where('userId', '==', userId))
  const snapshot = await getDocs(q)
  goals.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

async function fetchTransactions() {
  const userId = auth.currentUser?.uid
  if (!userId) return

  const q = query(collection(db, 'transactions'), where('uid', '==', userId))
  const snapshot = await getDocs(q)
  transactions.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

function editGoal(goal) {
  editGoalId.value = goal.id
  title.value = goal.title
  amount.value = goal.amount
  targetMonth.value = goal.targetMonth
  description.value = goal.description || ''
}

async function addGoal() {
  const userId = auth.currentUser?.uid
  if (!userId) {
    alert('User not logged in.')
    return
  }

  if (!title.value || !amount.value || !targetMonth.value) {
    alert('Please fill in all required fields.')
    return
  }

  if (editGoalId.value) {
    const goalRef = doc(db, 'goals', editGoalId.value)

    const oldGoal = goals.value.find(g => g.id === editGoalId.value)
    const oldTitle = oldGoal?.title

    await updateDoc(goalRef, {
      title: title.value,
      amount: parseFloat(amount.value),
      targetMonth: targetMonth.value,
      description: description.value,
    })

    const txnQuery = query(
      collection(db, 'transactions'),
      where('uid', '==', userId)
    )
    const snapshot = await getDocs(txnQuery)

    snapshot.forEach(async (docSnap) => {
      const txn = docSnap.data()
      if (txn.goalId === editGoalId.value) {
        await updateDoc(doc(db, 'transactions', docSnap.id), {
          title: `Saved for: ${title.value}`
        })
      }
    })

    editGoalId.value = null
  } else {
    await addDoc(collection(db, 'goals'), {
      title: title.value,
      amount: parseFloat(amount.value),
      targetMonth: targetMonth.value,
      description: description.value,
      userId
    })
  }

  title.value = ''
  amount.value = ''
  targetMonth.value = ''
  description.value = ''
  await fetchGoals()
  await fetchTransactions()
}

async function deleteGoal(goalId, goalTitle) {
  const userId = auth.currentUser?.uid
  if (!userId) return

  await deleteDoc(doc(db, 'goals', goalId))
  const txnQuery = query(
    collection(db, 'transactions'),
    where('uid', '==', userId),
    where('goalId', '==', goalId)
  )
  const txnSnapshot = await getDocs(txnQuery)
  txnSnapshot.forEach(async (docSnap) => {
    await deleteDoc(doc(db, 'transactions', docSnap.id))
  })

  await fetchGoals()
  await fetchTransactions()
}

function confirmAndDelete(goal) {
  const confirmDelete = confirm(`Are you sure you want to delete "${goal.title}"?\nAll saved amounts related to this goal will also be deleted.`)
  if (confirmDelete) {
    deleteGoal(goal.id, goal.title)
  }
}

async function saveForGoal(goalId, goalTitle) {
  const amt = parseFloat(saveAmounts.value[goalId])
  const user = auth.currentUser

  if (!amt || amt <= 0 || !user) {
    alert("Enter a valid amount or make sure you're logged in.")
    return
  }

  const today = new Date()

  await addDoc(collection(db, 'transactions'), {
    title: `Saved for: ${goalTitle}`,
    amount: amt,
    type: 'Expense',
    category: 'Savings',
    date: today,
    uid: user.uid,
    goalId: goalId
  })

  saveAmounts.value[goalId] = ''
  await fetchTransactions()
}

const getGoalProgress = (goal) => {
  const relatedTxns = transactions.value.filter(txn =>
    txn.goalId === goal.id &&
    txn.type === 'Expense' &&
    txn.category === 'Savings'
  )

  const totalSaved = relatedTxns.reduce((sum, txn) => sum + Number(txn.amount), 0)
  const percentage = Math.min((totalSaved / goal.amount) * 100, 100)
  return { totalSaved, percentage }
}

onMounted(() => {
  fetchGoals()
  fetchTransactions()
})
</script>


<template>
  <div class="ml-[60px]">
    <div class="max-w-3xl mx-auto p-6">
      <h2 class="text-3xl font-bold mb-6 text-purple-700 text-center">🎯 Savings Goals</h2>

      <form @submit.prevent="addGoal" class="bg-white p-6 rounded-xl shadow-md space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input v-model="title" type="text" placeholder="Goal Title *" class="form-input" />
          <input v-model="amount" type="number" placeholder="Target Amount *" class="form-input" />
          <input v-model="targetMonth" type="month" class="form-input" />
          <input v-model="description" type="text" placeholder="Description (optional)" class="form-input" />
        </div>
        <br>
        <div class="text-center">
          <button class="gradient-btn mt-4">
            {{ editGoalId ? '✏️ Update Goal' : '➕ Add Goal' }}
          </button>
        </div>
      </form>
       <br>
      <div class="mt-10 space-y-6">
        <div v-if="goals.length === 0" class="text-gray-500 text-center">No goals yet. Add one above!</div>

        <div v-for="goal in goals" :key="goal.id" class="bg-purple-50 p-5 rounded-xl shadow">
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-semibold text-purple-800">{{ goal.title }}</h3>
            <div class="space-x-2">
              <button @click="editGoal(goal)" class="gradient-btn mt-4">✏️ Edit</button>
              <button @click="confirmAndDelete(goal)" class="gradient-btn mt-4">🗑️ Delete</button>
            </div>
          </div>
          <p class="text-sm text-gray-600">🎯 ₹{{ goal.amount }} | 📅 {{ goal.targetMonth }}</p>
          <p class="text-sm text-gray-500 italic" v-if="goal.description">{{ goal.description }}</p>

          <div class="mt-2">
            <div class="w-full bg-purple-200 h-4 rounded">
              <div
                class="h-4 bg-purple-600 rounded transition-all duration-500"
                :style="{ width: getGoalProgress(goal).percentage + '%' }"
              ></div>
            </div>
            <p class="text-sm mt-1 text-purple-800">
              Saved ₹{{ getGoalProgress(goal).totalSaved }} / ₹{{ goal.amount }}
              ({{ getGoalProgress(goal).percentage.toFixed(1) }}%)
            </p>
          </div>

          <div class="mt-4 flex items-center gap-2">
            <input
              v-model="saveAmounts[goal.id]"
              type="number"
              placeholder="Enter amount to save"
              class="form-input w-48"
            />
            <button class="gradient-btn" @click.prevent="saveForGoal(goal.id, goal.title)">
              💾 Save Amount
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-input {
  padding: 12px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  transition: 0.3s ease;
  background-color: #fafafa;
}
.form-input:focus {
  border-color: #a855f7;
  outline: none;
  background-color: white;
  box-shadow: 0 0 0 2px #ddd6fe;
}
.gradient-btn {
  padding: 10px 24px;
  font-weight: bold;
  background: linear-gradient(to right, #8b5cf6, #9333ea);
  color: white;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: none;
  outline: none;
}
.gradient-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 10px rgba(147, 51, 234, 0.3);
}
</style>
