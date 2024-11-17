<template>
  <UModal 
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :ui="{ 
      width: 'sm:max-w-[500px]',
      overlay: { background: 'bg-gray-900/60 backdrop-blur-sm' },
      padding: 'p-0',
      background: 'bg-white dark:bg-gray-900',
      rounded: 'rounded-xl'
    }"
  >
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-3">
          <div class="bg-green-50 p-2 rounded-lg">
            <Icon name="mdi:tag" class="text-green-600" size="24" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-800">
              {{ item?.discount ? 'Edit' : 'Add' }} Item Discount
            </h2>
            <p class="text-sm text-gray-500 mt-1">{{ item?.name }}</p>
          </div>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
          <Icon name="mdi:close" size="24" />
        </button>
      </div>

      <!-- Discount Type Selection -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <button
          v-for="type in discountTypes"
          :key="type.value"
          @click="discountType = type.value"
          class="relative p-4 border-2 rounded-xl transition-all duration-200"
          :class="discountType === type.value 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-200 hover:border-gray-300'"
        >
          <div class="flex flex-col items-center space-y-2">
            <Icon 
              :name="type.icon" 
              :class="discountType === type.value ? 'text-green-600' : 'text-gray-600'" 
              size="24"
            />
            <span class="font-medium text-sm" 
                  :class="discountType === type.value ? 'text-green-700' : 'text-gray-700'">
              {{ type.label }}
            </span>
          </div>
          <div v-if="discountType === type.value" 
               class="absolute top-2 right-2">
            <Icon name="mdi:check-circle" class="text-green-500" size="20" />
          </div>
        </button>
      </div>

      <!-- Amount Input -->
      <div class="mb-6">
        <label class="text-sm font-medium text-gray-700 mb-2 block">
          {{ discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount' }}
        </label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            {{ discountType === 'percentage' ? '%' : '£' }}
          </span>
          <input
            v-model="amount"
            type="number"
            min="0"
            :max="discountType === 'percentage' ? 100 : undefined"
            class="w-full pl-8 pr-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            :class="{ 'border-red-300': showError }"
          />
        </div>
        <p v-if="showError" class="text-red-500 text-xs mt-1">
          {{ errorMessage }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-3">
        <button
          v-if="item?.discount"
          @click="removeDiscount"
          class="flex-1 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
        >
          Remove Discount
        </button>
        <button
          @click="applyDiscount"
          class="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          {{ item?.discount ? 'Update' : 'Apply' }} Discount
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
    icon: 'mdi:currency-gbp'
  },
  {
    value: 'percentage',
    label: 'Percentage',
    icon: 'mdi:percent'
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