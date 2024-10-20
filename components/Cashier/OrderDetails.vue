<template>
  <div class="fixed top-0 right-0 h-screen w-[400px] bg-white shadow-lg flex flex-col transition-transform duration-300 ease-in-out transform"
       :class="{ 'translate-x-0': OrderStore.$state.openOrder, 'translate-x-full': !OrderStore.$state.openOrder }">
    <!-- Header -->
    <div class="bg-gray-100 p-4 flex justify-between items-center">
      <h2 class="text-xl font-semibold text-gray-800">Order Details</h2>
      <button @click="closeOrder" class="text-gray-600 hover:text-gray-800 transition-colors duration-200">
        <Icon name="mdi:close" size="24" />
      </button>
    </div>

    <!-- Order Content -->
    <div class="flex-grow overflow-y-auto p-4 space-y-6">
      <!-- Customer Info -->
      <div class="space-y-2">
        <input
          v-model="OrderStore.currentOrder.guest"
          type="text"
          placeholder="Customer Name"
          class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-lg"
        >
        <div class="flex justify-between text-sm text-gray-600 bg-gray-100 p-2 rounded-lg">
          <span>{{ OrderStore.currentOrder.type === 'dine-in' ? 'Dine In' : 'Take Away' }}</span>
          <span v-if="OrderStore.currentOrder.table_id">Table: {{ OrderStore.currentOrder.table_id }}</span>
        </div>
      </div>

      <!-- Order Items -->
      <div class="space-y-4">
        <h3 class="font-semibold text-gray-700 text-lg">Order Items</h3>
        <TransitionGroup name="list" tag="ul" class="space-y-3">
          <li v-for="item in OrderStore.currentOrder.items" :key="item.product_id" 
              class="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm transition-all duration-300 ease-in-out">
            <div class="flex items-center space-x-3">
              <img :src="item.image" alt="item.name" class="w-16 h-16 object-cover rounded-lg">
              <div>
                <p class="font-medium text-lg">{{ item.name }}</p>
                <p class="text-sm text-gray-500">${{ formatPrice(item.price) }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button @click="OrderStore.decreaseQuantity(item.product_id)" class="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1">
                <Icon name="mdi:minus" size="20" />
              </button>
              <span class="w-8 text-center text-lg">{{ item.quantity }}</span>
              <button @click="OrderStore.increaseQuantity(item.product_id)" class="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1">
                <Icon name="mdi:plus" size="20" />
              </button>
              <button @click="OrderStore.removeItem(item.product_id)" class="text-red-500 hover:text-red-700 transition-colors duration-200 p-1">
                <Icon name="mdi:delete" size="20" />
              </button>
            </div>
          </li>
        </TransitionGroup>
      </div>
    </div>

    <!-- Order Summary -->
    <div class="bg-gray-100 p-6 space-y-3">
      <div class="flex justify-between text-gray-600">
        <span>Subtotal:</span>
        <span>${{ formatPrice(OrderStore.subtotal) }}</span>
      </div>
      <div class="flex justify-between text-gray-600">
        <span>Tax:</span>
        <span>${{ formatPrice(OrderStore.tax) }}</span>
      </div>
      <div class="flex justify-between text-gray-600">
        <span>Discount:</span>
        <span>${{ formatPrice(OrderStore.discount) }}</span>
      </div>
      <div class="flex justify-between font-semibold text-xl text-gray-800 pt-2 border-t border-gray-300">
        <span>Total:</span>
        <span>${{ formatPrice(OrderStore.total) }}</span>
      </div>
    </div>

    <!-- Discount Section -->
    <!-- <div class="p-4 bg-white border-t border-gray-200">
      <div class="flex space-x-2 mb-2">
        <CustomUSelect
          v-model="selectedDiscountType"
          :options="discountTypes"
          placeholder="Discount Type"
          class="flex-grow"
        />
        <input
          v-model="discountValue"
          type="number"
          placeholder="Value"
          class="w-24 p-2 border border-gray-300 rounded-md"
        />
        <button @click="applyDiscount" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors duration-200">
          Apply
        </button>
      </div>
    </div> -->

    <!-- Action Buttons -->
    <div class="p-4 space-y-3 bg-white">
      <button @click="placeOrder" class="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-lg font-semibold">
        Place Order
      </button>
      <button @click="OrderStore.cancelOrder" class="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-lg font-semibold">
        Cancel Order
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
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
  const numPrice = Number(price);
  return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
};

const applyDiscount = () => {
  const value = parseFloat(discountValue.value);
  if (isNaN(value) || value < 0) return;

  OrderStore.updateDiscount({
    type: selectedDiscountType.value,
    amount: value
  });
};

const placeOrder = () => {
  if (OrderStore.currentOrder.items.length === 0) {
    // Show error notification: "No items in the order"
    console.error('No items in the order');
    return;
  }

  const orderData = {
    table_id: OrderStore.currentOrder.table_id || null,
    type: OrderStore.currentOrder.type,
    guest: OrderStore.currentOrder.guest,
    shift_id: OrderStore.currentOrder.shift_id,
    items: OrderStore.currentOrder.items.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity
    }))
  };

  if (OrderStore.currentOrder.discount && OrderStore.currentOrder.discount.type && OrderStore.currentOrder.discount.amount > 0) {
    orderData.discount = {
      type: OrderStore.currentOrder.discount.type,
      amount: OrderStore.currentOrder.discount.amount
    };
  }

  console.log('Sending order data:', orderData); // للتحقق من البيانات قبل الإرسال

  useApi('orders', 'POST', {
    type: 'object',
    data: orderData,
  })
    .then((response) => {
      console.log('Order placed successfully:', response);
      OrderStore.placeOrder();
      // Show success notification
    })
    .catch((error) => {
      console.error('Order placement error:', error);
      // Handle error and show error notification
    });
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