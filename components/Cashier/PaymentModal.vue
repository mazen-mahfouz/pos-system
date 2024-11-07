<template>
  <UModal 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    :ui="{ 
      width: 'sm:max-w-[550px]',
      height: 'h-auto sm:max-h-[90vh] md:max-h-[90vh] lg:max-h-[90vh]',
      overlay: { background: 'bg-gray-900/60 backdrop-blur-sm' }
    }"
  >
    <div class="p-4 sm:p-6 h-full overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-[15px] font-bold text-gray-800">Payment Details</h2>
        <button @click="$emit('update:modelValue', false)" class="text-gray-400 hover:text-gray-600">
          <Icon name="mdi:close" size="20" />
        </button>
      </div>
      
      <!-- Payment Methods -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div
          v-for="method in paymentMethods"
          :key="method.id"
          @click="selectedMethod = method.id"
          class="relative p-3.5 border rounded-lg cursor-pointer"
          :class="selectedMethod === method.id ? 'border-[#2b3c5e] bg-[#f8faff]' : 'border-gray-200'"
        >
          <div class="flex flex-col items-center space-y-2">
            <div class="bg-white p-2 rounded-lg shadow-sm">
              <Icon 
                :name="method.icon" 
                size="22"
                :class="selectedMethod === method.id ? 'text-[#2b3c5e]' : 'text-gray-600'" 
              />
            </div>
            <span class="text-[13px] font-semibold">{{ method.name }}</span>
            <p class="text-[11px] text-gray-500 text-center">{{ method.description }}</p>
          </div>
          <div v-if="selectedMethod === method.id" class="absolute top-2 right-2">
            <Icon name="mdi:check-circle" class="text-[#2b3c5e]" size="16" />
          </div>
        </div>
      </div>

      <!-- Amount Details -->
      <div class="bg-gray-50 p-3.5 sm:p-5 rounded-lg mb-4 sm:mb-6">
        <div class="flex justify-between items-center p-2.5 sm:p-4 bg-white rounded-lg shadow-sm mb-3 sm:mb-5">
          <span class="text-[12px] sm:text-[14px] text-gray-600">Total Amount</span>
          <span class="text-[15px] sm:text-[18px] font-bold text-[#2b3c5e] cursor-pointer" @click="setTotalAmount">£{{ formatPrice(total) }}</span>
        </div>
        
        <div v-if="selectedMethod === 1" class="space-y-3">
          <div class="relative">
            <label class="text-[12px] text-gray-600 mb-1.5 block">Amount Received</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">£</span>
              <input
                v-model="amountReceived"
                type="number"
                class="w-full p-2.5 pl-6 text-sm border rounded-lg"
                placeholder="Enter amount"
                @input="calculateChange"
              />
            </div>
          </div>
          
          <div class="flex justify-between items-center p-2.5 bg-white rounded-lg">
            <span class="text-[12px] text-gray-600 font-medium">Change</span>
            <span class="text-[15px] font-bold" :class="change < 0 ? 'text-red-500' : 'text-green-500'">
              £{{ formatPrice(change) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Amount Buttons -->
      <div v-if="selectedMethod === 1" class="mb-4 sm:mb-6">
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
          <button
            v-for="amount in quickAmounts"
            :key="amount"
            @click="setQuickAmount(amount)"
            class="p-2 sm:p-3 text-[12px] sm:text-[14px] font-medium rounded-lg border hover:border-[#2b3c5e] hover:bg-[#f8faff]"
          >
            £{{ amount }}
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-3">
        <button
          @click="handlePrint"
          class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-[12px] flex items-center justify-center space-x-2"
        >
          <Icon name="mdi:printer" size="14" />
          <span>Print</span>
        </button>
        
        <button
          @click="handlePayment"
          :disabled="!isValidPayment"
          class="flex-1 px-4 py-2.5 bg-[#2b3c5e] text-white rounded-lg text-[12px] disabled:bg-gray-300 flex items-center justify-center space-x-2"
        >
          <Icon name="mdi:cash-register" size="14" />
          <span>Complete</span>
        </button>
      </div>
    </div>
  </UModal>

  <ReceiptTemplate 
    ref="receiptRef"
    :order="orderData"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue';
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

const quickAmounts = computed(() => {
  const baseAmounts = [10, 20, 50, 100];
  const roundedTotal = Math.ceil(props.total / 10) * 10;
  return baseAmounts.map(amount => amount + roundedTotal).filter(amount => amount > props.total);
});
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

const setTotalAmount = () => {
  amountReceived.value = props.total;
  calculateChange();
};

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    amountReceived.value = '';
    calculateChange();
  }
});
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

@media (min-width: 768px) {
  .u-modal {
    max-width: 468px;
    max-height: 724px;
  }
}

@media (min-width: 1024px) {
  .u-modal {
    max-width: 672px;
    max-height: 900px;
  }
}

@media (min-width: 1280px) {
  .u-modal {
    max-width: 806px;
  }
}
</style>