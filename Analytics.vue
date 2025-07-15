<template>
  <div class="max-w-5xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-md animate-fade-in">
    <h2 class="text-3xl font-bold text-center text-purple-800 mb-6">📊 Spending Breakdown</h2>

    <div class="flex justify-center mb-6 space-x-4">
      <button
        @click="selectedChart = 'bar'"
        :class="[
          'px-4 py-2 rounded-full font-semibold transition duration-300',
          selectedChart === 'bar'
            ? 'bg-purple-600 text-white shadow-md'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        Bar Chart
      </button>
      <button
        @click="selectedChart = 'pie'"
        :class="[
          'px-4 py-2 rounded-full font-semibold transition duration-300',
          selectedChart === 'pie'
            ? 'bg-purple-600 text-white shadow-md'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        Pie Chart
      </button>
    </div>

    <!-- Charts -->
    <div v-if="chartData.labels.length > 0" class="flex justify-center">
      <div v-if="selectedChart === 'bar'" class="w-[300px] sm:w-[400px] md:w-[500px] h-[300px]">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
      <div v-else class="w-[250px] sm:w-[300px] md:w-[350px] h-[280px]">
        <Pie :data="pieData" :options="pieOptions" />
      </div>
    </div>

    <div v-else-if="!loading" class="text-center text-gray-400 mt-6">
      Not enough data to display chart.
    </div>

    <div v-else class="text-center text-gray-400 mt-6 animate-pulse">
      Loading chart...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { Bar, Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend)

const selectedChart = ref('bar')
const chartData = ref({
  labels: [],
  datasets: [{
    label: 'Total Expenses by Category',
    backgroundColor: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#14B8A6'],
    data: [],
    borderRadius: 8,
  }]
})

const pieData = ref({
  labels: [],
  datasets: [{
    label: 'Expenses',
    backgroundColor: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#14B8A6'],
    data: [],
  }]
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#4B5563',
        font: { size: 14 }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: '#6B7280',
        font: { size: 13 }
      }
    },
    x: {
      ticks: {
        color: '#6B7280',
        font: { size: 13 }
      }
    }
  }
}

const pieOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#374151',
        font: { size: 13 }
      }
    }
  }
}

const loading = ref(true)

const fetchChartData = async (uid) => {
  try {
    const db = getFirestore()
    const q = query(collection(db, 'transactions'), where('uid', '==', uid))
    const snapshot = await getDocs(q)

    const totals = {}
    snapshot.forEach(doc => {
      const { category, amount, type } = doc.data()
      if (type === 'Expense' && category) {
        totals[category] = (totals[category] || 0) + Number(amount)
      }
    })

    const labels = Object.keys(totals)
    const values = Object.values(totals)

    chartData.value.labels = labels
    chartData.value.datasets[0].data = values

    pieData.value.labels = labels
    pieData.value.datasets[0].data = values
  } catch (err) {
    console.error('Chart loading error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchChartData(user.uid)
    } else {
      loading.value = false
    }
  })
})
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.4s ease-in-out;
}
</style>
