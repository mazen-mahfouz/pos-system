

<template>
    <div class="px-6">
      <h1 class="text-3xl font-bold mb-6 text-gray-800">Cafe Dashboard</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-[30px]">
        <!-- Tables card -->
        <div class="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-gray-700">Tables</h2>
              <p class="text-3xl font-bold text-blue-600">15</p>
            </div>
            <div class="bg-blue-100 rounded-full p-3">
              <i class="fas fa-chair text-2xl text-blue-600"></i>
            </div>
          </div>
          <p class="text-sm text-gray-600 mt-2">10 occupied, 5 available</p>
        </div>
  
        <!-- Orders card -->
        <div class="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-gray-700">Today's Orders</h2>
              <p class="text-3xl font-bold text-green-600">42</p>
            </div>
            <div class="bg-green-100 rounded-full p-3">
              <i class="fas fa-utensils text-2xl text-green-600"></i>
            </div>
          </div>
          <p class="text-sm text-gray-600 mt-2">15% increase from yesterday</p>
        </div>
  
        <!-- Revenue card -->
        <div class="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-gray-700">Today's Revenue</h2>
              <p class="text-3xl font-bold text-yellow-600">$2,500</p>
            </div>
            <div class="bg-yellow-100 rounded-full p-3">
              <i class="fas fa-coins text-2xl text-yellow-600"></i>
            </div>
          </div>
          <p class="text-sm text-gray-600 mt-2">8% above average</p>
        </div>
  
        <!-- Customers card -->
        <div class="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-gray-700">New Customers</h2>
              <p class="text-3xl font-bold text-purple-600">7</p>
            </div>
            <div class="bg-purple-100 rounded-full p-3">
              <i class="fas fa-users text-2xl text-purple-600"></i>
            </div>
          </div>
          <p class="text-sm text-gray-600 mt-2">Total 120 customers this month</p>
        </div>
      </div>
  
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-semibold text-gray-700">Orders</h2>
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
  
        <UTable
        :columns="columns"
        :rows="paginatedOrders"
        :sort="{ column: 'id', direction: 'asc' }"
      >
      <template #action-data="{ row }">
        <UButton
          color="blue"
          variant="soft"
          @click="openModal(row)"
        >
          Details
        </UButton>
      </template>
      <template #status-data="{ row }">
        <UBadge :color="getStatusColor(row.status)">
          {{ row.status }}
        </UBadge>
      </template>
      </UTable>
  
        <div class="mt-4 flex justify-center">
          <UPagination
            v-model="currentPage"
            :total="orders.length"
            :per-page="perPage"
          />
        </div>

        <UModal v-model="isModalOpen">
          <UCard v-if="selectedOrder" class="w-full max-w-2xl">
            <template #header>
              <div class="flex justify-between items-center">
                <h3 class="text-xl font-semibold text-gray-800">Order Details</h3>
                <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="closeModal" />
              </div>
            </template>
            <div class="p-4">
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p class="text-sm text-gray-600">Order ID</p>
                  <p class="text-lg font-medium text-gray-900">{{ selectedOrder.id }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Customer</p>
                  <p class="text-lg font-medium text-gray-900">{{ selectedOrder.customer }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Total</p>
                  <p class="text-lg font-medium text-gray-900">{{ selectedOrder.total }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Status</p>
                  <UBadge :color="getStatusColor(selectedOrder.status)" class="mt-1">
                    {{ selectedOrder.status }}
                  </UBadge>
                </div>
              </div>
              <div>
                <h4 class="text-lg font-semibold text-gray-800 mb-3">Order Items</h4>
                <ul class="divide-y divide-gray-200">
                  <li v-for="item in selectedOrder.itemDetails" :key="item.name" class="py-3 flex justify-between">
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
                      <p class="text-sm text-gray-500">Quantity: {{ item.quantity }}</p>
                    </div>
                    <p class="text-sm font-medium text-gray-900">{{ item.price }}</p>
                  </li>
                </ul>
              </div>
            </div>
            <template #footer>
              <div class="flex justify-end">
                <UButton color="gray" @click="closeModal">Close</UButton>
              </div>
            </template>
          </UCard>
        </UModal>
    
      </div>
    </div>
  </template>
  
  
<script setup>

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

definePageMeta({
  layout: 'admin',
})

const pageTitle = useState("pageTitle");
pageTitle.value = "/ Cafe Dashboard";

// Table columns
const columns = [
  { key: 'id', label: 'Order ID' },
  { key: 'customer', label: 'Customer' },
  { key: 'items', label: 'Items' },
  { key: 'total', label: 'Total' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Action' },
];
// Fake orders data
const orders = ref([]);
// Pagination
const currentPage = ref(1);
const perPage = 10;

const paginatedOrders = computed(() => {
 const start = (currentPage.value - 1) * perPage;
 const end = start + perPage;
 return orders.value.slice(start, end);
});

// Status color function
const getStatusColor = (status) => {
 switch (status) {
   case 'Completed': return 'green';
   case 'In Progress': return 'blue';
   case 'Pending': return 'yellow';
   default: return 'gray';
 }
};

// Export functions (placeholder implementations)
const exportToExcel = () => {
 const worksheet = XLSX.utils.json_to_sheet(orders.value);
 const workbook = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
 XLSX.writeFile(workbook, "cafe_orders.xlsx");
};

const exportToPDF = () => {
 const doc = new jsPDF();
 doc.autoTable({
     head: [columns.map(col => col.label)],
     body: orders.value.map(order => 
     columns.map(col => order[col.key])
     )
 });
 doc.save("cafe_orders.pdf");
};

const isModalOpen = ref(false);
const selectedOrder = ref(null);

const openModal = (order) => {
  selectedOrder.value = order;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedOrder.value = null;
};

// Function to fetch orders from API (uncomment and implement when ready)
// const fetchOrders = async () => {
//   try {
//     const response = await fetch('YOUR_API_ENDPOINT');
//     const data = await response.json();
//     orders.value = data;
//   } catch (error) {
//     console.error('Error fetching orders:', error);
//   }
// };

// Uncomment to fetch orders when component mounts
// onMounted(fetchOrders);
</script>
