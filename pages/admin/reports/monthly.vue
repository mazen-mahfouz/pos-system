<template>
  <div class="px-6">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Monthly Report</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- Date Filter -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center space-x-4">
          <USelect
            v-model="selectedMonth"
            :options="months"
            placeholder="Select Month"
            class="w-48"
          />
          <USelect
            v-model="selectedYear"
            :options="years"
            placeholder="Select Year"
            class="w-48"
          />
          <UButton
            color="primary"
            variant="solid"
            @click="fetchMonthlyReport"
          >
            Apply Filter
          </UButton>
        </div>
        <div>
          <UButton
            color="green"
            variant="soft"
            icon="i-heroicons-document-arrow-down"
            class="mr-2"
            @click="exportToExcel"
          >
            Export to Excel
          </UButton>
          <UButton
            color="red"
            variant="soft"
            icon="i-heroicons-document-arrow-down"
            @click="exportToPDF"
          >
            Export to PDF
          </UButton>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div class="flex items-center gap-2">
            <div class="bg-green-100 rounded-full p-2">
              <Icon name="mdi:cash-multiple" size="20" class="text-blue-600" />
            </div>
            <h3 class="text-sm font-medium text-gray-600">Total Revenue</h3>
          </div>
          <p class="text-2xl font-bold text-blue-600 mt-2">
            {{ formatNumber(calculateTotal('total_revenue')) }}
          </p>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div class="flex items-center gap-2">
            <div class="bg-blue-100 rounded-full p-2">
              <Icon name="mdi:receipt" size="20" class="text-purple-600" />
            </div>
            <h3 class="text-sm font-medium text-gray-600">Total Services</h3>
          </div>
          <p class="text-2xl font-bold text-purple-600 mt-2">
            {{ formatNumber(calculateTotal('total_services')) }}
          </p>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div class="flex items-center gap-2">
            <div class="bg-purple-100 rounded-full p-2">
              <Icon name="mdi:percent" size="20" class="text-green-600" />
            </div>
            <h3 class="text-sm font-medium text-gray-600">Total Tax</h3>
          </div>
          <p class="text-2xl font-bold text-green-600 mt-2">
            {{ formatNumber(calculateTotal('total_tax')) }}
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div class="flex items-center gap-2">
            <div class="bg-yellow-100 rounded-full p-2">
              <Icon name="mdi:cart" size="20" class="text-yellow-600" />
            </div>
            <h3 class="text-sm font-medium text-gray-600">Total Sales</h3>
          </div>
          <p class="text-2xl font-bold text-yellow-600 mt-2">
            {{ formatNumber(calculateTotal('total_sub_total')) }}
          </p>
        </div>
      </div>

      <!-- Payment Methods Summary -->
      <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Payment Methods</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-2">
              <Icon name="mdi:cash" size="20" class="text-gray-600" />
              <span class="text-gray-600">Cash Payments</span>
            </div>
            <span class="font-bold text-gray-900">
              {{ formatNumber(calculateTotal('total_payment_method_1')) }}
            </span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-2">
              <Icon name="mdi:credit-card" size="20" class="text-gray-600" />
              <span class="text-gray-600">Card Payments</span>
            </div>
            <span class="font-bold text-gray-900">
              {{ formatNumber(calculateTotal('total_payment_method_2')) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Revenue Chart -->
      <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Daily Revenue</h3>
        <canvas ref="revenueChart"></canvas>
      </div>

      <!-- Daily Data Table -->
      <UTable
        :columns="columns"
        :rows="tableData"
        :sort="{ column: 'date', direction: 'asc' }"
      >
        <template #total_revenue-data="{ row }">
          <span class="text-blue-600 font-medium">{{ formatNumber(row.total_revenue) }}</span>
        </template>
        <template #total_services-data="{ row }">
          <span class="text-purple-600 font-medium">{{ formatNumber(row.total_services) }}</span>
        </template>
        <template #total_tax-data="{ row }">
          <span class="text-green-600 font-medium">{{ formatNumber(row.total_tax) }}</span>
        </template>
        <template #total_sub_total-data="{ row }">
          <span class="text-gray-900 font-medium">{{ formatNumber(row.total_sub_total) }}</span>
        </template>
      </UTable>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Chart } from 'chart.js/auto';

definePageMeta({
  layout: 'admin',
});

const pageTitle = useState("pageTitle");
pageTitle.value = "/ Monthly Report";

const months = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 }
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => ({
  label: String(currentYear - 2 + i),
  value: currentYear - 2 + i
}));

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'total_revenue', label: 'Revenue' },
  { key: 'total_services', label: 'Services' },
  { key: 'total_tax', label: 'Tax' },
  { key: 'total_sub_total', label: 'Sales' },
  { key: 'payment_methods', label: 'Payment Methods' }
];

const monthlyData = ref({});
const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(currentYear);
const revenueChart = ref(null);
let chart = null;

const tableData = computed(() => {
  return Object.entries(monthlyData.value).map(([date, data]) => ({
    date: formatDate(date),
    ...data,
    payment_methods: `Cash: ${formatNumber(data.total_payment_method_1)} | Card: ${formatNumber(data.total_payment_method_2)}`
  }));
});

const formatNumber = (value) => {
  return Number(value).toFixed(2);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const calculateTotal = (field) => {
  return Object.values(monthlyData.value)
    .reduce((sum, day) => sum + Number(day[field] || 0), 0);
};

const fetchMonthlyReport = async () => {
  try {
    const response = await useApi(
      `reports/monthly?month=${selectedMonth.value}&year=${selectedYear.value}`,
      'GET'
    );
    
    if (response) {
      monthlyData.value = response;
      updateChart();
    }
  } catch (error) {
    console.error('Error fetching monthly report:', error);
  }
};

const updateChart = () => {
  if (chart) {
    chart.destroy();
  }

  const ctx = revenueChart.value.getContext('2d');
  const dates = Object.keys(monthlyData.value);
  const revenues = dates.map(date => monthlyData.value[date].total_revenue);

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates.map(date => formatDate(date)),
      datasets: [{
        label: 'Daily Revenue',
        data: revenues,
        borderColor: '#10B981',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
};

const exportToExcel = () => {
  const data = tableData.value;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Report");
  XLSX.writeFile(workbook, `monthly-report-${selectedMonth.value}-${selectedYear.value}.xlsx`);
};

const exportToPDF = () => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text(`Monthly Report - ${months.find(m => m.value === selectedMonth.value).label} ${selectedYear.value}`, 14, 20);
  
  doc.setFontSize(12);
  doc.text(`Total Revenue: ${formatNumber(calculateTotal('total_revenue'))}`, 14, 30);
  doc.text(`Total Services: ${formatNumber(calculateTotal('total_services'))}`, 14, 40);
  doc.text(`Total Tax: ${formatNumber(calculateTotal('total_tax'))}`, 14, 50);
  
  doc.autoTable({
    startY: 60,
    head: [columns.map(col => col.label)],
    body: tableData.value.map(row => [
      row.date,
      `${formatNumber(row.total_revenue)}`,
      `${formatNumber(row.total_services)}`,
      `${formatNumber(row.total_tax)}`,
      `${formatNumber(row.total_sub_total)}`,
      row.payment_methods
    ])
  });
  
  doc.save(`monthly-report-${selectedMonth.value}-${selectedYear.value}.pdf`);
};

onMounted(() => {
  fetchMonthlyReport();
});
</script>

<style>

</style>