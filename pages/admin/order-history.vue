<template>
    <div class="px-6">
      <h1 class="text-3xl font-bold mb-6 text-gray-800">Order History</h1>
      
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center">
            <UInput
              v-model="searchQuery"
              icon="i-heroicons-magnifying-glass-20-solid"
              placeholder="Search orders..."
              class="mr-2"
            />
            <USelect
              v-model="filterStatus"
              :options="['All', 'Completed', 'In Progress', 'Cancelled']"
              placeholder="Filter by status"
            />
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
  
        <UTable
          :columns="columns"
          :rows="paginatedOrders"
          :sort="{ column: 'orderDate', direction: 'desc' }"
        >
          <template #status-data="{ row }">
            <UBadge :color="getStatusColor(row.status)">
              {{ row.status }}
            </UBadge>
          </template>
          <template #action-data="{ row }">
            <UButton
              color="blue"
              variant="soft"
              @click="openModal(row)"
            >
              Details
            </UButton>
          </template>
        </UTable>
  
        <div class="mt-4 flex justify-center">
          <UPagination
            v-model="currentPage"
            :total="filteredOrders.length"
            :per-page="perPage"
          />
        </div>
  
        <UModal v-model="isModalOpen">
          <UCard v-if="selectedOrder" class="w-full max-w-2xl">
            <template #header>
              <div class="flex justify-between items-center">
                <h3 class="text-xl font-semibold text-gray-800">Order #{{ selectedOrder.id }} Details</h3>
                <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="closeModal" />
              </div>
            </template>
            <div class="p-4">
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p class="text-sm text-gray-600">Customer</p>
                  <p class="text-lg font-medium text-gray-900">{{ selectedOrder.customer }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Order Date</p>
                  <p class="text-lg font-medium text-gray-900">{{ selectedOrder.orderDate }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Status</p>
                  <UBadge :color="getStatusColor(selectedOrder.status)" class="mt-1">
                    {{ selectedOrder.status }}
                  </UBadge>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Total</p>
                  <p class="text-lg font-medium text-gray-900">{{ selectedOrder.total }}</p>
                </div>
              </div>
              <h4 class="text-lg font-semibold text-gray-800 mb-3">Order Items</h4>
              <ul class="divide-y divide-gray-200">
                <li v-for="item in selectedOrder.items" :key="item.name" class="py-3 flex justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
                    <p class="text-sm text-gray-500">Quantity: {{ item.quantity }}</p>
                  </div>
                  <p class="text-sm font-medium text-gray-900">{{ item.price }}</p>
                </li>
              </ul>
            </div>
          </UCard>
        </UModal>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import * as XLSX from 'xlsx';
  import jsPDF from 'jspdf';
  import 'jspdf-autotable';
  
  definePageMeta({
    layout: 'admin',
  });
  
  const pageTitle = useState("pageTitle");
  pageTitle.value = "/ Order History";
  
  // Table columns
  const columns = [
    { key: 'id', label: 'Order ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'orderDate', label: 'Order Date' },
    { key: 'total', label: 'Total' },
    { key: 'status', label: 'Status' },
    { key: 'action', label: 'Action' },
  ];
  
  // Mock data for orders
  const orders = ref([]);
  
  // Pagination
  const currentPage = ref(1);
  const perPage = 10;
  
  // Search and filter
  const searchQuery = ref('');
  const filterStatus = ref('All');
  
  const filteredOrders = computed(() => {
    return orders.value.filter(order => {
      const matchesSearch = order.customer.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                            order.id.toString().includes(searchQuery.value);
      const matchesFilter = filterStatus.value === 'All' || order.status === filterStatus.value;
      return matchesSearch && matchesFilter;
    });
  });
  
  const paginatedOrders = computed(() => {
    const start = (currentPage.value - 1) * perPage;
    const end = start + perPage;
    return filteredOrders.value.slice(start, end);
  });
  
  // Status color function
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'green';
      case 'In Progress': return 'blue';
      case 'Cancelled': return 'red';
      default: return 'gray';
    }
  };
  
  // Export functions
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredOrders.value);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "order_history.xlsx");
  };
  
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [columns.map(col => col.label)],
      body: filteredOrders.value.map(order => [
        order.id,
        order.customer,
        order.orderDate,
        order.total,
        order.status,
      ])
    });
    doc.save("order_history.pdf");
  };
  
  // Modal
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
  </script>