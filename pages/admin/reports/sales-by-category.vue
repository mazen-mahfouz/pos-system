<template>
  <div class="px-6">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Sales by Category</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- Date Filter -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center space-x-4">
          <UInput
            v-model="startDate"
            type="date"
            placeholder="Start Date"
            class="w-48"
          />
          <span class="text-gray-500">to</span>
          <UInput
            v-model="endDate"
            type="date"
            placeholder="End Date"
            class="w-48"
          />
          <UButton
            color="primary"
            variant="solid"
            @click="fetchCategorySales"
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
              <Icon name="mdi:shape" size="20" class="text-green-600" />
            </div>
            <h3 class="text-sm font-medium text-gray-600">Total Categories</h3>
          </div>
          <p class="text-2xl font-bold text-green-600 mt-2">
            {{ categoryData.length }}
          </p>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div class="flex items-center gap-2">
            <div class="bg-blue-100 rounded-full p-2">
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
            <div class="bg-purple-100 rounded-full p-2">
              <Icon name="mdi:shopping" size="20" class="text-purple-600" />
            </div>
            <h3 class="text-sm font-medium text-gray-600">Total Orders</h3>
          </div>
          <p class="text-2xl font-bold text-purple-600 mt-2">
            {{ calculateTotal('order_count') }}
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div class="flex items-center gap-2">
            <div class="bg-yellow-100 rounded-full p-2">
              <Icon name="mdi:package-variant" size="20" class="text-yellow-600" />
            </div>
            <h3 class="text-sm font-medium text-gray-600">Total Quantity</h3>
          </div>
          <p class="text-2xl font-bold text-yellow-600 mt-2">
            {{ calculateTotal('total_quantity') }}
          </p>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- Revenue Chart -->
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">Revenue by Category</h3>
          <div class="h-[400px]">
            <canvas ref="revenueChart"></canvas>
          </div>
        </div>

        <!-- Orders Chart -->
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">Orders by Category</h3>
          <div class="h-[400px]">
            <canvas ref="ordersChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Categories Table -->
      <UTable
        :columns="columns"
        :rows="tableData"
        :sort="{ column: 'total_revenue', direction: 'desc' }"
      >
        <template #total_revenue-data="{ row }">
          <span class="text-blue-600 font-medium">{{ formatNumber(row.total_revenue) }}</span>
        </template>
        <template #average_order-data="{ row }">
          <span class="text-purple-600 font-medium">{{ formatNumber(row.average_order) }}</span>
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
pageTitle.value = "/ Sales by Category";

const columns = [
  { key: 'category', label: 'Category' },
  { key: 'total_quantity', label: 'Quantity' },
  { key: 'total_revenue', label: 'Revenue' },
  { key: 'order_count', label: 'Orders' },
  { key: 'average_order', label: 'Avg. Order Value' }
];

const categoryData = ref([]);
const startDate = ref('');
const endDate = ref('');
const revenueChart = ref(null);
const ordersChart = ref(null);
let revenueChartInstance = null;
let ordersChartInstance = null;

const tableData = computed(() => {
  return categoryData.value.map(category => ({
    ...category,
    average_order: category.total_revenue / category.order_count
  }));
});

const formatNumber = (value) => {
  return Number(value).toFixed(2);
};

const calculateTotal = (field) => {
  return categoryData.value.reduce((sum, category) => sum + category[field], 0);
};

const fetchCategorySales = async () => {
  try {
    const response = await useApi(
      `reports/sales-by-category?start_date=${startDate.value}&end_date=${endDate.value}`,
      'GET'
    );
    
    if (response && response.category_sales) {
      categoryData.value = response.category_sales;
      updateCharts();
    }
  } catch (error) {
    console.error('Error fetching category sales:', error);
  }
};

const updateCharts = () => {
  // Update Revenue Chart
  if (revenueChartInstance) {
    revenueChartInstance.destroy();
  }

  const top10Categories = tableData.value
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 10);

  revenueChartInstance = new Chart(revenueChart.value.getContext('2d'), {
    type: 'pie',
    data: {
      labels: top10Categories.map(cat => cat.category),
      datasets: [{
        data: top10Categories.map(cat => cat.total_revenue),
        backgroundColor: [
          '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', 
          '#EC4899', '#F59E0B', '#EF4444', '#06B6D4',
          '#14B8A6', '#84CC16'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  // Update Orders Chart
  if (ordersChartInstance) {
    ordersChartInstance.destroy();
  }

  ordersChartInstance = new Chart(ordersChart.value.getContext('2d'), {
    type: 'bar',
    data: {
      labels: top10Categories.map(cat => cat.category),
      datasets: [{
        label: 'Orders',
        data: top10Categories.map(cat => cat.order_count),
        backgroundColor: '#6366F1'
      }]
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
  const data = tableData.value.map(category => ({
    'Category': category.category,
    'Quantity': category.total_quantity,
    'Revenue': `${formatNumber(category.total_revenue)}`,
    'Orders': category.order_count,
    'Average Order Value': `${formatNumber(category.average_order)}`
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Category Sales");
  XLSX.writeFile(workbook, `category-sales-${startDate.value}-to-${endDate.value}.xlsx`);
};

const exportToPDF = () => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Sales by Category Report', 14, 20);
  
  doc.setFontSize(12);
  doc.text(`Period: ${startDate.value} to ${endDate.value}`, 14, 30);
  doc.text(`Total Revenue: ${formatNumber(calculateTotal('total_revenue'))}`, 14, 40);
  doc.text(`Total Orders: ${calculateTotal('order_count')}`, 14, 50);
  
  doc.autoTable({
    startY: 60,
    head: [['Category', 'Quantity', 'Revenue', 'Orders', 'Avg. Order Value']],
    body: tableData.value.map(category => [
      category.category,
      category.total_quantity,
      `${formatNumber(category.total_revenue)}`,
      category.order_count,
      `${formatNumber(category.average_order)}`
    ])
  });
  
  doc.save(`category-sales-${startDate.value}-to-${endDate.value}.pdf`);
};

onMounted(() => {
  // Set default date range to current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  // startDate.value = firstDay.toISOString().split('T')[0];
  // endDate.value = lastDay.toISOString().split('T')[0];
  
  fetchCategorySales();
});
</script>

<style>

</style>