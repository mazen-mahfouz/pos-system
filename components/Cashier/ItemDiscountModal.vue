<template>
  <UModal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
    :ui="{ 
      width: 'sm:max-w-[600px]',
      overlay: { background: 'bg-gray-900/60 backdrop-blur-sm' },
      height: 'auto',
      padding: 'p-0',
      background: 'bg-white dark:bg-gray-900',
      rounded: 'rounded-xl'
    }">
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-3">
          <div class="relative w-12 h-12">
            <NuxtImg :src="item?.product?.image || item?.image || '/img/notfound.png'"
              class="w-full h-full rounded-lg object-cover shadow-sm border-2 border-gray-100" />
            <div class="absolute -top-1.5 -right-1.5 bg-[#2b3c5e] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium shadow-sm">
              {{ item?.quantity }}
            </div>
          </div>
          <div>
            <h2 class="text-[15px] font-bold text-gray-800">{{ item.product?.name || item.name }}</h2>
            <div class="flex items-center space-x-2 mt-0.5">
              <span class="text-[13px] text-gray-600">£{{ item?.price }}</span>
              <span class="text-[13px] text-gray-400">|</span>
              <span class="text-[13px] text-gray-600">Total: £{{ (item?.price * item?.quantity).toFixed(2) }}</span>
            </div>
          </div>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <Icon name="mdi:close" size="20" />
        </button>
      </div>

      <!-- Discount Types -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <button v-for="type in discountTypes" 
                :key="type.value"
                @click="discountType = type.value"
                class="relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02]"
                :class="[
                  discountType === type.value 
                    ? 'border-[#2b3c5e] bg-gray-50' 
                    : 'border-gray-200'
                ]">
          <div class="flex flex-col items-center space-y-2">
            <div class="bg-white p-3 rounded-lg shadow-sm">
              <Icon :name="type.icon" 
                    :class="discountType === type.value ? 'text-[#2b3c5e]' : 'text-gray-600'"
                    size="24" />
            </div>
            <span class="text-[14px] font-medium text-gray-700">{{ type.label }}</span>
            <p class="text-[12px] text-gray-500 text-center">{{ type.description }}</p>
          </div>
          <div v-if="discountType === type.value" class="absolute top-2 right-2">
            <Icon name="mdi:check-circle" class="text-[#2b3c5e]" size="18" />
          </div>
        </button>
      </div>

      <!-- Amount Input Section -->
      <div class="bg-gray-50 p-5 rounded-xl mb-6">
        <div class="space-y-4">
          <div>
            <label class="text-[14px] text-gray-600 mb-2 block">
              {{ discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount' }}
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                {{ discountType === 'percentage' ? '%' : '£' }}
              </span>
              <input v-model="amount"
                     type="number"
                     :min="0"
                     :max="discountType === 'percentage' ? 100 : item?.price * item?.quantity"
                     class="w-full p-3 pl-8 text-[14px] border-2 rounded-lg transition-all duration-200"
                     :class="[
                       showError ? 'border-red-300' : 'border-gray-200',
                       'focus:ring-2 focus:ring-[#2b3c5e] focus:border-[#2b3c5e]'
                     ]"
                     :placeholder="discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'" />
            </div>
            <p v-if="showError" class="mt-1 text-[12px] text-red-500">{{ errorMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Savings Preview -->
      <div v-if="isValidAmount" 
           class="bg-green-50 rounded-xl p-5 border border-green-100 mb-6">
        <h4 class="text-[14px] font-medium text-green-800 mb-3">Discount Summary</h4>
        <div class="grid grid-cols-3 gap-4">
          <div class="space-y-1">
            <span class="text-[12px] text-green-600">Original Price</span>
            <p class="text-[14px] font-medium text-green-700">
              £{{ (item?.price * item?.quantity).toFixed(2) }}
            </p>
          </div>
          <div class="space-y-1">
            <span class="text-[12px] text-green-600">Savings</span>
            <p class="text-[14px] font-medium text-green-700">
              £{{ calculateSavings().toFixed(2) }}
            </p>
          </div>
          <div class="space-y-1">
            <span class="text-[12px] text-green-600">Final Price</span>
            <p class="text-[15px] font-semibold text-green-700">
              £{{ calculateNewTotal().toFixed(2) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-4">
        <button @click="closeModal"
                class="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center space-x-2 text-[14px] font-medium">
          <Icon name="mdi:close" size="18" />
          <span>Cancel</span>
        </button>
        <button v-if="props.item?.discount"
                @click="removeDiscount"
                class="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center space-x-2 text-[14px] font-medium">
          <Icon name="mdi:delete" size="18" />
          <span>Remove Discount</span>
        </button>
        <button @click="applyDiscount"
                :disabled="!isValidAmount"
                class="flex-1 px-6 py-3 bg-[#2b3c5e] text-white rounded-lg hover:bg-[#22407c] disabled:opacity-50 disabled:hover:bg-[#2b3c5e] transition-all duration-200 flex items-center justify-center space-x-2 text-[14px] font-medium">
          <Icon name="mdi:check" size="18" />
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

const discountType = ref(props.item?.discount_type || 'cash');
const amount = ref(props.item?.discount || '');
const showError = ref(false);
const errorMessage = ref('');

const discountTypes = [
  { 
    value: 'cash', 
    label: 'Fixed Amount',
    icon: 'mdi:currency-gbp',
    description: 'Apply fixed cash discount'
  },
  { 
    value: 'percentage', 
    label: 'Percentage',
    icon: 'mdi:percent',
    description: 'Apply percentage based discount'
  }
];

const isValidAmount = computed(() => {
  if (!amount.value) return false;
  const numAmount = Number(amount.value);
  
  if (discountType.value === 'percentage') {
    return numAmount > 0 && numAmount <= 100;
  }
  
  const maxAmount = props.item?.price * props.item?.quantity;
  return numAmount > 0 && numAmount <= maxAmount;
});

const getQuickAmounts = () => {
  if (discountType.value === 'percentage') {
    return [5, 10, 15, 20, 25, 50];
  }
  const basePrice = props.item?.price * props.item?.quantity;
  return [1, 2, 5, 10].filter(amount => amount < basePrice);
};

const calculateSavings = () => {
  const basePrice = props.item?.price * props.item?.quantity;
  if (discountType.value === 'percentage') {
    return (basePrice * Number(amount.value)) / 100;
  }
  return Number(amount.value);
};

const calculateNewTotal = () => {
  const basePrice = props.item?.price * props.item?.quantity;
  return basePrice - calculateSavings();
};

const applyDiscount = () => {
  emit('update', {
    ...props.item,
    discount: {
      type: discountType.value,
      amount: Number(amount.value)
    }
  });
  closeModal();
};

const removeDiscount = async () => {
  try {
    // إرسال طلب API لحذف الخصم مع البيانات المطلوبة
    await useApi(`orderItem/${props.item.id}/discount`, 'POST', {
      amount: 0,
      type: discountType.value
    });
    
    // تحديث الواجهة
    emit('update', {
      ...props.item,
      discount: null,
      discount_type: null
    });
    
    // إغلاق النافذة المنبثقة
    closeModal();
    
    // إظهار رسالة نجاح
    push.success('Discount removed successfully');
  } catch (error) {
    console.error('Error removing discount:', error);
    push.error('Failed to remove discount');
  }
};

const closeModal = () => {
  emit('update:modelValue', false);
};

// Reset form when modal opens
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    console.log(props.item);
    discountType.value = props.item?.discount_type || 'cash';
    amount.value = props.item?.discount || '';
    showError.value = false;
  }
});
</script> 