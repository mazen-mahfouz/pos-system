<template>
  <UModal 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    :ui="{ width: 'sm:max-w-[600px]' }"
  >
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-800">Payment Details</h2>
        <button @click="$emit('update:modelValue', false)" class="text-gray-400 hover:text-gray-600 transition-colors">
          <Icon name="mdi:close" size="24" />
        </button>
      </div>
      
      <!-- Payment Methods -->
      <div class="grid grid-cols-2 gap-4 mb-8">
        <div
          v-for="method in paymentMethods"
          :key="method.id"
          @click="selectedMethod = method.id"
          class="relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02]"
          :class="selectedMethod === method.id ? 'border-[#2b3c5e] bg-[#f8faff]' : 'border-gray-200 hover:border-gray-300'"
        >
          <div class="flex flex-col items-center space-y-3">
            <div class="bg-white p-4 rounded-xl shadow-sm">
              <Icon 
                :name="method.icon" 
                size="40" 
                :class="selectedMethod === method.id ? 'text-[#2b3c5e]' : 'text-gray-600'" 
              />
            </div>
            <span class="font-semibold text-[15px] text-gray-700">{{ method.name }}</span>
            <p class="text-xs text-gray-500 text-center">{{ method.description }}</p>
          </div>
          <div v-if="selectedMethod === method.id" class="absolute top-3 right-3">
            <Icon name="mdi:check-circle" class="text-[#2b3c5e]" size="24" />
          </div>
        </div>
      </div>

      <!-- Amount Details -->
      <div class="bg-gray-50 p-5 rounded-2xl mb-6">
        <div class="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm mb-4">
          <span class="text-gray-600 font-medium">Total Amount</span>
          <span class="text-xl font-bold text-[#2b3c5e]">£{{ formatPrice(total) }}</span>
        </div>
        
        <div v-if="selectedMethod === 1" class="space-y-4">
          <div class="relative">
            <label class="text-sm text-gray-600 mb-2 block">Amount Received</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">£</span>
              <input
                v-model="amountReceived"
                type="number"
                class="w-full p-3 pl-8 border-2 rounded-xl focus:ring-2 focus:ring-[#2b3c5e] focus:border-[#2b3c5e] transition-all duration-200"
                placeholder="Enter amount"
                @input="calculateChange"
              />
            </div>
          </div>
          
          <div class="flex justify-between items-center p-4 bg-white rounded-xl">
            <span class="text-gray-600 font-medium">Change</span>
            <span class="text-lg font-bold" :class="change < 0 ? 'text-red-500' : 'text-green-500'">
              £{{ formatPrice(change) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Amount Buttons (for Cash) -->
      <div v-if="selectedMethod === 1" class="mb-6">
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="amount in quickAmounts"
            :key="amount"
            @click="setQuickAmount(amount)"
            class="p-2 text-sm font-medium rounded-lg border-2 border-gray-200 hover:border-[#2b3c5e] hover:bg-[#f8faff] transition-all duration-200"
          >
            £{{ amount }}
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-4">
        <button
          @click="handlePrint"
          class="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
        >
          <Icon name="mdi:printer" size="20" />
          <span>Print Receipt</span>
        </button>
        
        <button
          @click="handlePayment"
          :disabled="!isValidPayment"
          class="flex-1 px-6 py-3 bg-[#2b3c5e] text-white rounded-xl hover:bg-[#22407c] transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
        >
          <Icon name="mdi:cash-register" size="20" />
          <span>Complete Payment</span>
        </button>
      </div>
    </div>
    <CashierReceiptTemplate
      ref="receiptRef"
      :order="orderData"
    />
  </UModal>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useOrderStore } from '~/stores/orderStore';
import ReceiptTemplate from './ReceiptTemplate.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  orderData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'payment-complete']);

const paymentMethods = [
  { 
    id: 1, 
    name: 'Cash Payment', 
    icon: 'mdi:cash',
    description: 'Pay with physical cash and get change instantly'
  },
  { 
    id: 2, 
    name: 'Card Payment', 
    icon: 'mdi:credit-card',
    description: 'Pay securely with credit or debit card'
  },
];

const quickAmounts = [10, 20, 50, 100];
const selectedMethod = ref(1);
const amountReceived = ref('');
const change = ref(0);

const formatPrice = (price) => {
  return typeof price === 'number' ? price.toFixed(2) : '0.00';
};

const setQuickAmount = (amount) => {
  amountReceived.value = amount;
  calculateChange();
};

const calculateChange = () => {
  const received = parseFloat(amountReceived.value) || 0;
  change.value = received - props.total;
};

const isValidPayment = computed(() => {
  if (selectedMethod.value === 1) {
    return parseFloat(amountReceived.value) >= props.total;
  }
  return true;
});

const receiptRef = ref(null);

// Initialize OrderStore
const OrderStore = useOrderStore();

// Update the orderData computed property
const orderData = computed(() => ({
  id: props.orderData.id,
  type: props.orderData.type,
  table_id: props.orderData.table_id,
  check_number: props.orderData.check_number,
  created_at: props.orderData.created_at,
  creator: props.orderData.creator,
  closer: props.orderData.creator,
  items: props.orderData.items,
  service_charge: props.orderData.service_charge || 0,
  tax: props.orderData.tax,
  total_amount: props.orderData.total_amount,
  payments: [{
    id: 1,
    method: selectedMethod.value === 1 ? 'Cash' : 'Card',
    amount: props.total
  }]
}));

const handlePrint = () => {
  receiptRef.value?.printReceipt();
};

const handlePayment = () => {
  emit('payment-complete', {
    method: selectedMethod.value,
    amountReceived: parseFloat(amountReceived.value),
    change: change.value
  });
  emit('update:modelValue', false);
};
</script>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>