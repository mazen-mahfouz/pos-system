<template>
  <div class="px-6">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">User Activity Report</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- Header with Export Buttons -->
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
            @click="fetchUserActivity"
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
              <Icon name="mdi:account-group" size="20" class="text-blue-600" />
            </div>
            <h3 class="text-sm font-medium text-gray-600">Total Users</h3>
          </div>
          <p class="text-2xl font-bold text-blue-600 mt-2">
            {{ userActivity.length }}
          </p>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div class="flex items-center gap-2">
            <div class="bg-green-100 rounded-full p-2">
              <Icon name="mdi:cash-multiple" size="20" class="text-green-600" />
            </div>
            <h3 class="text-sm font-medium text-gray-600">Total Sales</h3>
          </div>
          <p class="text-2xl font-bold text-green-600 mt-2">
            £{{ calculateTotalSales() }}
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
            {{ calculateTotalOrders() }}
          </p>
        </div>
      </div>

      <!-- Users Table -->
      <UTable
        :columns="columns"
        :rows="paginatedUsers"
        :sort="{ column: 'total_sales', direction: 'desc' }"
      >
        <template #user-data="{ row }">
          <div class="flex items-center">
            <div class="ml-2">
              <div class="text-sm font-medium text-gray-900">
                {{ getUserName(row) }}
              </div>
              <div class="text-sm text-gray-500">
                {{ row.user?.email || 'N/A' }}
              </div>
            </div>
          </div>
        </template>
        
        <template #total_sales-data="{ row }">
          <span class="text-green-600 font-medium">£{{ formatNumber(row.total_sales) }}</span>
        </template>
      </UTable>

      <div class="mt-4 flex justify-center">
        <UPagination
          v-model="currentPage"
          :total="userActivity.length"
          :per-page="perPage"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

definePageMeta({
  layout: 'admin',
});

const pageTitle = useState("pageTitle");
pageTitle.value = "/ User Activity";

// Table columns
const columns = [
  { key: 'user', label: 'User' },
  { key: 'total_sales', label: 'Total Sales' },
  { key: 'total_orders', label: 'Total Orders' },
];

const userActivity = ref([]);
const currentPage = ref(1);
const perPage = 10;
const startDate = ref('');
const endDate = ref('');

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  const end = start + perPage;
  return userActivity.value.slice(start, end);
});

const getUserName = (row) => {
  if (row.user) {
    return `${row.user.first_name} ${row.user.last_name}`;
  }
  return 'Unknown User';
};

const formatNumber = (value) => {
  return Number(value).toFixed(2);
};

const calculateTotalSales = () => {
  return userActivity.value
    .reduce((sum, user) => sum + Number(user.total_sales), 0)
    .toFixed(2);
};

const calculateTotalOrders = () => {
  return userActivity.value
    .reduce((sum, user) => sum + user.total_orders, 0);
};

const fetchUserActivity = async () => {
  try {
    const response = await useApi(
      `reports/user-activity?start_date=${startDate.value}&end_date=${endDate.value}`,
      'GET'
    );
    
    if (response && response.user_sales) {
      userActivity.value = response.user_sales;
    }
  } catch (error) {
    console.error('Error fetching user activity:', error);
  }
};

const exportToExcel = () => {
  const data = userActivity.value.map(user => ({
    'User Name': getUserName(user),
    'Email': user.user?.email || 'N/A',
    'Total Sales': `£${formatNumber(user.total_sales)}`,
    'Total Orders': user.total_orders
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "User Activity");
  XLSX.writeFile(workbook, `user-activity-${startDate.value}-to-${endDate.value}.xlsx`);
};

const exportToPDF = () => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('User Activity Report', 14, 20);
  
  doc.setFontSize(12);
  doc.text(`Period: ${startDate.value} to ${endDate.value}`, 14, 30);
  
  doc.autoTable({
    startY: 40,
    head: [['User Name', 'Email', 'Total Sales', 'Total Orders']],
    body: userActivity.value.map(user => [
      getUserName(user),
      user.user?.email || 'N/A',
      `£${formatNumber(user.total_sales)}`,
      user.total_orders
    ])
  });
  
  doc.save(`user-activity-${startDate.value}-to-${endDate.value}.pdf`);
};

onMounted(() => {
  // Set default date range to current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  // startDate.value = firstDay.toISOString().split('T')[0];
  // endDate.value = lastDay.toISOString().split('T')[0];
  
  fetchUserActivity();
});
</script>

<style>

</style>