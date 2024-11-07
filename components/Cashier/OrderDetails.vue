<template>
  <div class="fixed top-0 right-0 h-screen w-[300px] xl:w-[400px] 2xl:w-[500px] bg-white shadow-lg flex flex-col transition-transform duration-300 ease-in-out transform"
       :class="{ 'translate-x-0': OrderStore.$state.openOrder, 'translate-x-full': !OrderStore.$state.openOrder }">
    
    <div class="bg-gradient-to-r from-[#2b3c5e] to-[#1a2744] p-3">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <div class="bg-white/10 p-1.5 rounded-lg">
            <Icon name="mdi:receipt" class="text-white xl:text-2xl" size="18" />
          </div>
          <h2 class="text-white text-sm xl:text-xl font-semibold">Order Details</h2>
        </div>
        <span class="bg-white/20 px-2 py-1 rounded-full text-xs xl:text-base text-white">
          #{{ OrderStore.currentOrder.id || 'New' }}
        </span>
      </div>
    </div>

    <div class="p-3 bg-gray-50/50">
      <div class="bg-white rounded-lg p-2 shadow-sm space-y-2">
        <div class="flex items-center space-x-2 bg-gray-50/50 rounded-lg p-1.5">
          <Icon name="mdi:account" size="16" class="text-gray-500 xl:text-xl" />
          <input
            v-model="OrderStore.currentOrder.guest"
            type="text"
            placeholder="Guest Name"
            class="w-full bg-transparent text-xs xl:text-base focus:outline-none"
          >
        </div>
        
        <div class="flex space-x-1">
          <div @click="editOrderType" class="flex-1 bg-gray-50/50 rounded-lg p-1.5 cursor-pointer hover:bg-gray-100 transition-colors">
            <div class="flex items-center space-x-1">
              <Icon :name="getOrderTypeIcon(OrderStore.currentOrder.type)" size="16" class="text-gray-500" />
              <span class="text-[10px] lg:text-sm text-gray-600">{{ OrderStore.currentOrder.type || 'Type' }}</span>
            </div>
          </div>
          <div @click="editOrderTable" v-if="isDineIn" class="flex-1 bg-gray-50/50 rounded-lg p-1.5 cursor-pointer hover:bg-gray-100 transition-colors">
            <div class="flex items-center space-x-1">
              <Icon name="ic:baseline-table-restaurant" size="16" class="text-gray-500" />
              <span class="text-[10px] lg:text-sm text-gray-600">Table {{ OrderStore.currentOrder.table_id || 'any' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-grow overflow-y-auto px-3 py-2">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-xs xl:text-base font-medium text-gray-500">ORDER ITEMS</h3>
        <span class="text-xs xl:text-base bg-[#2b3c5e]/10 text-[#2b3c5e] px-2 py-0.5 rounded-full">
          {{ OrderStore.currentOrder.items.length }} items
        </span>
      </div>

      <TransitionGroup name="list" tag="ul" class="space-y-2">
        <li v-for="item in OrderStore.currentOrder.items" 
            :key="item.product_id" 
            class="group bg-white rounded-lg p-2 shadow-sm hover:shadow transition-all duration-200 border border-gray-100/50">
          <div class="flex items-center">
            <div class="relative flex-shrink-0">
              <img :src="item.product?.image || item.image" 
                   :alt="item.name" 
                   class="w-10 h-10 xl:w-16 xl:h-16 object-cover rounded-lg shadow-sm">
              <div class="absolute -top-1 -right-1 bg-[#2b3c5e] text-white text-[10px] xl:text-sm w-4 h-4 xl:w-6 xl:h-6 rounded-full flex items-center justify-center shadow-sm">
                {{ item.quantity }}
              </div>
            </div>
            
            <div class="ml-2 lg:ml-3 flex-grow">
              <p class="text-xs lg:text-sm font-medium text-gray-700 line-clamp-1">
                {{ item.product?.name || item.name }}
              </p>
              <p class="text-xs lg:text-sm text-gray-500">£{{ formatPrice(item.price) }}</p>
            </div>

            <div class="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="handleDecreaseQuantity(item)" 
                      class="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <Icon name="mdi:minus" size="14" />
              </button>
              <button @click="OrderStore.increaseQuantity(item.product_id)" 
                      class="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <Icon name="mdi:plus" size="10" />
              </button>
              <button @click="confirmRemoveItem(item)" 
                      class="p-1 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                <Icon name="mdi:delete" size="10" />
              </button>
            </div>
          </div>
        </li>
      </TransitionGroup>
    </div>

    <div class="bg-gray-50/50 p-3 space-y-2">
      <div class="bg-white rounded-lg p-2 shadow-sm space-y-2">
        <div class="flex justify-between items-center text-xs xl:text-base">
          <div class="flex items-center space-x-1 text-gray-600">
            <Icon name="mdi:cart-outline" size="12" />
            <span>Subtotal</span>
          </div>
          <span class="font-medium">£{{ formatPrice(OrderStore.currentOrder.sub_total || 0) }}</span>
        </div>
        
        <div class="flex justify-between items-center text-xs xl:text-base">
          <div class="flex items-center space-x-1 text-gray-600">
            <Icon name="mdi:percent" size="12" />
            <span>Tax</span>
          </div>
          <span class="font-medium">£{{ formatPrice(OrderStore.currentOrder.tax || 0) }}</span>
        </div>
        
        <div class="flex justify-between items-center text-xs xl:text-base">
          <div class="flex items-center space-x-1 text-green-600 cursor-pointer"
               @click="handleDiscountClick">
            <Icon name="mdi:tag-outline" size="12" />
            <span>Discount</span>
            <Icon v-if="OrderStore.currentOrder.discount > 0" 
                  name="mdi:pencil" 
                  size="12" 
                  class="ml-1" />
          </div>
          <div class="flex items-center">
            <span class="font-medium text-green-600">
              -£{{ OrderStore.currentOrder.discount > 0 ? formatPrice(OrderStore.currentOrder.discount) : '0.00' }}
            </span>
            <Icon v-if="OrderStore.currentOrder.discount > 0"
                  @click="handleRemoveDiscount"
                  name="mdi:close"
                  size="12"
                  class="ml-2 cursor-pointer text-red-500 hover:text-red-600" />
          </div>
        </div>
      </div>

      <button @click="checkout" 
              class="w-full bg-gradient-to-r from-[#2b3c5e] to-[#1a2744] text-white rounded-lg p-2 hover:shadow-lg transition-all duration-300">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <Icon name="mdi:cash-register" size="20" class="xl:text-2xl" />
            <span class="text-xs xl:text-base font-medium">Total</span>
          </div>
          <span class="font-bold text-xs xl:text-base">£{{ formatPrice(OrderStore.currentOrder.total_amount || 0) }}</span>
        </div>
      </button>
    </div>

    <div class="p-3 pt-2 flex items-center gap-2 bg-white">
      <button @click="OrderStore.currentOrder.id ? updateOrder() : placeOrder()" 
              class="flex-1 bg-[#2b3c5e] text-white py-1.5 lg:py-2 px-2 lg:px-3 rounded-lg hover:bg-[#22407c] active:scale-95 transition-all duration-200 text-xs lg:text-sm font-medium flex items-center justify-center space-x-1">
        <Icon :name="OrderStore.currentOrder.id ? 'mdi:pencil' : 'mdi:check'" size="16" />
        <span>{{ OrderStore.currentOrder.id ? 'Update' : 'Place' }}</span>
      </button>
      <button @click="OrderStore.cancelOrder" 
              class="flex-1 bg-red-50 text-red-600 py-1.5 lg:py-2 px-2 lg:px-3 rounded-lg hover:bg-red-100 active:scale-95 transition-all duration-200 text-xs lg:text-sm font-medium flex items-center justify-center space-x-1">
        <Icon name="mdi:close" size="12" />
        <span>Cancel</span>
      </button>
    </div>

    <CashierPaymentModal
      v-model="showPaymentModal"
      :total="OrderStore.currentOrder.total_amount || 0"
      :orderData="OrderStore.currentOrder"
      @payment-complete="processPayment"
    />

    <CashierPermissionModal
      v-model="showPermissionModal"
      :action="permissionAction"
      @confirm="handlePermissionConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useOrderStore } from '~/stores/orderStore';
const OrderStore = useOrderStore();

const showPaymentModal = ref(false);
const showPermissionModal = ref(false);
const permissionAction = ref('');
const selectedItem = ref(null);
const pendingAction = ref(null);

const handlePermissionConfirm = async (verified) => {
  if (!verified) return;

  switch (pendingAction.value) {
    case 'remove':
      if (selectedItem.value) {
        OrderStore.removeItem(selectedItem.value.product_id);
        selectedItem.value = null;
      }
      break;
    case 'decrease':
      if (selectedItem.value) {
        OrderStore.decreaseQuantity(selectedItem.value.product_id);
        selectedItem.value = null;
      }
      break;
    case 'edit-type':
      emit('edit-type');
      break;
    case 'remove-discount':
      try {
        await useApi(`orders/${OrderStore.currentOrder.id}/discount`, 'DELETE');
        const orderResponse = await useApi(`orders/${OrderStore.currentOrder.id}`, 'GET');
        OrderStore.updateOrderFromResponse(orderResponse.order);
        push.success('Discount removed successfully');
      } catch (error) {
        console.error('Error removing discount:', error);
        push.error('Failed to remove discount');
      }
      break;
    default:
      if (permissionAction.value.includes('discount')) {
        emit('open-discount-modal');
      }
  }
  
  pendingAction.value = null;
};

const confirmRemoveItem = (item) => {
  selectedItem.value = item;
  permissionAction.value = 'remove discount';
  pendingAction.value = 'remove';
  showPermissionModal.value = true;
};

const handleDecreaseQuantity = (item) => {
  if (item.quantity === 1) {
    selectedItem.value = item;
    permissionAction.value = 'edit order';
    pendingAction.value = 'decrease';
    showPermissionModal.value = true;
  } else {
    OrderStore.decreaseQuantity(item.product_id);
  }
};

const checkout = () => {
  if (OrderStore.currentOrder.items.length === 0) {
    return;
  }
  showPaymentModal.value = true;
};

const processPayment = async (paymentDetails) => {
  let orderId = OrderStore.currentOrder.id;

  if (!orderId) {
    const placeOrderResponse = await useApi('orders', 'POST', {
      type: 'object',
      data: {
        guest: OrderStore.currentOrder.guest,
        type: OrderStore.currentOrder.type,
        table_id: OrderStore.currentOrder.table_id,
        items: OrderStore.currentOrder.items,
        shift_id: OrderStore.currentOrder.shift_id,
      },
    });
    orderId = placeOrderResponse.order.id;
  }

  await useApi('payment', 'POST', {
    type: 'object',
    data: {
      order_id: orderId,
      amount: OrderStore.currentOrder.total_amount,
      payment_method_id: paymentDetails.method,
      amount_received: paymentDetails.amountReceived,
      change_amount: paymentDetails.change
    },
  });

  showPaymentModal.value = false;
  OrderStore.closeOrder();

  // Show success message
  push.success('The payment has been processed successfully.');
  receiptRef.value?.printReceipt();
};

const formatPrice = (price) => {
  return typeof price === 'number' ? price.toFixed(2) : parseFloat(price).toFixed(2);
};

const placeOrder = async () => {
  if (OrderStore.currentOrder.items.length === 0) {
    return;
  }

  const orderData = {
    guest: OrderStore.currentOrder.guest,
    type: OrderStore.currentOrder.type,
    table_id: OrderStore.currentOrder.table_id,
    items: OrderStore.currentOrder.items.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity
    })),
    shift_id: OrderStore.currentOrder.shift_id,
  };

  if (OrderStore.currentOrder.discount && OrderStore.currentOrder.discount.type && OrderStore.currentOrder.discount.amount > 0) {
    orderData.discount = {
      type: OrderStore.currentOrder.discount.type,
      amount: OrderStore.currentOrder.discount.amount
    };
  }

  useApi('orders', 'POST', {
    type: 'object',
    data: orderData,
  })
    .then(response => {
      OrderStore.updateOrderFromResponse(response.order);
      OrderStore.closeOrder();
    })
    .catch(error => {
      console.error('Error placing order:', error);
    });
};

