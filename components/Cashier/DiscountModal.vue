<template>
  <UModal 
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :ui="{ 
      width: 'sm:max-w-[600px]',
      overlay: { background: 'bg-gray-900/60 ' },
      height: 'auto',
      padding: 'p-0',
      background: 'bg-white dark:bg-gray-900',
      rounded: 'rounded-xl'
    }"
  >
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-800">Apply Discount</h2>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
          <Icon name="mdi:close" size="24" />
        </button>
      </div>

      <!-- Discount Types -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div
          v-for="type in discountTypes"
          :key="type.value"
          @click="discountType = type.value"
          class="relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02]"
        >
          <div class="flex flex-col items-center space-y-3">
            <div class="bg-white p-3 rounded-lg shadow-sm">
              <Icon 
                :name="type.icon" 
                size="32" 
                :class="discountType === type.value ? 'text-[#2b3c5e]' : 'text-gray-600'" 
              />
            </div>
            <span class="font-semibold text-[15px] text-gray-700">{{ type.label }}</span>
            <p class="text-[12px] text-gray-500 text-center">{{ type.description }}</p>
          </div>
          <div v-if="discountType === type.value" class="absolute top-3 right-3">
            <Icon name="mdi:check-circle" class="text-[#2b3c5e]" size="20" />
          </div>
        </div>
      </div>

      <!-- Amount Input or Saved Discounts Select -->
      <div class="bg-gray-50 p-5 rounded-xl mb-6">
        <div v-if="discountType !== 'saved'" class="relative">
          <label class="text-[14px] text-gray-600 mb-2 block">
            {{ discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount' }}
          </label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[15px]">
              {{ discountType === 'percentage' ? '%' : '£' }}
            </span>
            <input
              v-model="discountAmount"
              type="number"
              class="w-full p-3 pl-8 text-[15px] border-2 rounded-lg focus:ring-2 focus:ring-[#2b3c5e] focus:border-[#2b3c5e] transition-all duration-200"
              :placeholder="discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'"
            />
          </div>
        </div>

        <div v-else class="relative">
          <label class="text-[14px] text-gray-600 mb-2 block">Select Saved Discount</label>
          <select
            v-model="selectedSavedDiscount"
            class="w-full p-3 text-[15px] border-2 rounded-lg focus:ring-2 focus:ring-[#2b3c5e] focus:border-[#2b3c5e] transition-all duration-200"
          >
            <option value="">Select a discount</option>
            <option v-for="discount in savedDiscounts" :key="discount.id" :value="discount.id">
              {{ discount.name }} - {{ discount.value }}{{ discount.type === 'percentage' ? '%' : '£' }}
            </option>
          </select>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-4">
        <button
          @click="closeModal"
          class="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center space-x-2 text-[14px] font-medium"
        >
          <Icon name="mdi:close" size="20" />
          <span>Cancel</span>
        </button>
        
        <button
          @click="applyDiscount"
          class="flex-1 px-6 py-3 bg-[#2b3c5e] text-white rounded-lg hover:bg-[#22407c] transition-all duration-200 flex items-center justify-center space-x-2 text-[14px] font-medium"
        >
          <Icon name="mdi:check" size="20" />
          <span>Apply Discount</span>
        </button>
      </div>
    </div>
  </UModal>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useOrderStore } from '~/stores/orderStore';

const OrderStore = useOrderStore();

const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue']);

const discountType = ref('cash');
const discountAmount = ref('');
const selectedSavedDiscount = ref('');

const discountTypes = [
  { 
    value: 'cash', 
    label: 'Cash Discount',
    icon: 'mdi:cash',
    description: 'Apply fixed amount discount'
  },
  { 
    value: 'percentage', 
    label: 'Percentage Off',
    icon: 'mdi:percent',
    description: 'Apply percentage based discount'
  },
  { 
    value: 'saved', 
    label: 'Saved Discount',
    icon: 'mdi:tag-outline',
    description: 'Use a pre-saved discount'
  }
];

const savedDiscounts = ref([
  { id: 1, name: 'Summer Sale', value: 10, type: 'percentage' },
  { id: 2, name: 'VIP Discount', value: 5, type: 'cash' },
]);

const closeModal = () => {
  emit('update:modelValue', false);
  discountType.value = 'cash';
  discountAmount.value = '';
};

const applyDiscount = () => {
  if (!discountAmount.value || discountAmount.value <= 0) {
    push.error('Please enter a valid amount');
    return;
  }

  if (discountType.value === 'percentage' && discountAmount.value > 100) {
    push.error('Percentage cannot exceed 100%');
    return;
  }

  useApi(`orders/${OrderStore.currentOrder.id}/discount`, 'POST', {
    type: 'object',
    data: {
      type: discountType.value,
      amount: parseFloat(discountAmount.value)
    }
  })
  .then((response) => {
    OrderStore.updateOrderFromResponse(response.order);
    push.success('Discount applied successfully');
    emit('update:modelValue', false);
  })
  .catch((error) => {
    console.error('Error applying discount:', error);
    push.error('Failed to apply discount');
  });
};

watch(discountType, () => {
  discountAmount.value = '';
});

onMounted(() => {
  if (OrderStore.currentOrder.discount > 0) {
    discountType.value = OrderStore.currentOrder.discount_type || 'cash';
    discountAmount.value = OrderStore.currentOrder.discount.toString();
  } else {
    discountType.value = 'cash';
    discountAmount.value = '';
  }
});
</script> 