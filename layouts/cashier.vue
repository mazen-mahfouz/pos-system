<template>
  <div class="cashier flex bg-gray-100">
    <div class="flex flex-col w-full transition-all duration-300 ease-in-out"
         :class="{'pr-[330px]': OrderStore.$state.openOrder}">
      <SharedCashierNavbar />
      <SharedCashierSidebar v-model="isSidebarOpen" />
      <main class="flex-grow p-1">
        <NuxtPage></NuxtPage>
      </main>
    </div>
    
    <!-- New Order Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showNewOrderModal" class="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50">
          <div class="bg-white rounded-3xl p-10 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="grid grid-cols-2 gap-8">
              <button @click="selectOrderType('dine in')" class="order-type-btn" :class="{ 'selected': selectedOrderType === 'dine in' }">
                <Icon name="mdi:silverware-fork-knife" size="64" />
                <span class="text-2xl font-bold mt-6">Dine In</span>
              </button>
              <button @click="selectOrderType('takeaway')" class="order-type-btn" :class="{ 'selected': selectedOrderType === 'takeaway' }">
                <Icon name="mdi:food-takeout-box" size="64" />
                <span class="text-2xl font-bold mt-6">Take Away</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Table Selection Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showTableModal" class="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50">
          <div class="bg-white rounded-3xl p-10 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 class="text-2xl font-bold mb-8 text-center">Select Table</h3>
            <div class="grid grid-cols-4 gap-6">
              <button v-for="table in tables" :key="table.id" @click="selectTable(table)" 
                      class="table-btn" :class="{ 'occupied': table.is_free === 0, 'available': table.is_free === 1 }">
                <div class="text-xl font-bold">{{ table.number }}</div>
                <div class="mt-2 text-sm">{{ table.capacity }} {{ table.capacity === 0 ? 'Guest' : 'Guests' }}</div>
                <div class="mt-2 text-xs" :class="{'text-green-600': table.is_free === 1, 'text-red-600': table.is_free === 0}">
                  {{ table.is_free === 0 ? formatDate(table.created_at) : 'Available' }}
                </div>
                <div v-if="table.is_free === 0" class="mt-1 text-sm text-gray-600">{{ table.waiter }}</div>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    
    <!-- Open Orders Modal -->
    <CashierOpenOrdersModal v-model="showOpenOrdersModal" @select-order="selectOrder" />

    <!-- Order Sidebar -->
    <CashierOrderDetails />

    <Notivue v-slot="item">
      <Notification :item="item" :theme="darkTheme" />
    </Notivue>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useOrderStore } from '~/stores/orderStore';
import { useAuthStore } from '~/stores/auth';
import { format } from 'date-fns';


const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, 'EEE, h:mm a');
};
const OrderStore = useOrderStore();
const AuthStore = useAuthStore();
const showNewOrderModal = ref(false);
const showTableModal = ref(false);
const showOpenOrdersModal = ref(false);
const selectedOrderType = ref(null);
const selectedTable = ref(null);
const isSidebarOpen = ref(false);

const tables = ref([]);

onMounted(() => {
  fetchTables();
  console.log(AuthStore.$state.user);
}); 

const fetchTables = () => {
  useApi('tables', 'GET')
    .then(response => {
      tables.value = response;
    })
    .catch(error => {
      console.error('Error fetching tables:', error);
      HandleReqErrors(error);
    });
};


const selectOrderType = (type) => {
  selectedOrderType.value = type;
  if (type === 'dine in') {
    showTableModal.value = true;
  } else {
    confirmNewOrder();
  }
  showNewOrderModal.value = false;
};

const selectTable = (table) => {
  if (table.is_free === 1) {
    selectedTable.value = table;
    confirmNewOrder();
  }
};

const confirmNewOrder = () => {
  OrderStore.createNewOrder(selectedOrderType.value, selectedTable.value?.id);
  OrderStore.$state.openOrder = true;
  showTableModal.value = false;
};

const openNewOrderModal = () => {
  showNewOrderModal.value = true;
};

const openOrdersModal = () => {
  showOpenOrdersModal.value = true;
};

const selectOrder = (order) => {
  OrderStore.openExistingOrder(order.id);
  showOpenOrdersModal.value = true;
};

// Provide functions to child components
provide('openNewOrderModal', openNewOrderModal);
provide('openOrdersModal', openOrdersModal);
</script>

<style lang="scss" scoped>
* {
  user-select: none;
}
.order-type-btn {
  @apply flex flex-col items-center justify-center p-10 bg-white border-2 border-gray-200 rounded-3xl transition-all duration-300;
  &.selected {
    @apply border-blue-500 bg-blue-50;
  }
  &:hover {
    @apply bg-gray-50 transform scale-105;
  }
}

.table-btn {
  @apply flex flex-col items-center justify-center p-6 bg-white border-2 rounded-2xl transition-all duration-300;
  &.occupied {
    @apply border-red-300 bg-red-50;
  }
  &.available {
    @apply border-green-300 bg-green-50;
  }
  &:hover {
    @apply transform scale-105;
  }
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease-out;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>