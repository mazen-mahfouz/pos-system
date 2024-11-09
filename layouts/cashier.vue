<template>
  <div class="cashier flex bg-gray-100">
    <div class="flex flex-col w-full transition-all duration-300 ease-in-out"
         :class="{'pr-[300px] xl:pr-[400px] 2xl:pr-[500px]': OrderStore.$state.openOrder}">
      <SharedCashierNavbar />
      <SharedCashierSidebar v-model="isSidebarOpen" />
      <main class="flex-grow p-1">
        <NuxtPage></NuxtPage>
      </main>
    </div>
    
    <CashierNewOrderModal v-model="showNewOrderModal" @select-order-type="selectOrderType" />
    <CashierTableModal v-model="showTableModal" :tables="tables" @select-table="selectTable" />
    <CashierOpenOrdersModal v-model="showOpenOrdersModal" @select-order="selectOrder" />
    <CashierOrderDetails 
      @edit-type="editOrderType"
      @edit-table="editOrderTable"
    />
    <CashierEditTypeModal 
      v-model="showEditTypeModal" 
      :current-type="OrderStore.currentOrder.type"
      @update-type="updateOrderType"
    />
    <CashierEditTableModal
      v-model="showEditTableModal"
      :tables="tables"
      :current-table="OrderStore.currentOrder.table_id"
      @update-table="updateOrderTable"
    />
    <CashierPermissionModal
      v-model="showPermissionModal"
      :action="permissionAction"
      @confirm="handlePermissionConfirm"
    />

    <Notivue v-slot="item">
      <Notification :item="item" :theme="darkTheme" />
    </Notivue>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useOrderStore } from '~/stores/orderStore';
import { useAuthStore } from '~/stores/auth';

const OrderStore = useOrderStore();
const AuthStore = useAuthStore();
const showNewOrderModal = ref(false);
const showTableModal = ref(false);
const showOpenOrdersModal = ref(false);
const isSidebarOpen = ref(false);
const tables = ref([]);
const showEditTypeModal = ref(false);
const showEditTableModal = ref(false);
const showPermissionModal = ref(false);
const permissionAction = ref('');

const selectOrderType = (type) => {
  if (type === 'dine-in') {
    showTableModal.value = true;
  } else {
    OrderStore.createNewOrder(type, null);
  }
  showNewOrderModal.value = false;
};

const selectTable = (table) => {
  OrderStore.createNewOrder('dine-in', table.id);
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
  showOpenOrdersModal.value = false;
};

const editOrderType = () => {
  if (OrderStore.currentOrder.id) {
    permissionAction.value = 'edit order';
    showPermissionModal.value = true;  
  } else {
    showEditTypeModal.value = true;
  }
};

const updateOrderType = (type) => {
  if (type === 'takeaway') {
    OrderStore.currentOrder.type = type;
    OrderStore.currentOrder.table_id = null;
    showEditTypeModal.value = false;
    if (OrderStore.currentOrder.id) {
      OrderStore.placeOrder();
    }
  } else if (type === 'dine-in') {
    showEditTypeModal.value = false;
    showEditTableModal.value = true;
  }
};

const updateOrderTable = (table) => {
  OrderStore.currentOrder.type = 'dine-in';
  OrderStore.currentOrder.table_id = table.id;
  showEditTableModal.value = false;
  if (OrderStore.currentOrder.id) {
    OrderStore.placeOrder();
  }
};

const editOrderTable = () => {
  showEditTableModal.value = true;
};

const handlePermissionConfirm = (verified) => {
  showPermissionModal.value = false;
  if (verified) {
    if (permissionAction.value === 'edit order') {
      showEditTypeModal.value = true;
    }
  }
};

provide('openNewOrderModal', openNewOrderModal);
provide('openOrdersModal', openOrdersModal);
</script>

<style lang="scss" scoped>
* {
  user-select: none;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>