<template>
  <div class="px-6">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Top Selling Products</h1>
    
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
            @click="fetchTopSelling"
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
            <div class="bg-blue-100 rounded-full p-2">
              <Icon name="mdi:package-variant" size="20" class="text-blue-600" />
            </div>
            <h3 class="text-sm font-medium text-gray-600">Total Products</h3>
          </div>
          <p class="text-2xl font-bold text-blue-600 mt-2">
            {{ Object.keys(productsData).length }}
          </p>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div class="flex items-center gap-2">
            <div class="bg-green-100 rounded-full p-2">
              <Icon name="mdi:cash-multiple" size="20" class="text-green-600" />
            </div>
            <h3 class="text-sm font-medium text-gray-600">Total Revenue</h3>
          </div>
          <p class="text-2xl font-bold text-green-600 mt-2">
            {{ formatNumber(calculateTotalRevenue()) }}
          </p>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div class="flex items-center gap-2">
            <div class="bg-purple-100 rounded-full p-2">
              <Icon name="mdi:shopping" size="20" class="text-purple-600" />
            </div>
            <h3 class="text-sm font-medium text-gray-600">Total Quantity</h3>
          </div>
          <p class="text-2xl font-bold text-purple-600 mt-2">
            {{ calculateTotalQuantity() }}
          </p>
        </div>
      </div>

      <!-- Top 10 Products Chart -->
      <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Top 10 Products by Revenue</h3>
        <div class="h-[400px]">
          <canvas ref="revenueChart"></canvas>
        </div>
      </div>

      <!-- Products Table -->
      <UTable
        :columns="columns"
        :rows="tableData"
        :sort="{ column: 'total_quantity', direction: 'desc' }"
      >
        <template #total_revenue-data="{ row }">
          <span class="text-blue-600 font-medium">{{ formatNumber(row.total_revenue) }}</span>
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
pageTitle.value = "/ Top Selling Products";

const columns = [
  { key: 'product_name', label: 'Product Name' },
  { key: 'total_quantity', label: 'Quantity Sold' },
  { key: 'total_revenue', label: 'Revenue' },
  { key: 'average_price', label: 'Average Price' }
];

const productsData = ref({});
const startDate = ref('');
const endDate = ref('');
const revenueChart = ref(null);
let chart = null;

const tableData = computed(() => {
  return Object.values(productsData.value)
    .map(product => ({
      ...product,
      average_price: `${formatNumber(product.total_revenue / product.total_quantity)}`
    }))
    .sort((a, b) => b.total_revenue - a.total_revenue);
});

const formatNumber = (value) => {
  return Number(value).toFixed(2);
};

const calculateTotalRevenue = () => {
  return Object.values(productsData.value)
    .reduce((sum, product) => sum + product.total_revenue, 0);
};

const calculateTotalQuantity = () => {
  return Object.values(productsData.value)
    .reduce((sum, product) => sum + product.total_quantity, 0);
};

const fetchTopSelling = async () => {
  try {
    const response = await useApi(
      `reports/top-selling-products?start_date=${startDate.value}&end_date=${endDate.value}`,
      'GET'
    );
    
    if (response) {
      productsData.value = response;
      updateChart();
    }
  } catch (error) {
    console.error('Error fetching top selling products:', error);
  }
};

const updateChart = () => {
  if (chart) {
    chart.destroy();
  }

  const top10Products = tableData.value.slice(0, 10);
  const ctx = revenueChart.value.getContext('2d');

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top10Products.map(product => product.product_name),
      datasets: [
        {
          label: 'Revenue',
          data: top10Products.map(product => product.total_revenue),
          backgroundColor: '#10B981',
          borderColor: '#059669',
          borderWidth: 1
        },
        {
          label: 'Quantity',
          data: top10Products.map(product => product.total_quantity),
          backgroundColor: '#6366F1',
          borderColor: '#4F46E5',
          borderWidth: 1
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
  const data = tableData.value.map(product => ({
    'Product Name': product.product_name,
    'Quantity Sold': product.total_quantity,
    'Revenue': `${formatNumber(product.total_revenue)}`,
    'Average Price': product.average_price
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Top Selling Products");
  XLSX.writeFile(workbook, `top-selling-${startDate.value}-to-${endDate.value}.xlsx`);
};

const exportToPDF = () => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Top Selling Products Report', 14, 20);
  
  doc.setFontSize(12);
  doc.text(`Period: ${startDate.value} to ${endDate.value}`, 14, 30);
  doc.text(`Total Revenue: ${formatNumber(calculateTotalRevenue())}`, 14, 40);
  doc.text(`Total Quantity: ${calculateTotalQuantity()}`, 14, 50);
  
  doc.autoTable({
    startY: 60,
    head: [['Product Name', 'Quantity Sold', 'Revenue', 'Average Price']],
    body: tableData.value.map(product => [
      product.product_name,
      product.total_quantity,
      `${formatNumber(product.total_revenue)}`,
      product.average_price
    ])
  });
  
  doc.save(`top-selling-${startDate.value}-to-${endDate.value}.pdf`);
};

onMounted(() => {
  // Set default date range to current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  // startDate.value = firstDay.toISOString().split('T')[0];
  // endDate.value = lastDay.toISOString().split('T')[0];
  
  fetchTopSelling();
});
</script>

<style>

</style>