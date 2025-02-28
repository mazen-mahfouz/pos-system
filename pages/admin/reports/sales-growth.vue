<template>
  <div class="px-6">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Sales Growth Report</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- Period Filter -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center space-x-4">
          <USelect
            v-model="months"
            :options="[
              { label: '6 Months', value: 6 },
              { label: '12 Months', value: 12 },
              { label: '24 Months', value: 24 }
            ]"
            placeholder="Select Period"
            class="w-48"
          />
          <UInput
            v-model="endDate"
            type="date"
            placeholder="End Date"
            class="w-48"
          />
          <UButton
            color="primary"
            variant="solid"
            @click="fetchSalesGrowth"
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
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div class="flex items-center gap-2">
            <div class="bg-green-100 rounded-full p-2">
              <Icon name="mdi:cash-multiple" size="20" class="text-green-600" />
            </div>
            <h3 class="text-sm font-medium text-gray-600">Total Sales</h3>
          </div>
          <p class="text-2xl font-bold text-green-600 mt-2">
            £{{ formatNumber(calculateTotalSales()) }}
          </p>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div class="flex items-center gap-2">
            <div class="bg-blue-100 rounded-full p-2">
              <Icon name="mdi:trending-up" size="20" class="text-blue-600" />
            </div>
            <h3 class="text-sm font-medium text-gray-600">Average Monthly Growth</h3>
          </div>
          <p class="text-2xl font-bold text-blue-600 mt-2">
            {{ formatNumber(calculateAverageGrowth()) }}%
          </p>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div class="flex items-center gap-2">
            <div class="bg-purple-100 rounded-full p-2">
              <Icon name="mdi:chart-line" size="20" class="text-purple-600" />
            </div>
            <h3 class="text-sm font-medium text-gray-600">Best Growth Month</h3>
          </div>
          <p class="text-2xl font-bold text-purple-600 mt-2">
            {{ getBestGrowthMonth() }}
          </p>
        </div>
      </div>

      <!-- Growth Chart -->
      <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Monthly Sales Growth</h3>
        <div class="h-[400px]">
          <canvas ref="growthChart"></canvas>
        </div>
      </div>

      <!-- Sales Table -->
      <UTable
        :columns="columns"
        :rows="tableData"
        :sort="{ column: 'month', direction: 'desc' }"
      >
        <template #sales-data="{ row }">
          <span class="text-green-600 font-medium">£{{ formatNumber(row.sales) }}</span>
        </template>
        <template #growth_percentage-data="{ row }">
          <span :class="getGrowthClass(row.growth_percentage)">
            {{ formatNumber(row.growth_percentage) }}%
          </span>
        </template>
        <template #previous_month_sales-data="{ row }">
          <span class="text-gray-600">£{{ formatNumber(row.previous_month_sales) }}</span>
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
pageTitle.value = "/ Sales Growth";

const columns = [
  { key: 'month', label: 'Month' },
  { key: 'sales', label: 'Sales' },
  { key: 'previous_month_sales', label: 'Previous Month' },
  { key: 'growth_percentage', label: 'Growth %' }
];

const salesData = ref([]);
const months = ref(12);
const endDate = ref('');
const growthChart = ref(null);
let chartInstance = null;

const tableData = computed(() => {
  return salesData.value.map(month => ({
    ...month,
    month: formatMonth(month.month)
  }));
});

const formatNumber = (value) => {
  return Number(value).toFixed(2);
};

const formatMonth = (monthStr) => {
  const date = new Date(monthStr + '-01');
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
};

const getGrowthClass = (growth) => {
  if (growth > 0) return 'text-green-600 font-medium';
  if (growth < 0) return 'text-red-600 font-medium';
  return 'text-gray-600 font-medium';
};

const calculateTotalSales = () => {
  return salesData.value.reduce((sum, month) => sum + Number(month.sales), 0);
};

const calculateAverageGrowth = () => {
  const growths = salesData.value
    .filter(month => month.growth_percentage !== 0)
    .map(month => month.growth_percentage);
  
  if (growths.length === 0) return 0;
  return growths.reduce((sum, growth) => sum + growth, 0) / growths.length;
};

const getBestGrowthMonth = () => {
  const bestMonth = salesData.value.reduce((best, month) => {
    return month.growth_percentage > (best?.growth_percentage || -Infinity) ? month : best;
  }, null);

  return bestMonth ? formatMonth(bestMonth.month) : 'N/A';
};

const fetchSalesGrowth = async () => {
  try {
    const response = await useApi(
      `reports/monthly-sales-growth?months=${months.value}&end_date=${endDate.value}`,
      'GET'
    );
    
    if (response && response.monthly_sales) {
      salesData.value = response.monthly_sales;
      updateChart();
    }
  } catch (error) {
    console.error('Error fetching sales growth:', error);
  }
};

const updateChart = () => {
  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = growthChart.value.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: salesData.value.map(month => formatMonth(month.month)),
      datasets: [
        {
          label: 'Sales',
          data: salesData.value.map(month => month.sales),
          borderColor: '#10B981',
          backgroundColor: '#10B98133',
          fill: true
        },
        {
          label: 'Growth %',
          data: salesData.value.map(month => month.growth_percentage),
          borderColor: '#6366F1',
          borderDash: [5, 5],
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
};

const exportToExcel = () => {
  const data = tableData.value.map(month => ({
    'Month': month.month,
    'Sales': `£${formatNumber(month.sales)}`,
    'Previous Month Sales': `£${formatNumber(month.previous_month_sales)}`,
    'Growth %': `${formatNumber(month.growth_percentage)}%`
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Growth");
  XLSX.writeFile(workbook, `sales-growth-${endDate.value}.xlsx`);
};

const exportToPDF = () => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Sales Growth Report', 14, 20);
  
  doc.setFontSize(12);
  doc.text(`Period: Last ${months.value} months`, 14, 30);
  doc.text(`Total Sales: £${formatNumber(calculateTotalSales())}`, 14, 40);
  doc.text(`Average Growth: ${formatNumber(calculateAverageGrowth())}%`, 14, 50);
  
  doc.autoTable({
    startY: 60,
    head: [['Month', 'Sales', 'Previous Month', 'Growth %']],
    body: tableData.value.map(month => [
      month.month,
      `£${formatNumber(month.sales)}`,
      `£${formatNumber(month.previous_month_sales)}`,
      `${formatNumber(month.growth_percentage)}%`
    ])
  });
  
  doc.save(`sales-growth-${endDate.value}.pdf`);
};

onMounted(() => {
  // Set default end date to current date
  const now = new Date();
  endDate.value = now.toISOString().split('T')[0];
  
  fetchSalesGrowth();
});
</script>

<style>

</style>