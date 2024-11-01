<template>
  <div class="cashier flex bg-gray-100">
    <div class="flex flex-col w-full transition-all duration-300 ease-in-out"
         :class="{'pr-[300px]': OrderStore.$state.openOrder}">
      <SharedCashierNavbar />
      <SharedCashierSidebar v-model="isSidebarOpen" />
      <main class="flex-grow p-1">
        <NuxtPage></NuxtPage>
      </main>
    </div>
    
    <!-- New Order Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showNewOrderModal" class="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50" @click="showNewOrderModal = false">
          <div class="bg-white rounded-3xl p-6 lg:p-10 w-10/12 lg:w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="grid grid-cols-2 gap-8">
              <button @click="selectOrderType('dine-in')" class="order-type-btn" :class="{ 'selected': selectedOrderType === 'dine-in' }">
                <Icon name="mdi:silverware-fork-knife" class="text-[45px] lg:text-[64px]" />
                <span class="text-[23px] lg:text-2xl font-bold mt-6">Dine In</span>
              </button>
              <button @click="selectOrderType('takeaway')" class="order-type-btn" :class="{ 'selected': selectedOrderType === 'takeaway' }">
                <Icon name="mdi:food-takeout-box" class="text-[45px] lg:text-[64px]" />
                <span class="text-[23px] lg:text-2xl font-bold mt-6">Take Away</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Table Selection Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showTableModal" class="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50" @click="showTableModal = false">
          <div class="bg-white rounded-3xl p-8 w-10/12 lg:w-11/12 max-w-4xl max-h-[85vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl xl:text-[24px] font-bold text-gray-800">Select Table</h2>
                <p class="text-sm xl:text-[18px] text-gray-500 mt-1">Choose a table for your guests</p>
              </div>
              <button @click="showTableModal = false" class="text-gray-400 hover:text-gray-600">
                <Icon name="mdi:close" size="24" />
              </button>
            </div>            
            <div class="grid grid-cols-3 md:grid-cols-4 gap-4">
              <button 
                v-for="table in tables" 
                :key="table.id" 
                @click="selectTable(table)" 
                class="flex flex-col items-center justify-center p-2 sm:p-4  bg-white border-2 rounded-xl transition-all duration-300"
                :class="{
                  'border-red-200 bg-red-50/50 hover:cursor-not-allowed': table.is_free === 0,
                  'border-[#2b3c5e] bg-white hover:scale-105 sm:hover:scale-110 md:hover:scale-125 lg:hover:scale-150 hover:shadow-xl hover:border-[#2b3c5e] hover:bg-[#f8faff]': table.is_free === 1
                }"
              >
                <div class="mb-1 sm:mb-2 md:mb-3 p-1 sm:p-2 md:p-2 rounded-full bg-gray-50 transition-all duration-300">
                  <Icon 
                    :name="table.is_free === 1 ? 'mdi:table-furniture' : 'mdi:table-lock'" 
                    class="text-xl md:text-2xl lg:text-[34px]"
                    :class="[
                      table.is_free === 1 ? 'text-[#2b3c5e] group-hover:text-white' : 'text-red-500'
                    ]"
                  />
                </div>
                <div class="md:text-[16px] lg:text-[18px] xl:text-xl font-bold">{{ table.number }}</div>
                <div class="mt-1 sm:mt-2 text-[13px] lg:text-[15px] text-gray-600">
                  {{ table.capacity }} {{ table.capacity === 1 ? 'Guest' : 'Guests' }}
                </div>
                <div class="mt-1 sm:mt-2 text-[14px] lg:text-md" 
                    :class="{'text-green-600': table.is_free === 1, 'text-red-600': table.is_free === 0}">
                  {{ table.is_free === 0 ? formatDate(table.created_at) : 'Available' }}
                </div>
                <div v-if="table.is_free === 0" class="mt-1 text-[14px] lg:text-lg text-gray-500">
                  {{ table.waiter }}
                </div>
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
  if (type === 'dine-in') {
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