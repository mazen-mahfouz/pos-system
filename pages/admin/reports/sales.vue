<template>
  <div class="px-6">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Sales Report</h1>
    
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
            @click="fetchSalesReport"
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

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div class="flex items-center gap-2">
            <div class="bg-green-100 rounded-full p-2">
              <Icon name="mdi:cash-multiple" size="20" class="text-green-600" />
            </div>
            <h3 class="text-sm font-medium text-gray-600">Total Revenue</h3>
          </div>
          <p class="text-2xl font-bold text-green-600 mt-2">
            £{{ formatNumber(salesData.total_revenue) }}
          </p>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div class="flex items-center gap-2">
            <div class="bg-blue-100 rounded-full p-2">
              <Icon name="mdi:percent" size="20" class="text-blue-600" />
            </div>
            <h3 class="text-sm font-medium text-gray-600">Total Tax</h3>
          </div>
          <p class="text-2xl font-bold text-blue-600 mt-2">
            £{{ formatNumber(salesData.total_tax) }}
          </p>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div class="flex items-center gap-2">
            <div class="bg-purple-100 rounded-full p-2">
              <Icon name="mdi:room-service" size="20" class="text-purple-600" />
            </div>
            <h3 class="text-sm font-medium text-gray-600">Total Service</h3>
          </div>
          <p class="text-2xl font-bold text-purple-600 mt-2">
            £{{ formatNumber(salesData.total_service) }}
          </p>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div class="flex items-center gap-2">
            <div class="bg-yellow-100 rounded-full p-2">
              <Icon name="mdi:credit-card" size="20" class="text-yellow-600" />
            </div>
            <h3 class="text-sm font-medium text-gray-600">Payment Methods</h3>
          </div>
          <div class="mt-2 space-y-1">
            <div v-for="payment in salesData.payment_breakdown" :key="payment.payment_method_id" 
                 class="flex justify-between text-sm">
              <span class="text-gray-600">
                {{ getPaymentMethodName(payment.payment_method_id) }}:
              </span>
              <span class="font-semibold text-gray-900">
                £{{ formatNumber(payment.total_amount) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

definePageMeta({
  layout: 'admin',
});

const pageTitle = useState("pageTitle");
pageTitle.value = "/ Sales Report";

const startDate = ref('');
const endDate = ref('');
const salesData = ref({
  total_revenue: 0,
  total_tax: 0,
  total_service: 0,
  payment_breakdown: []
});

const paymentMethods = {
  1: 'Cash',
  2: 'Card'
};

const getPaymentMethodName = (id) => {
  return paymentMethods[id] || 'Unknown';
};

const formatNumber = (value) => {
  return Number(value).toFixed(2);
};

const fetchSalesReport = async () => {
  try {
    const response = await useApi(
      `reports/sales?start_date=${startDate.value}&end_date=${endDate.value}`, 
      'GET'
    );
    
    if (response) {
      salesData.value = response;
    }
  } catch (error) {
    console.error('Error fetching sales report:', error);
  }
};

const exportToExcel = () => {
  const data = [
    ['Sales Report', `${startDate.value} to ${endDate.value}`],
    [''],
    ['Total Revenue', `£${formatNumber(salesData.value.total_revenue)}`],
    ['Total Tax', `£${formatNumber(salesData.value.total_tax)}`],
    ['Total Service', `£${formatNumber(salesData.value.total_service)}`],
    [''],
    ['Payment Breakdown'],
    ...salesData.value.payment_breakdown.map(payment => [
      getPaymentMethodName(payment.payment_method_id),
      `£${formatNumber(payment.total_amount)}`
    ])
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
  XLSX.writeFile(wb, `sales-report-${startDate.value}-to-${endDate.value}.xlsx`);
};

const exportToPDF = () => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Sales Report', 14, 20);
  
  doc.setFontSize(12);
  doc.text(`Period: ${startDate.value} to ${endDate.value}`, 14, 30);
  
  doc.text(`Total Revenue: £${formatNumber(salesData.value.total_revenue)}`, 14, 45);
  doc.text(`Total Tax: £${formatNumber(salesData.value.total_tax)}`, 14, 55);
  doc.text(`Total Service: £${formatNumber(salesData.value.total_service)}`, 14, 65);
  
  doc.text('Payment Breakdown:', 14, 80);
  const paymentData = salesData.value.payment_breakdown.map(payment => [
    getPaymentMethodName(payment.payment_method_id),
    `£${formatNumber(payment.total_amount)}`
  ]);
  
  doc.autoTable({
    startY: 85,
    head: [['Payment Method', 'Amount']],
    body: paymentData,
  });
  
  doc.save(`sales-report-${startDate.value}-to-${endDate.value}.pdf`);
};

onMounted(() => {
  // Set default date range to current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  // startDate.value = firstDay.toISOString().split('T')[0];
  // endDate.value = lastDay.toISOString().split('T')[0];
  
  fetchSalesReport();
});
</script>

<style>

</style>