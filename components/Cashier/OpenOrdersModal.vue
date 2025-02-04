<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 bg-gray-900/60  flex items-center justify-center z-30 p-4" :class="{'w-[calc(100%-300px)] xl:w-[calc(100%-400px)] 2xl:w-[calc(100%-500px)]': OrderStore.$state.openOrder, 'w-full': !OrderStore.$state.openOrder}" @click="closeModal">
        <div class="bg-white py-4 px-2 rounded-[30px] w-full max-w-3xl h-[80vh] overflow-hidden shadow-lg overflow-y-auto" @click.stop>
          <div class="p-2 pl-4 w-full flex justify-between items-center">
            <h3 class="text-lg font-bold text-[#1A1A1A] text-center">Open Orders</h3>
            <button @click="closeModal" class="text-gray-500 hover:text-gray-700 mr-4">
              <UIcon name="mdi:close" class="text-lg" />
            </button>
          </div>
          <div class="p-4 py-2 bg-white border-b border-gray-200">
            <div class="flex flex-wrap gap-4">
              <div class="item">
                <div class="border border-[#d1d5db] rounded-lg flex items-center justify-between">
                  <input type="text" v-model="searchQuery" class="min-w-[250px] h-[25px] text-[12px] font-[400] ml-[10px] placeholder:text-[#878787]" placeholder="Search orders" name="search" id="global-search" @input="handleSearch">
                  <UIcon name="mdi:search" class="text-[#878787] text-[17px] font-[100] m-[10px]" />
                </div>
              </div>
              <!-- <div class="item">
                <DateRangeSelector v-model:from="dateFrom" v-model:to="dateTo" @update:dates="handleDateChange" placeholder="Select date" />
              </div> -->
              <div class="item">
                <CustomUSelect v-model="selected" :options="types" />
              </div>
            </div>
            <div class="mt-[20px] mb-[15px]">
              <FilterOptions :filters="filtersList" v-model="selectedFilter" />
            </div>
          </div>
          <div class="p-6 bg-white">
            <div v-if="isLoading" class="text-center py-4">
              Loading orders...
            </div>
            <div v-else-if="filteredOrders.length === 0" class="text-center py-4">
              No orders found.
            </div>
            <div v-else >
              <TransitionGroup name="list" tag="div" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-3">
                <div v-for="order in filteredOrders" :key="order.id" 
                  @click="order.status === 'live' ? selectOrder(order) : null"
                  class="order-card rounded-md shadow border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md"
                  :class="{
                    'cursor-pointer hover:scale-105': order.status === 'live',
                    'bg-green-50': order.status === 'completed',
                    'bg-red-50': order.status === 'canceled',
                  }">
                  <div class="p-4">
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-sm font-semibold text-gray-800">{{ order.code }}</span>   
                      <span :class="getStatusClass(order.status)">
                        {{ order.status }}
                      </span>
                    </div>
                    <div class="text-xs text-gray-600 mb-1">{{ formatDate(order.created_at) }}</div>
                    <div class="flex items-center justify-between mb-1">
                      <div class="flex items-center">
                        <Icon name="mdi:silverware-fork-knife" class="text-gray-500 mr-1 text-xs" />
                        <span class="text-xs text-gray-600">{{ order.type }}</span>
                      </div>
                      <div class="flex items-center">
                        <Icon name="mdi:account" class="text-gray-500 mr-1 text-xs" />
                        <span class="text-xs text-gray-600">Table {{ order.table_id }}</span>
                      </div>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-xs font-medium text-gray-500">Total</span>
                      <span class="text-sm font-bold text-gray-800">${{ formatPrice(order.total_amount) }}</span>
                    </div>
                    <div class="flex justify-between items-center mt-2">
                      <button 
                        @click.stop="printOrder(order)"
                        class="text-xs flex items-center gap-1 text-gray-600 hover:text-gray-800"
                      >
                        <Icon name="mdi:printer" class="text-sm" />
                        Print
                      </button>
                      <span v-if="order.status !== 'live'" class="text-xs">
                        <span v-if="order.status === 'completed'" class="text-green-600">Order completed</span>
                        <span v-else class="text-red-600">Order canceled</span>
                      </span>
                    </div>
                  </div>
                </div>
              </TransitionGroup>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
  <ReceiptTemplate 
    ref="receiptRef"
    :order="selectedOrderForPrint"
  />
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
const selectedFilter = ref('all'); // تعيين القيمة الافتراضية
const isLoading = ref(true);

// استخدام ref للطلبات بدلاً من computed مباشرة
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

// تحديث filteredOrders
const filteredOrders = computed(() => {
  if (isLoading.value || !orders.value?.length) return [];
  
  return orders.value.filter(order => {
    const matchesSearch = order.code.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesType = !selected.value || order.type === selected.value;
    const matchesFilter = selectedFilter.value === 'all' || order.status === selectedFilter.value;
    const orderDate = new Date(order.created_at);
    const matchesDate = (!dateFrom.value || !dateTo.value) || 
                       (orderDate >= dateFrom.value && orderDate <= dateTo.value);
    return matchesSearch && matchesType && matchesFilter && matchesDate;
  });
});

// تحديث updateFilterCounts
const updateFilterCounts = () => {
  if (!orders.value?.length) return;
  
  const counts = {
    all: orders.value.length,
    completed: orders.value.filter(order => order.status === 'completed').length,
    live: orders.value.filter(order => order.status === 'live').length,
    canceled: orders.value.filter(order => order.status === 'canceled').length
  };

  filtersList.value = filtersList.value.map(filter => ({
    ...filter,
    count: counts[filter.value.toLowerCase()] || 0
  }));
};

// تحديث watch للـ orders
watch(() => orders.value, (newOrders) => {
  if (newOrders?.length) {
    isLoading.value = false;
    updateFilterCounts();
  }
}, { immediate: true });

// تحديث watch للـ modelValue
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
  console.log(order)
  selectedOrderForPrint.value = {
    id: order.id,
    code: order.code,
    created_at: order.created_at,
    type: order.type,
    table_id: order.table_id,
    guest: order.guest || 'Walk-in Customer',
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

</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>

