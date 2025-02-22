<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="modelValue" class="fixed inset-0 bg-black/50 flex items-center justify-center z-30 p-4" @click="closeModal">
        <div class="bg-white rounded-lg w-full max-w-4xl h-[90vh] shadow-lg overflow-hidden modal-container" @click.stop>
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
            <h3 class="text-lg font-semibold text-gray-800">Open Orders</h3>
            <button @click="closeModal" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <UIcon name="mdi:close" class="text-base text-gray-500" />
            </button>
          </div>

          <!-- Search and Filters -->
          <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div class="flex flex-wrap gap-4 items-center">
              <!-- Search -->
              <div class="flex-1 min-w-[240px]">
                <div class="relative">
                  <UIcon name="mdi:search" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                  <input 
                    type="text" 
                    v-model="searchQuery" 
                    class="w-full h-10 pl-10 pr-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm"
                    placeholder="Search orders by code..." 
                    @input="handleSearch"
                  >
                </div>
              </div>
              
              <!-- Type Selector -->
              <div class="w-[220px]">
                <CustomUSelect v-model="selected" :options="types" class="h-10" />
              </div>
            </div>

            <!-- Status Filters -->
            <div class="mt-4">
              <div class="flex gap-2">
                <button
                  v-for="filter in filtersList"
                  :key="filter.value"
                  @click="selectedFilter = filter.value"
                  class="px-4 py-2 rounded-lg text-xs font-medium transition-all"
                  :class="selectedFilter === filter.value ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100'"
                >
                  {{ filter.name }}
                  <span class="ml-2 px-2 py-0.5 rounded-full text-[10px]" :class="selectedFilter === filter.value ? 'bg-blue-500/80 text-white' : 'bg-gray-100'">
                    {{ filter.count }}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Orders Grid -->
          <div class="p-6 overflow-y-auto" style="height: calc(90vh - 240px);">
            <div v-if="isLoading" class="flex items-center justify-center h-full">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            
            <div v-else-if="filteredOrders.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500">
              <UIcon name="mdi:clipboard-text-off" class="text-5xl mb-3" />
              <p class="text-lg">No orders found</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                v-for="order in paginatedOrders" 
                :key="order.id" 
                @click="order.status === 'live' ? selectOrder(order) : null"
                class="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md"
                :class="{
                  'cursor-pointer transform hover:-translate-y-1': order.status === 'live',
                  'border-l-4 border-l-green-500 cursor-not-allowed': order.status === 'completed',
                  'border-l-4 border-l-red-500 cursor-not-allowed': order.status === 'canceled',
                  'border-l-4 border-l-yellow-500': order.status === 'live',
                }"
              >
                <div class="p-4">
                  <div class="flex justify-between items-center mb-2.5">
                    <span class="text-xs font-bold text-gray-900">{{ order.code }}</span>   
                    <span :class="getStatusClass(order.status)">{{ order.status }}</span>
                  </div>
                  
                  <div class="space-y-1.5">
                    <div class="flex items-center text-gray-600">
                      <UIcon name="mdi:clock-outline" class="mr-1.5 text-xs" />
                      <span class="text-[11px]">{{ formatDate(order.created_at) }}</span>
                    </div>
                    
                    <div class="flex items-center justify-between">
                      <div class="flex items-center text-gray-600">
                        <UIcon name="mdi:silverware" class="mr-2 text-sm" />
                        <span class="text-xs">{{ order.type }}</span>
                      </div>
                      <div class="flex items-center text-gray-600">
                        <UIcon name="mdi:table-furniture" class="mr-2 text-sm" />
                        <span class="text-xs">{{ order.table_id == null ? 'Any Table' : 'Table ' + order.table_id }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <button 
                      @click.stop="printOrder(order)"
                      class="text-xs flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <UIcon name="mdi:printer" class="text-sm" />
                      Print
                    </button>
                    <span class="text-sm font-semibold">${{ formatPrice(order.total_amount) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="filteredOrders.length > 0" class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
              <span class="text-sm text-gray-500">
                Showing {{ startIndex }} - {{ endIndex }} of {{ totalOrders }} orders
              </span>
              
              <div class="flex items-center gap-1">
                <!-- First Page -->
                <button 
                  @click="goToPage(1)"
                  :disabled="currentPage === 1"
                  class="w-9 h-9 flex items-center justify-center rounded-lg transition-colors text-sm"
                  :class="currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'"
                >
                  <UIcon name="mdi:chevron-double-left" />
                </button>

                <!-- Previous Page -->
                <button 
                  @click="prevPage"
                  :disabled="currentPage === 1"
                  class="w-9 h-9 flex items-center justify-center rounded-lg transition-colors text-sm"
                  :class="currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'"
                >
                  <UIcon name="mdi:chevron-left" />
                </button>

                <!-- Page Numbers -->
                <div class="flex items-center">
                  <template v-for="page in visiblePages" :key="page">
                    <button 
                      v-if="page !== '...'"
                      @click="goToPage(page)"
                      class="w-9 h-9 flex items-center justify-center rounded-lg transition-colors text-sm mx-0.5"
                      :class="currentPage === page ? 'bg-blue-600 text-white font-medium' : 'hover:bg-gray-100 text-gray-600'"
                    >
                      {{ page }}
                    </button>
                    <span 
                      v-else 
                      class="w-9 h-9 flex items-center justify-center text-gray-400"
                    >
                      {{ page }}
                    </span>
                  </template>
                </div>

                <!-- Next Page -->
                <button 
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                  class="w-9 h-9 flex items-center justify-center rounded-lg transition-colors text-sm"
                  :class="currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'"
                >
                  <UIcon name="mdi:chevron-right" />
                </button>

                <!-- Last Page -->
                <button 
                  @click="goToPage(totalPages)"
                  :disabled="currentPage === totalPages"
                  class="w-9 h-9 flex items-center justify-center rounded-lg transition-colors text-sm"
                  :class="currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'"
                >
                  <UIcon name="mdi:chevron-double-right" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
  <ReceiptTemplate ref="receiptRef" :order="selectedOrderForPrint" />
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useOrderStore } from '~/stores/orderStore';
import CustomUSelect from '~/components/CustomUSelect.vue';
import DateRangeSelector from '~/components/DateRangeSelector.vue';
import FilterOptions from '~/components/FilterOptions.vue';
import ReceiptTemplate from './ReceiptTemplate.vue';

const props = defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(['update:modelValue', 'select-order']);

const OrderStore = useOrderStore();

const searchQuery = ref('');
const dateFrom = ref(null);
const dateTo = ref(null);
const selected = ref(null);
const selectedFilter = ref('all');
const isLoading = ref(true);

const orders = computed(() => OrderStore.orders);

const types = [
  { value: 'dine-in', label: 'Dine in' },
  { value: 'takeaway', label: 'Take away' },
];

const filtersList = ref([
  { value: 'all', name: 'All', count: 0 },
  { value: 'completed', name: 'completed', count: 0 },
  { value: 'live', name: 'live', count: 0 },
  { value: 'canceled', name: 'canceled', count: 0 },
]);

const currentPage = ref(1);
const itemsPerPage = 8;

const totalOrders = computed(() => filteredOrders.value.length || 0);

const totalPages = computed(() => {
  return Math.ceil(totalOrders.value / itemsPerPage) || 1; // Ensure at least 1 page
});

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredOrders.value.slice(start, end);
});

