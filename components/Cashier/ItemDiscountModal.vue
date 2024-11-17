<template>
  <UModal 
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :ui="{ 
      width: 'sm:max-w-[600px]',
      overlay: { background: 'bg-gray-900/60 backdrop-blur-sm' },
      height: 'auto',
      padding: 'p-0',
      background: 'bg-white dark:bg-gray-900',
      rounded: 'rounded-xl'
    }"
  >
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-3">
          <div class="bg-[#2b3c5e]/10 p-2 rounded-lg">
            <Icon name="mdi:tag" class="text-[#2b3c5e]" size="24" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-800">
              {{ item?.discount ? 'Edit' : 'Apply' }} Item Discount
            </h2>
            <p class="text-sm text-gray-500 mt-1">{{ item?.name }}</p>
          </div>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
          <Icon name="mdi:close" size="24" />
        </button>
      </div>

      <!-- Discount Types -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div
          v-for="type in discountTypes"
          :key="type.value"
          @click="discountType = type.value"
          class="relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02]"
          :class="discountType === type.value ? 'border-[#2b3c5e] bg-[#2b3c5e]/5' : 'border-gray-200'"
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

      <!-- Amount Input -->
      <div class="bg-gray-50 p-5 rounded-xl mb-6">
        <div class="relative">
          <label class="text-[14px] text-gray-600 mb-2 block">
            {{ discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount' }}
          </label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[15px]">
              {{ discountType === 'percentage' ? '%' : '£' }}
            </span>
            <input
              v-model="amount"
              type="number"
              :min="0"
              :max="discountType === 'percentage' ? 100 : undefined"
              class="w-full p-3 pl-8 text-[15px] border-2 rounded-lg transition-all duration-200"
              :class="showError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-[#2b3c5e] focus:border-[#2b3c5e]'"
              :placeholder="discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'"
            />
          </div>
          <p v-if="showError" class="text-red-500 text-xs mt-1">
            {{ errorMessage }}
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-4">
        <button
          v-if="item?.discount"
          @click="removeDiscount"
          class="flex-1 px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200 flex items-center justify-center space-x-2 text-[14px] font-medium"
        >
          <Icon name="mdi:delete" size="20" />
          <span>Remove Discount</span>
        </button>
        
        <button
          @click="applyDiscount"
          class="flex-1 px-6 py-3 bg-[#2b3c5e] text-white rounded-lg hover:bg-[#22407c] transition-all duration-200 flex items-center justify-center space-x-2 text-[14px] font-medium"
        >
          <Icon name="mdi:check" size="20" />
          <span>{{ item?.discount ? 'Update' : 'Apply' }} Discount</span>
        </button>
      </div>
    </div>
  </UModal>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  item: Object
});

const emit = defineEmits(['update:modelValue', 'update']);

const discountType = ref(props.item?.discount_type || 'amount');
const amount = ref(props.item?.discount || '');
const showError = ref(false);
const errorMessage = ref('');

const discountTypes = [
  { 
    value: 'amount', 
    label: 'Fixed Amount',
    icon: 'mdi:currency-gbp',
    description: 'Apply fixed amount discount'
  },
  { 
    value: 'percentage', 
    label: 'Percentage Off',
    icon: 'mdi:percent',
    description: 'Apply percentage based discount'
  }
];

const validateInput = () => {
  if (!amount.value || amount.value <= 0) {
    errorMessage.value = 'Please enter a valid amount';
    showError.value = true;
    return false;
  }

  if (discountType.value === 'percentage' && amount.value > 100) {
    errorMessage.value = 'Percentage cannot exceed 100%';
    showError.value = true;
    return false;
  }

  showError.value = false;
  return true;
};

const applyDiscount = () => {
  if (!validateInput()) return;

  emit('update', {
    ...props.item,
    discount: parseFloat(amount.value),
    discount_type: discountType.value
  });
  closeModal();
};

const removeDiscount = () => {
  emit('update', {
    ...props.item,
    discount: null,
    discount_type: null
  });
  closeModal();
};

const closeModal = () => {
  emit('update:modelValue', false);
};

// Reset form when modal opens
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    discountType.value = props.item?.discount_type || 'amount';
    amount.value = props.item?.discount || '';
    showError.value = false;
  }
});
</script> 