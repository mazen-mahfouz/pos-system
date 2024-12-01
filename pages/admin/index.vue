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
  
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 class="text-sm font-medium text-gray-600">Total Orders</h3>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ orders.length }}</p>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 class="text-sm font-medium text-gray-600">Total Sales</h3>
            <p class="text-2xl font-bold text-green-600">
              £{{ calculateTotal('total_amount') }}
            </p>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 class="text-sm font-medium text-gray-600">Total Tax</h3>
            <p class="text-2xl font-bold text-blue-600">
              £{{ calculateTotal('tax') }}
            </p>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 class="text-sm font-medium text-gray-600">Average Order Value</h3>
            <p class="text-2xl font-bold text-purple-600">
              £{{ calculateAverageOrder() }}
            </p>
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
          <UCard v-if="selectedOrder" class="w-full max-w-4xl">
            <template #header>
              <div class="px-4 py-1 flex justify-between items-center">
                <h3 class="text-[18px] font-[500] text-gray-800">Order Details</h3>
              </div>
            </template>

            <div class="py-1 px-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <!-- Order Info Cards -->
              <div class="grid grid-cols-2 md:grid-cols-2 gap-2">
                <div class="bg-[#fafafa] p-3 rounded-lg">
                  <div class="flex items-center gap-2">
                    <div class="bg-[#e1e1e100]">
                      <Icon name="mdi:pound" size="14" class="text-[#2b3c5e]" />
                    </div>
                    <span class="text-[13px] text-gray-600">Order ID</span>
                  </div>
                  <p class="mt-1.5 text-[13px] font-bold text-[#2b3c5e]">#{{ selectedOrder.code }}</p>
                </div>

                <div class="bg-[#fafafa] p-3 rounded-lg">
                  <div class="flex items-center gap-2">
                    <div class="bg-[#e1e1e100]">
                      <Icon name="mdi:clock" size="14" class="text-[#2b3c5e]" />
                    </div>
                    <span class="text-[13px] text-gray-600">Date</span>
                  </div>
                  <p class="mt-1.5 text-[13px] font-medium text-gray-900">{{ selectedOrder.created_at }}</p>
                </div>

                <div class="bg-[#fafafa] p-3 rounded-lg">
                  <div class="flex items-center gap-2">
                    <div class="bg-[#e1e1e100]">
                      <Icon name="mdi:check-circle" size="14" class="text-[#2b3c5e]" />
                    </div>
                    <span class="text-[13px] text-gray-600">Status</span>
                  </div>
                    <UBadge 
                    :color="getStatusColor(selectedOrder.status)"
                    class="mt-1.5"
                    size="xs"
                  >
                    {{ selectedOrder.status }}
                  </UBadge>
                </div>

                <div class="bg-[#fafafa] p-3 rounded-lg">
                  <div class="flex items-center gap-2">
                    <div class="bg-[#e1e1e100]">
                      <Icon name="mdi:account" size="14" class="text-[#2b3c5e]" />
                    </div>
                    <span class="text-[13px] text-gray-600">Customer</span>
                  </div>
                  <p class="mt-1.5 text-[13px] font-medium text-gray-900 truncate">{{ selectedOrder.customer }}</p>
                </div>
              </div>

              <!-- Order Details Cards -->
              <div class="grid grid-cols-3 gap-2">
                <div class="bg-[#fbfbfb] p-3 rounded-lg">
                  <div class="flex items-center gap-2">
                    <div class="bg-[#e1e1e100]">
                      <Icon name="mdi:shopping" size="14" class="text-[#2b3c5e]" />
                    </div>
                    <span class="text-[13px] text-gray-600">Order Type</span>
                  </div>
                  <p class="mt-1.5 text-[13px] font-medium text-gray-900">{{ selectedOrder.type }}</p>
                </div>

                <div class="bg-[#fafafa] p-3 rounded-lg">
                  <div class="flex items-center gap-2">
                    <div class="bg-[#e1e1e100]">
                      <Icon name="mdi:format-list-bulleted" size="14" class="text-[#2b3c5e]" />
                    </div>
                    <span class="text-[13px] text-gray-600">Items Count</span>
                  </div>
                  <p class="mt-1.5 text-[13px] font-medium text-gray-900">{{ selectedOrder.items }}</p>
                </div>

                <div class="bg-[#fbfbfb] p-3 rounded-lg">
                  <div class="flex items-center gap-2">
                    <div class="bg-[#e1e1e100]">
                      <Icon name="mdi:cash-multiple" size="14" class="text-[#2b3c5e]" />
                    </div>
                    <span class="text-[13px] text-gray-600">Total Amount</span>
                  </div>
                  <p class="mt-1.5 text-[13px] font-bold text-[#2b3c5e]">{{ selectedOrder.total_amount }}</p>
                </div>
              </div>

              <!-- Order Items Table -->
              <div class="border border-gray-100 rounded-lg overflow-hidden">
                <table class="min-w-full divide-y divide-gray-100">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-100">
                    <tr v-for="item in selectedOrder.itemDetails" :key="item.name" class="hover:bg-gray-50">
                      <td class="px-4 py-3 text-sm text-gray-900">{{ item.name }}</td>
                      <td class="px-4 py-3 text-sm text-gray-500 text-right">{{ item.quantity }}</td>
                      <td class="px-4 py-3 text-sm text-gray-500 text-right">{{ item.price }}</td>
                      <td class="px-4 py-3 text-sm font-medium text-gray-900 text-right">{{ item.total }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Order Summary -->
              <div class="bg-[#fbfbfb] rounded-lg p-4">
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Subtotal</span>
                    <span class="font-medium text-gray-900">{{ selectedOrder.sub_total }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Tax</span>
                    <span class="font-medium text-gray-900">{{ selectedOrder.tax }}</span>
                  </div>
                  <div class="pt-2 mt-2 border-t border-gray-200">
                    <div class="flex justify-between">
                      <span class="font-medium text-gray-900">Total Amount</span>
                      <span class="font-bold text-primary-600">{{ selectedOrder.total_amount }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <template #footer>
              <div class="flex justify-between items-center pt-3">
                <div class="flex gap-2">
                  <UButton
                    color="gray"
                    variant="soft"
                    size="xs"
                    @click="exportOrderToPDF(selectedOrder)"
                  >
                    <Icon name="mdi:file-pdf-box" size="16" class="mr-1" />
                    PDF
                  </UButton>
                  <UButton
                    color="gray"
                    variant="soft"
                    size="xs"
                    @click="exportOrderToExcel(selectedOrder)"
                  >
                    <Icon name="mdi:file-excel-box" size="16" class="mr-1" />
                    Excel
                  </UButton>
                </div>
                <UButton
                  color="gray"
                  variant="solid"
                  size="xs"
                  @click="closeModal"
                >
                  Close
                </UButton>
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
  { key: 'code', label: 'Order Code' },
  { key: 'created_at', label: 'Date' },
  { key: 'type', label: 'Type' },
  { key: 'items', label: 'Items' },
  { key: 'sub_total', label: 'Subtotal' },
  { key: 'tax', label: 'Tax' },
  { key: 'total_amount', label: 'Total' },
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
// const getStatusColor = (status) => {
//  switch (status) {
//    case 'Completed': return 'green';
//    case 'In Progress': return 'blue';
//    case 'Pending': return 'yellow';
//    default: return 'gray';
//  }
// };

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

// Enhanced data transformer
const transformOrderData = (apiOrders) => {
  return apiOrders.map(order => ({
    id: order.id,
    code: order.code,
    created_at: formatDate(order.created_at),
    type: order.type === 'dine-in' ? 'Dine In' : 'Takeaway',
    items: order.order_items.length,
    sub_total: `£${Number(order.sub_total).toFixed(2)}`,
    tax: `£${Number(order.tax).toFixed(2)}`,
    total_amount: `£${Number(order.total_amount).toFixed(2)}`,
    status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
    customer: order.guest || 'Walk-in Customer',
    // Enhanced item details for modal
    itemDetails: order.order_items.map(item => ({
      name: item.product.name,
      quantity: item.quantity,
      price: `£${Number(item.price).toFixed(2)}`,
      subtotal: `£${Number(item.sub_total).toFixed(2)}`,
      tax: `£${Number(item.tax).toFixed(2)}`,
      total: `£${Number(item.total_amount).toFixed(2)}`
    }))
  }));
};

// Add date formatter
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Fetch orders
const fetchOrders = () => {
  useApi('orders', 'GET')
    .then(response => {
      orders.value = transformOrderData(response);
    })
    .catch(error => {
      console.error('Error fetching orders:', error);
      // Add error handling UI if needed
    });
};

// Status color mapping
const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'completed': return 'green';
    case 'live': return 'blue';
    case 'Canceled': return 'red';
    default: return 'gray';
  }
};

onMounted(() => {
  fetchOrders();
});

const exportOrderToPDF = (order) => {
  const doc = new jsPDF();
  
  // Add Header
  doc.setFontSize(20);
  doc.text(`Order #${order.code}`, 14, 20);
  doc.setFontSize(12);
  doc.text(`Date: ${order.created_at}`, 14, 30);
  doc.text(`Customer: ${order.customer}`, 14, 40);
  doc.text(`Status: ${order.status}`, 14, 50);
  
  // Add Items Table
  doc.autoTable({
    startY: 60,
    head: [['Item', 'Quantity', 'Price', 'Total']],
    body: order.itemDetails.map(item => [
      item.name,
      item.quantity,
      item.price,
      item.total
    ]),
  });
  
  // Add Summary
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text(`Subtotal: ${order.sub_total}`, 14, finalY);
  doc.text(`Tax: ${order.tax}`, 14, finalY + 10);
  doc.setFontSize(14);
  doc.text(`Total Amount: ${order.total_amount}`, 14, finalY + 20);
  
  doc.save(`order-${order.code}.pdf`);
};

const exportOrderToExcel = (order) => {
  const worksheet = XLSX.utils.json_to_sheet([
    {
      'Order Code': order.code,
      'Date': order.created_at,
      'Customer': order.customer,
      'Status': order.status,
      'Subtotal': order.sub_total,
      'Tax': order.tax,
      'Total': order.total_amount
    }
  ]);
  
  // Add items details in new rows
  XLSX.utils.sheet_add_json(worksheet, order.itemDetails, {
    origin: 'A3',
    skipHeader: false,
  });
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Order Details");
  XLSX.writeFile(workbook, `order-${order.code}.xlsx`);
};

const calculateTotal = (field) => {
  return orders.value
    .reduce((sum, order) => {
      // Remove currency symbol and convert to number
      const value = Number(order[field].replace('£', ''));
      return sum + value;
    }, 0)
    .toFixed(2);
};

const calculateAverageOrder = () => {
  if (orders.value.length === 0) return '0.00';
  const total = orders.value.reduce((sum, order) => {
    const value = Number(order.total_amount.replace('£', ''));
    return sum + value;
  }, 0);
  return (total / orders.value.length).toFixed(2);
};

</script>
