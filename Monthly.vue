<template>
  <div class="ml-[60px] min-h-screen p-6 bg-gradient-to-tr from-purple-100 via-white to-purple-200 font-sans">
    <!-- Month Picker -->
    <div class="max-w-xl mx-auto mb-8 text-center">
      <h2 class="text-3xl font-bold text-purple-800 mb-3 tracking-wide"> 📅  Monthly Summary</h2>
      <select
        v-model="selectedMonth"
        class="p-3 w-full rounded-xl border border-purple-300 shadow-md bg-white text-gray-700 font-medium focus:ring-2 focus:ring-purple-400"
      >
        <option v-for="month in months" :key="month.value" :value="month.value">
          {{ month.label }}
        </option>
      </select>
    </div>

    <!-- Insights -->
    <div v-if="insights.length" class="max-w-4xl mx-auto grid sm:grid-cols-2 gap-4 mb-10">
      <div
        v-for="(insight, i) in insights"
        :key="i"
        class="flex items-center p-4 rounded-xl shadow-md bg-white border-l-4"
        :class="insight.bg"
      >
        <span class="text-2xl mr-3">{{ insight.emoji }}</span>
        <span class="text-gray-800 font-medium">{{ insight.text }}</span>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="max-w-4xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-md">
      <h3 class="text-xl font-semibold text-purple-800 mb-4">📈 Spending Trend This Month</h3>
      <canvas id="summaryChart" height="120"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { db } from '@/firebase'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { format, parse } from 'date-fns'
import { Chart, registerables } from 'chart.js'
import { getCurrentUserId } from '@/stores/auth'

Chart.register(...registerables)

const userId = getCurrentUserId()
const selectedMonth = ref(format(new Date(), 'MMMM yyyy'))
const transactions = ref([])
const chartInstance = ref(null)

// Month options for dropdown
const months = Array.from({ length: 12 }, (_, i) => {
  const date = new Date(new Date().getFullYear(), i, 1)
  return {
    label: format(date, 'MMMM yyyy'),
    value: format(date, 'MMMM yyyy')
  }
})

// Fetch live user transactions
onMounted(() => {
  if (!userId) return

  const q = query(collection(db, 'transactions'), where('uid', '==', userId))
  onSnapshot(q, (snapshot) => {
    transactions.value = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        ...data,
        date: data.date?.toDate?.() || new Date()
      }
    })
  })
})

// Filter by selected month & type: Expense
const filtered = computed(() => {
  const sel = parse(selectedMonth.value, 'MMMM yyyy', new Date())
  return transactions.value.filter(txn =>
    txn.date.getMonth() === sel.getMonth() &&
    txn.date.getFullYear() === sel.getFullYear() &&
    txn.type === 'Expense'
  )
})

// Daily spending for chart
const dailyData = computed(() => {
  const sel = parse(selectedMonth.value, 'MMMM yyyy', new Date())
  const days = new Date(sel.getFullYear(), sel.getMonth() + 1, 0).getDate()
  const map = {}
  for (let i = 1; i <= days; i++) {
    map[i] = 0
  }
  filtered.value.forEach(txn => {
    const day = txn.date.getDate()
    map[day] += txn.amount
  })
  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    amount: map[i + 1] || 0
  }))
})

// Insights
const insights = computed(() => {
  const catSum = {}
  filtered.value.forEach(txn => {
    catSum[txn.category] = (catSum[txn.category] || 0) + txn.amount
  })
  const entries = Object.entries(catSum).sort((a, b) => b[1] - a[1])
  const result = []

  if (entries.length) {
    result.push({
      emoji: '🍿',
      text: `Most spent on ${entries[0][0]}: ₹${entries[0][1].toFixed(0)}`,
      bg: 'border-red-400'
    })
  }

  const under = entries.find(([_, amt]) => amt < 1000)
  if (under) {
    result.push({
      emoji: '🛒',
      text: `Under budget in ${under[0]}`,
      bg: 'border-green-400'
    })
  }

  return result
})

// Draw Line Chart
watch([dailyData, selectedMonth], async () => {
  await nextTick()
  const ctx = document.getElementById('summaryChart')?.getContext('2d')
  if (!ctx) return

  if (chartInstance.value) chartInstance.value.destroy()

  const labels = dailyData.value.map(d => d.day)
  const data = dailyData.value.map(d => d.amount)

  chartInstance.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Daily Expenses',
          data,
          borderColor: '#9333ea',
          backgroundColor: 'rgba(147, 51, 234, 0.2)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#4b0082' } }
      },
      scales: {
        x: { ticks: { color: '#555' } },
        y: {
          beginAtZero: true,
          ticks: { color: '#555' }
        }
      }
    }
  })
})
</script>