const updateOrder = async () => {
  if (OrderStore.currentOrder.items.length === 0) {
    return;
  }

  const orderData = {
    guest: OrderStore.currentOrder.guest,
    type: OrderStore.currentOrder.type,
    table_id: OrderStore.currentOrder.table_id,
    items: OrderStore.currentOrder.items.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity
    })),
    shift_id: OrderStore.currentOrder.shift_id,
  };

  if (OrderStore.currentOrder.discount && OrderStore.currentOrder.discount.type && OrderStore.currentOrder.discount.amount > 0) {
    orderData.discount = {
      type: OrderStore.currentOrder.discount.type,
      amount: OrderStore.currentOrder.discount.amount
    };
  }

  useApi(`orders/${OrderStore.currentOrder.id}`, 'PUT', {
    type: 'object',
    data: orderData,
  })
    .then(response => {
      OrderStore.editOrder(OrderStore.currentOrder.id, { ...OrderStore.currentOrder });
      OrderStore.closeOrder();
    })
    .catch(error => {
      console.error('Error updating order:', error);
    });
};

const isDineIn = computed(() => {
  return OrderStore.currentOrder.type && OrderStore.currentOrder.type.toLowerCase() === 'dine-in';
});

const getOrderTypeIcon = (type) => {
  if (type && type.toLowerCase() === 'dine-in') {
    return 'mdi:silverware-fork-knife';
  }
  return 'mdi:food-takeout-box';
};

const emit = defineEmits(['edit-type', 'edit-table']);

const editOrderType = () => {
  if (OrderStore.currentOrder.id) {
    emit('edit-type');
  } else {
    emit('edit-type');
  }
};

const editOrderTable = () => {
  emit('edit-table');
};

const handleDiscountClick = () => {
  showPermissionModal.value = true;
  permissionAction.value = OrderStore.currentOrder.discount > 0 ? 'edit discount' : 'create discount';
};

const handleRemoveDiscount = async () => {
  showPermissionModal.value = true;
  permissionAction.value = 'remove discount';
};
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>