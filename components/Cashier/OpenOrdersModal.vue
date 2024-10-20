<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 p-4" @click="closeModal">
        <div class="bg-white py-[20px] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl" @click.stop>
          <div class="p-4 pl-[50px] w-full flex justify-between items-center">
            <h3 class="text-[25px] font-bold text-[#1A1A1A] text-center">Open Orders</h3>
            <button @click="closeModal" class="text-gray-500 hover:text-gray-700 mr-[50px]">
              <UIcon name="mdi:close" class="text-[24px]" />
            </button>
          </div>
          <div class="p-6 bg-white border-b border-gray-200">
            <div class="flex flex-wrap gap-4">
              <div class="item">
                <div class="border border-[#d1d5db] rounded-lg flex items-center justify-between">
                  <input type="text" v-model="searchQuery" class="min-w-[150px] h-[43px] text-[14px] font-[400] ml-[20px] placeholder:text-[#878787]" placeholder="Search orders" name="search" id="global-search" @input="handleSearch">
                  <UIcon name="mdi:search" class="text-[#878787] text-[20px] font-[100] m-[10px]" />
                </div>
              </div>
              <div class="item">
                <DateRangeSelector v-model:from="dateFrom" v-model:to="dateTo" @update:dates="handleDateChange" placeholder="Select date" />
              </div>
              <div class="item">
                <CustomUSelect v-model="selected" :options="types" />
              </div>
            </div>
            <div class="my-[20px]">
              <FilterOptions :filters="filtersList" v-model="selectedFilter" />
            </div>
          </div>
          <div class="p-6 bg-white">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
              <div v-for="order in filteredOrders" :key="order.id" 
                @click="selectOrder(order)"
                class="order-card bg-white rounded-lg shadow border border-gray-200 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg">
                <div class="p-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-lg font-semibold text-gray-800">{{ order.name }}</span>
                    <span :class="getStatusClass(order.status)">
                      {{ order.status }}
                    </span>
                  </div>
                  <div class="text-sm text-gray-600 mb-3">{{ formatDate(order.date) }}</div>
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center">
                      <Icon name="mdi:silverware-fork-knife" class="text-gray-500 mr-2" />
                      <span class="text-sm text-gray-600">{{ order.type }}</span>
                    </div>
                    <div class="flex items-center">
                      <Icon name="mdi:account" class="text-gray-500 mr-2" />
                      <span class="text-sm text-gray-600">{{ order.guests }} guests</span>
                    </div>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-500">Total</span>
                    <span class="text-lg font-bold text-gray-800">${{ formatPrice(calculateTotal(order)) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useOrderStore } from '~/stores/orderStore';

const props = defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(['update:modelValue', 'select-order']);

const OrderStore = useOrderStore();

const searchQuery = ref('');
const dateFrom = ref(null);
const dateTo = ref(null);
const selected = ref(null);
const selectedFilter = ref(null);

const types = [
  { value: 'Dine in', label: 'Dine in' },
  { value: 'Take away', label: 'Take away' },
];

const filtersList = [
  { value: 'all', name: 'All Locations', count: 10 },
  { value: 'city1', name: 'City 1' },
  { value: 'city2', name: 'City 2' },
];

const openOrders = computed(() => OrderStore.$state.orders.filter(order => !order.completed));

const filteredOrders = computed(() => {
  return openOrders.value.filter(order => {
    const matchesSearch = order.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesType = selected.value ? order.type === selected.value : true;
    const matchesFilter = selectedFilter.value === 'all' || order.location === selectedFilter.value;
    const matchesDate = (!dateFrom.value || !dateTo.value) || (order.date >= dateFrom.value && order.date <= dateTo.value);
    return matchesSearch && matchesType && matchesFilter && matchesDate;
  });
});

const getStatusClass = (status) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium';
    case 'in progress':
      return 'px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium';
    default:
      return 'px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium';
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPrice = (price) => {
  return typeof price === 'number' ? price.toFixed(2) : price;
};

const calculateTotal = (order) => {
  const subtotal = order.items.reduce((total, item) => total + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const discount = 1.00;
  return subtotal + tax - discount;
};

const selectOrder = (order) => {
  emit('select-order', order);
  emit('update:modelValue', false);
};

const handleSearch = () => {
  // Implement search logic if needed
};

const handleDateChange = () => {
  // Implement date change logic if needed
};

const closeModal = () => {
  emit('update:modelValue', false);
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>