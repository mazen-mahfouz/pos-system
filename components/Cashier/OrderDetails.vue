<template>
  <div class="fixed top-0 right-0 h-screen w-[330px] bg-white shadow-lg flex flex-col transition-transform duration-300 ease-in-out transform"
       :class="{ 'translate-x-0': OrderStore.$state.openOrder, 'translate-x-full': !OrderStore.$state.openOrder }">
    <!-- Header -->
    <div class="bg-white p-2 flex justify-between items-center">
      <h2 class="text-md font-semibold text-gray-800 p-1">Order Details</h2>
      <!-- <button @click="closeOrder" class="text-gray-600 hover:text-gray-800 transition-colors duration-200">
        <Icon name="mdi:close" size="20" />
      </button> -->
    </div>

    <!-- Customer Info -->
    <div class="p-2 space-y-1 bg-gray-50">
      <div class="bg-white rounded-lg p-2 shadow-sm">
        <div class="flex items-center space-x-3">
          <Icon name="mdi:account" size="17" class="text-gray-600" />
          <input
            v-model="OrderStore.currentOrder.guest"
            type="text"
            placeholder="Customer Name"
            class="flex-grow p-1 bg-transparent focus:outline-none text-[12px]"
          >
        </div>
      </div>
      <div class="flex space-x-3">
        <div class="flex-1 flex items-center bg-white rounded-lg p-2 shadow-sm">
          <div class="flex items-center space-x-3">
            <Icon :name="getOrderTypeIcon(OrderStore.currentOrder.type)" size="18" class="text-gray-600" />
            <span class="text-gray-800 text-[14px]">{{ OrderStore.currentOrder.type || 'Order Type' }}</span>
          </div>
        </div>
        <div v-if="isDineIn" class="flex-1 flex items-center  bg-white rounded-lg p-2 shadow-sm">
          <div class="flex items-center space-x-3">
            <Icon name="ic:baseline-table-restaurant" size="18" class="text-gray-600" />
            <span class="text-gray-800 text-[14px]">Table {{ OrderStore.currentOrder.table_id || 'Table Number' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Items -->
    <div class="flex-grow overflow-y-auto p-2">
      <h3 class="font-semibold text-gray-700 text-sm mb-2 p-2">Order Items</h3>
      <TransitionGroup name="list" tag="ul" class="space-y-2">
        <li v-for="item in OrderStore.currentOrder.items" :key="item.product_id" 
            class="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm transition-all duration-300 ease-in-out">
          <div class="flex items-center space-x-2">
            <img :src="item.product ? item.product.image : item.image" alt="item.name" class="w-12 h-12 object-cover rounded-md">
            <div>
              <p class="font-medium text-xs">{{ item.product ? item.product.name : item.name }}</p>
              <p class="text-[11px] text-gray-500">£{{ formatPrice(item.price) }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-1">
            <button @click="OrderStore.decreaseQuantity(item.product_id)" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <Icon name="mdi:minus" size="16" />
            </button>
            <span class="w-6 text-center text-sm">{{ item.quantity }}</span>
            <button @click="OrderStore.increaseQuantity(item.product_id)" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <Icon name="mdi:plus" size="16" />
            </button>
            <button @click="OrderStore.removeItem(item.product_id)" class="text-red-500 hover:text-red-700 transition-colors duration-200 ml-1">
              <Icon name="mdi:delete" size="16" />
            </button>
          </div>
        </li>
      </TransitionGroup>
    </div>

    <!-- Order Summary -->
    <div class="bg-gray-100 p-2 space-y-2">
      <div class="bg-white rounded-lg p-3 shadow-sm">
        <div class="flex justify-between items-center mb-2">
          <span class="text-gray-600 font-medium text-[12px]">Subtotal</span>
          <span class="text-gray-800 font-semibold text-[12px]">£{{ formatPrice(OrderStore.currentOrder.sub_total) }}</span>
        </div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-gray-600 font-medium text-[12px]">Tax</span>
          <span class="text-gray-800 font-semibold text-[12px]">£{{ formatPrice(OrderStore.currentOrder.tax) }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600 font-medium text-[12px]">Discount</span>
          <span class="text-green-600 font-semibold text-[12px]">-£{{ formatPrice(OrderStore.currentOrder.discount) }}</span>
        </div>
      </div>
      <div class="bg-gray-800 text-white rounded-lg p-2 px-3 shadow-sm">
        <div class="flex justify-between items-center">
          <span class="font-medium text-[12px]">Total</span>
          <span class="font-bold text-[12px]">£{{ formatPrice(OrderStore.currentOrder.total_amount) }}</span>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center justify-between px-2">
      <button @click="checkout" class="flex-1 bg-[#1e8449] text-white py-2 rounded-md hover:bg-[#145a32] transition-colors duration-200 text-sm font-semibold">
        Checkout
      </button>
    </div>
    <div class="p-2 flex items-start gap-[10px] bg-white">
      <button @click="OrderStore.currentOrder.id ? updateOrder() : placeOrder()" class="flex-1 bg-[#2b3c5e] text-white py-2 rounded-md hover:bg-[#22407c] transition-colors duration-200 text-sm font-semibold">
        {{ OrderStore.currentOrder.id ? 'Update Order' : 'Place Order' }}
      </button>
      <button @click="OrderStore.cancelOrder" class="flex-1 bg-[#611312] text-white py-2 rounded-md hover:bg-[#340f0f] transition-colors duration-200 text-sm font-semibold">
        Cancel Order
      </button>
    </div>
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
const discountValue = ref('');

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

const checkout = async () => {
  if (OrderStore.currentOrder.items.length === 0) {
    console.error('No items in the order');
    return;
  }

  let orderId = OrderStore.currentOrder.id;

  // If it's a new order, place the order first
  if (!orderId) {
    useApi('orders', 'POST', {
      type: 'object',
      data: {
        guest: OrderStore.currentOrder.guest,
        type: OrderStore.currentOrder.type,
        table_id: OrderStore.currentOrder.table_id,
        items: OrderStore.currentOrder.items,
        shift_id: OrderStore.currentOrder.shift_id,
      },
    })
      .then(placeOrderResponse => {
        orderId = placeOrderResponse.order.id;
        console.log('Order placed successfully:', orderId);
        return useApi('payment', 'POST', {
          type: 'object',
          data: {
            order_id: orderId,
            amount: OrderStore.total,
            payment_method_id: 1
          },
        });
      })
      .then(checkoutResponse => {
        console.log('Checkout successful:', checkoutResponse);
        OrderStore.closeOrder();
        // Show success notification
      })
      .catch(error => {
        console.error('Checkout error:', error);
        // Handle error and show error notification
      });
  } else {
    // For existing orders, proceed directly to checkout
    useApi('payment', 'POST', {
      type: 'object',
      data: {
        order_id: orderId,
        amount: OrderStore.total,
        payment_method_id: 1
      },
    })
      .then(checkoutResponse => {
        console.log('Checkout successful:', checkoutResponse);
        OrderStore.closeOrder();
        // Show success notification
      })
      .catch(error => {
        console.error('Checkout error:', error);
        // Handle error and show error notification
      });
  }
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

