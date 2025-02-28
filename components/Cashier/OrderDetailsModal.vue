<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="modelValue" class="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4" @click="closeModal">
        <div class="bg-white rounded-xl w-full max-w-2xl shadow-xl overflow-hidden" @click.stop>
          <!-- Header -->
          <div class="bg-gradient-to-r from-[#2b3c5e] to-[#1a2744] p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="bg-white/10 p-2 rounded-lg">
                  <Icon :name="getStatusIcon" class="text-white text-xl" />
                </div>
                <div>
                  <h3 class="text-white font-semibold">Order #{{ order.code }}</h3>
                  <span class="text-white/80 text-sm">{{ formatDate(order.created_at) }}</span>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <!-- Add Print Button -->
                <button @click="printReceipt" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Icon name="mdi:printer" class="text-white" />
                </button>
                <button @click="closeModal" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Icon name="mdi:close" class="text-white" />
                </button>
              </div>
            </div>
          </div>

          <!-- Order Info -->
          <div class="p-6">
            <!-- Status Badge -->
            <div class="flex justify-center -mt-8 mb-6">
              <span :class="getStatusClass" class="px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                {{ order.status }}
              </span>
            </div>

            <!-- Add Cancellation Reason -->
            <div v-if="order.status === 'canceled'" class="mb-8">
              <div class="bg-red-50 rounded-lg p-4 space-y-2">
                <div class="space-y-1">
                  <div class="text-sm text-red-600 font-medium">Cancellation Reason:</div>
                  <div class="text-red-700">{{ order.reason || 'No reason specified' }}</div>
                </div>
                <div v-if="order.manual_reason" class="space-y-1">
                  <div class="text-sm text-red-600 font-medium">Additional Notes:</div>
                  <div class="text-red-700">{{ order.manual_reason }}</div>
                </div>
              </div>
            </div>

            <!-- Customer & Order Details -->
            <div class="grid grid-cols-2 gap-6 mb-8">
              <div class="space-y-1">
                <div class="text-sm text-gray-500">Customer</div>
                <div class="flex items-center space-x-2">
                  <Icon name="mdi:account" class="text-gray-400" />
                  <span class="font-medium">{{ order.guest || 'Walk-in Customer' }}</span>
                </div>
              </div>
              
              <div class="space-y-1">
                <div class="text-sm text-gray-500">Order Type</div>
                <div class="flex items-center space-x-2">
                  <Icon :name="order.type === 'dine-in' ? 'mdi:silverware' : 'mdi:food-takeout-box'" class="text-gray-400" />
                  <span class="font-medium capitalize">{{ order.type }}</span>
                  <span v-if="order.table_id" class="text-sm text-gray-500">(Table {{ order.table_id }})</span>
                </div>
              </div>
            </div>

            <!-- Order Items -->
            <div class="border rounded-xl overflow-hidden mb-6">
              <div class="bg-gray-50 px-4 py-2.5 border-b">
                <h4 class="font-medium">Order Items</h4>
              </div>
              
              <div class="divide-y">
                <div v-for="item in order.order_items || order.items" :key="item.id" class="p-4 flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                      <img :src="item.product?.image || '/img/notfound.png'" class="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div class="font-medium">{{ item.product?.name }}</div>
                      <div class="text-sm text-gray-500">Qty: {{ item.quantity }} × ${{ formatPrice(item.price) }}</div>
                    </div>
                  </div>
                  <div class="font-semibold">${{ formatPrice(item.quantity * item.price) }}</div>
                </div>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="bg-gray-50 rounded-xl p-4 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Subtotal</span>
                <span>${{ formatPrice(order.sub_total) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Service Charge</span>
                <span>${{ formatPrice(order.service) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">VAT (14%)</span>
                <span>${{ formatPrice(order.tax) }}</span>
              </div>
              <div v-if="order.discount" class="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-${{ formatPrice(order.discount) }}</span>
              </div>
              <div class="border-t pt-2 mt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>${{ formatPrice(order.total_amount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
  
  <!-- Add ReceiptTemplate component -->
  <ReceiptTemplate 
    ref="receiptRef"
    :order="order"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import ReceiptTemplate from './ReceiptTemplate.vue';

const props = defineProps({
  modelValue: Boolean,
  order: {
    type: Object,
    required: true
  }
});

console.log(props.order)

const emit = defineEmits(['update:modelValue']);
const receiptRef = ref(null);

const closeModal = () => {
  emit('update:modelValue', false);
};

const getStatusIcon = computed(() => {
  switch (props.order.status) {
    case 'completed':
      return 'mdi:check-circle';
    case 'canceled':
      return 'mdi:close-circle';
    default:
      return 'mdi:information';
  }
});

const getStatusClass = computed(() => {
  switch (props.order.status) {
    case 'completed':
      return 'bg-green-50 text-green-700 border border-green-200';
    case 'canceled':
      return 'bg-red-50 text-red-700 border border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-200';
  }
});

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

// Add print function
const printReceipt = () => {
  receiptRef.value?.printReceipt();
};
</script>

<style>
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
</style>