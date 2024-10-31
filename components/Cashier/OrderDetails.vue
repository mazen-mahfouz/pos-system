<template>
  <div class="fixed top-0 right-0 h-screen w-[330px] bg-white shadow-lg flex flex-col transition-transform duration-300 ease-in-out transform"
       :class="{ 'translate-x-0': OrderStore.$state.openOrder, 'translate-x-full': !OrderStore.$state.openOrder }">
    
    <!-- Header with new design -->
    <div class="bg-gradient-to-r from-[#2b3c5e] to-[#1a2744] p-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <div class="bg-white/10 p-2 rounded-lg">
            <Icon name="mdi:receipt" class="text-white" size="20" />
          </div>
          <h2 class="text-white font-semibold">Order Details</h2>
        </div>
        <span class="bg-white/20 px-3 py-1 rounded-full text-xs text-white">
          #{{ OrderStore.currentOrder.id || 'New' }}
        </span>
      </div>
    </div>

    <!-- Customer Info with improved design -->
    <div class="p-3 bg-gray-50/50">
      <div class="bg-white rounded-xl p-2.5 shadow-sm space-y-2">
        <div class="flex items-center space-x-2 bg-gray-50/50 rounded-lg p-2">
          <Icon name="mdi:account" size="16" class="text-gray-500" />
          <input
            v-model="OrderStore.currentOrder.guest"
            type="text"
            placeholder="Guest Name"
            class="w-full bg-transparent text-sm focus:outline-none"
          >
        </div>
        
        <div class="flex space-x-2">
          <div class="flex-1 bg-gray-50/50 rounded-lg p-2 cursor-pointer hover:bg-gray-100 transition-colors">
            <div class="flex items-center space-x-2">
              <Icon :name="getOrderTypeIcon(OrderStore.currentOrder.type)" size="16" class="text-gray-500" />
              <span class="text-sm text-gray-600">{{ OrderStore.currentOrder.type || 'Type' }}</span>
            </div>
          </div>
          <div v-if="isDineIn" class="flex-1 bg-gray-50/50 rounded-lg p-2 cursor-pointer hover:bg-gray-100 transition-colors">
            <div class="flex items-center space-x-2">
              <Icon name="ic:baseline-table-restaurant" size="16" class="text-gray-500" />
              <span class="text-sm text-gray-600">Table {{ OrderStore.currentOrder.table_id || '#' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Items with enhanced design -->
    <div class="flex-grow overflow-y-auto px-3 py-2">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xs font-medium text-gray-500">ORDER ITEMS</h3>
        <span class="text-xs bg-[#2b3c5e]/10 text-[#2b3c5e] px-2 py-1 rounded-full">
          {{ OrderStore.currentOrder.items.length }} items
        </span>
      </div>

      <TransitionGroup name="list" tag="ul" class="space-y-2">
        <li v-for="item in OrderStore.currentOrder.items" 
            :key="item.product_id" 
            class="group bg-white rounded-xl p-2.5 shadow-sm hover:shadow transition-all duration-200 border border-gray-100/50">
          <div class="flex items-center">
            <div class="relative flex-shrink-0">
              <img :src="item.product?.image || item.image" 
                   :alt="item.name" 
                   class="w-12 h-12 object-cover rounded-lg shadow-sm">
              <div class="absolute -top-1.5 -right-1.5 bg-[#2b3c5e] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {{ item.quantity }}
              </div>
            </div>
            
            <div class="ml-3 flex-grow">
              <p class="text-sm font-medium text-gray-700 line-clamp-1">
                {{ item.product?.name || item.name }}
              </p>
              <p class="text-xs text-gray-500">£{{ formatPrice(item.price) }}</p>
            </div>

            <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="OrderStore.decreaseQuantity(item.product_id)" 
                      class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <Icon name="mdi:minus" size="14" />
              </button>
              <button @click="OrderStore.increaseQuantity(item.product_id)" 
                      class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <Icon name="mdi:plus" size="14" />
              </button>
              <button @click="OrderStore.removeItem(item.product_id)" 
                      class="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                <Icon name="mdi:delete" size="14" />
              </button>
            </div>
          </div>
        </li>
      </TransitionGroup>
    </div>

    <!-- Order Summary with modern design -->
    <div class="bg-gray-50/50 p-3 space-y-2">
      <div class="bg-white rounded-xl p-3 shadow-sm space-y-2">
        <div class="flex justify-between items-center text-sm">
          <div class="flex items-center space-x-2 text-gray-600">
            <Icon name="mdi:cart-outline" size="16" />
            <span>Subtotal</span>
          </div>
          <span class="font-medium">£{{ formatPrice(OrderStore.currentOrder.sub_total || 0) }}</span>
        </div>
        
        <div class="flex justify-between items-center text-sm">
          <div class="flex items-center space-x-2 text-gray-600">
            <Icon name="mdi:percent" size="16" />
            <span>Tax</span>
          </div>
          <span class="font-medium">£{{ formatPrice(OrderStore.currentOrder.tax || 0) }}</span>
        </div>
        
        <div class="flex justify-between items-center text-sm">
          <div class="flex items-center space-x-2 text-green-600">
            <Icon name="mdi:tag-outline" size="16" />
            <span>Discount</span>
          </div>
          <span class="font-medium text-green-600">
            -£{{ OrderStore.currentOrder.discount > 0 ? formatPrice(OrderStore.currentOrder.discount) : '0.00' }}
          </span>
        </div>
      </div>

      <!-- Total Amount Button -->
      <button @click="checkout" 
              class="w-full bg-gradient-to-r from-[#2b3c5e] to-[#1a2744] text-white rounded-xl p-3 hover:shadow-lg transition-all duration-300">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <Icon name="mdi:cash-register" size="18" />
            <span class="font-medium">Total</span>
          </div>
          <span class="font-bold text-lg">£{{ formatPrice(OrderStore.currentOrder.total_amount || 0) }}</span>
        </div>
      </button>
    </div>

    <!-- Action Buttons with improved design -->
    <div class="p-3 flex items-center gap-2 bg-white">
      <button @click="OrderStore.currentOrder.id ? updateOrder() : placeOrder()" 
              class="flex-1 bg-[#2b3c5e] text-white py-2.5 px-4 rounded-xl hover:bg-[#22407c] active:scale-95 transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-2">
        <Icon :name="OrderStore.currentOrder.id ? 'mdi:pencil' : 'mdi:check'" size="16" />
        <span>{{ OrderStore.currentOrder.id ? 'Update' : 'Place Order' }}</span>
      </button>
      <button @click="OrderStore.cancelOrder" 
              class="flex-1 bg-red-50 text-red-600 py-2.5 px-4 rounded-xl hover:bg-red-100 active:scale-95 transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-2">
        <Icon name="mdi:close" size="16" />
        <span>Cancel</span>
      </button>
    </div>

    <CashierPaymentModal
      v-model="showPaymentModal"
      :total="OrderStore.currentOrder.total_amount"
      :orderData="OrderStore.currentOrder"
      @payment-complete="processPayment"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useOrderStore } from '~/stores/orderStore';
import CustomUSelect from '~/components/CustomUSelect.vue';

const OrderStore = useOrderStore();

const discountTypes = [
  { value: 'cash', label: 'Cash' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'saved', label: 'Saved' },
];

const selectedDiscountType = ref('cash');
const showPaymentModal = ref(false);
const discountValue = ref('');

// Replace the existing checkout function
const checkout = () => {
  if (OrderStore.currentOrder.items.length === 0) {
    console.error('No items in the order');
    return;
  }
  showPaymentModal.value = true;
};

// Add this new function
const processPayment = async (paymentDetails) => {
  let orderId = OrderStore.currentOrder.id;

  try {
    // If it's a new order, place it first
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

    // Process the payment
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
    // Show success notification
  } catch (error) {
    console.error('Payment error:', error);
    // Handle error and show error notification
  }
};
const closeOrder = () => {
  OrderStore.closeOrder();
};

const formatPrice = (price) => {
  return typeof price === 'number' ? price.toFixed(2) : parseFloat(price).toFixed(2);
};

const applyDiscount = () => {
  const value = parseFloat(discountValue.value);
  if (isNaN(value) || value < 0) return;

  OrderStore.updateDiscount({
    type: selectedDiscountType.value,
    amount: value
  });
};

const placeOrder = async () => {
  if (OrderStore.currentOrder.items.length === 0) {
    console.error('No items in the order');
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
      console.log('Order placed successfully:', response);
      // Update the order with the response data
      OrderStore.updateOrderFromResponse(response.order);
      OrderStore.closeOrder();
      // Show success notification
    })
    .catch(error => {
      console.error('Error placing order:', error);
      // Handle error and show error notification
    });
};

const updateOrder = async () => {
  if (OrderStore.currentOrder.items.length === 0) {
    console.error('No items in the order');
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
      console.log('Order updated successfully:', response);
      OrderStore.editOrder(OrderStore.currentOrder.id, { ...OrderStore.currentOrder });
      OrderStore.closeOrder();
      // Show success notification
    })
    .catch(error => {
      console.error('Error updating order:', error);
      // Handle error and show error notification
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
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>