const filteredOrders = computed(() => {
  if (!Array.isArray(orders.value)) {
    return [];
  }
  
  return orders.value.filter(order => {
    const matchesSearch = order.code.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesType = !selected.value || order.type === selected.value;
    const matchesFilter = selectedFilter.value === 'all' || order.status === selectedFilter.value;
    return matchesSearch && matchesType && matchesFilter;
  });
});

const updateFilterCounts = () => {
  const ordersArray = orders.value || [];
  
  const counts = {
    all: ordersArray.length,
    completed: ordersArray.filter(order => order.status === 'completed').length,
    live: ordersArray.filter(order => order.status === 'live').length,
    canceled: ordersArray.filter(order => order.status === 'canceled').length
  };

  filtersList.value = filtersList.value.map(filter => ({
    ...filter,
    count: counts[filter.value.toLowerCase()] || 0
  }));
};

watch(() => orders.value, (newOrders) => {
  
  if (newOrders === undefined || newOrders === null) {
    isLoading.value = true;
    return;
  }

  isLoading.value = false;
  updateFilterCounts();
}, { 
  immediate: true,
  deep: true
});

watch(() => props.modelValue, (newValue) => {
  if (newValue && orders.value?.length) {
    updateFilterCounts();
  }
});

const getStatusClass = (status) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium';
    case 'live':
      return 'px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium';
    case 'canceled':
      return 'px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium';
    default:
      return 'px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium';
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPrice = (price) => {
  return typeof price === 'number' ? price.toFixed(2) : parseFloat(price).toFixed(2);
};

const selectOrder = (order) => {
  if (order.status !== 'live') return;
  
  OrderStore.$state.openOrder = true;
  OrderStore.currentOrder = {
    id: order.id,
    guest: order.guest,
    type: order.type,
    table_id: order.table_id,
    items: order.order_items,
    shift_id: order.shift_id,
    tax: parseFloat(order.tax),
    discount: parseFloat(order.discount),
    service: parseFloat(order.service),
    sub_total: parseFloat(order.sub_total),
    total_amount: parseFloat(order.total_amount),
  };
  
  OrderStore.openExistingOrder(order.id);
  emit('select-order', order);
};

const closeModal = () => {
  emit('update:modelValue', false);
};

const receiptRef = ref(null);
const selectedOrderForPrint = ref({});

const printOrder = (order) => {
  selectedOrderForPrint.value = {
    id: order.id,
    code: order.code,
    created_at: order.created_at,
    type: order.type,
    table_id: order.table_id,
    guest: order.guest || 'Walk-in Customer',
    status: order.status,
    items: order.items,
    sub_total: parseFloat(order.sub_total || 0),
    tax: parseFloat(order.tax || 0),
    service_charge: parseFloat(order.service || 0),
    discount: parseFloat(order.discount || 0),
    total_amount: parseFloat(order.total_amount || 0),
    ...(order.status !== 'live' && {
      payments: [{
        method: order.payment_method || 'Unknown',
        amount: parseFloat(order.total_amount || 0),
        change_amount: 0
      }]
    })
  };
  
  nextTick(() => {
    receiptRef.value?.printReceipt();
  });
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    scrollToTop();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    scrollToTop();
  }
};

const goToPage = (page) => {
  if (typeof page === 'number' && page !== currentPage.value) {
    currentPage.value = page;
    scrollToTop();
  }
};

const scrollToTop = () => {
  const container = document.querySelector('.orders-container');
  if (container) {
    container.scrollTop = 0;
  }
};

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage + 1;
});

const endIndex = computed(() => {
  return Math.min(currentPage.value * itemsPerPage, totalOrders.value);
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, '...', total];
  }

  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total];
  }

  return [
    1,
    '...',
    current - 1,
    current,
    current + 1,
    '...',
    total
  ];
});

const handleSearch = () => {
  currentPage.value = 1;
};

watch(searchQuery, () => {
  currentPage.value = 1;
});

watch(selectedFilter, () => {
  currentPage.value = 1;
});

watch(selected, () => {
  currentPage.value = 1;
});

</script>

<style scoped>
.overlay-enter-active {
  transition: opacity 0.3s ease;
}

.overlay-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.modal-container {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* Update status classes */
.getStatusClass {
  @apply px-2.5 py-1 rounded-lg text-xs font-medium;
}
[data-status="completed"] {
  @apply bg-green-50 text-green-700;
}
[data-status="live"] {
  @apply bg-yellow-50 text-yellow-700;
}
[data-status="canceled"] {
  @apply bg-red-50 text-red-700;
}
</style>

