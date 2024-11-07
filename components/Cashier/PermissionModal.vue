<template>
  <UModal 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    :ui="{ 
      width: 'sm:max-w-[450px]',
      height: 'auto',
      padding: 'p-0',
      background: 'bg-white dark:bg-gray-900',
      rounded: 'rounded-xl'
    }"
  >
    <!-- Header -->
    <div class="bg-gradient-to-r from-[#2b3c5e] to-[#1a2744] p-4 rounded-t-xl">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="bg-white/10 p-2 rounded-lg">
            <Icon name="mdi:shield-lock" class="text-white" size="20" />
          </div>
          <h2 class="text-white text-lg font-semibold">Manager Authorization</h2>
        </div>
        <button @click="$emit('update:modelValue', false)" 
                class="text-white/70 hover:text-white transition-colors">
          <Icon name="mdi:close" size="24" />
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700 block">Manager Code</label>
        <div class="flex justify-center gap-2">
          <input
            v-for="(digit, index) in 4"
            :key="index"
            v-model="codeDigits[index]"
            type="password"
            inputmode="numeric"
            maxlength="1"
            class="w-[45px] h-[45px] text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b3c5e]/20 focus:border-[#2b3c5e] transition-all duration-300 bg-white shadow-sm"
            :class="{ 'border-[#2b3c5e] bg-[#f8faff] transform scale-[1.05]': codeDigits[index] }"
            @input="onCodeInput(index)"
            @keydown="onCodeKeydown($event, index)"
            ref="codeInputs"
          />
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
      <div class="flex items-center justify-end space-x-3">
        <button
          @click="$emit('update:modelValue', false)"
          class="px-4 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 text-sm font-medium"
        >
          Cancel
        </button>
        
        <button
          @click="handleConfirm"
          :disabled="!codeDigits.some(digit => digit !== '')"
          class="px-6 py-2.5 bg-[#2b3c5e] text-white rounded-lg hover:bg-[#1a2744] active:bg-[#2b3c5e] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium flex items-center space-x-2"
        >
          <Icon name="mdi:shield-check" size="18" />
          <span>Authorize</span>
        </button>
      </div>
    </div>
  </UModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  action: {
    type: String,
    required: true,
    validator: (value) => [
      'end shift',
      'edit order',
      'cancel order',
      'split order',
      'merge order',
      'remove discount',
      'create discount',
      'edit discount',
      'delete discount',
      'reprint receipt',
      'shift details'
    ].includes(value)
  }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const codeDigits = ref(Array(4).fill(''));
const codeInputs = ref([]);

const actionMessage = computed(() => {
  switch (props.action) {
    case 'end shift':
      return 'Manager authorization is required to end the current shift.';
    case 'edit order':
      return 'Manager authorization is required to edit this order.';
    case 'cancel order':
      return 'Manager authorization is required to cancel this order.';
    case 'split order':
      return 'Manager authorization is required to split this order.';
    case 'merge order':
      return 'Manager authorization is required to merge orders.';
    case 'remove discount':
      return 'Manager authorization is required to remove the discount.';
    case 'create discount':
      return 'Manager authorization is required to create a new discount.';
    case 'edit discount':
      return 'Manager authorization is required to edit the discount.';
    case 'delete discount':
      return 'Manager authorization is required to delete the discount.';
    case 'reprint receipt':
      return 'Manager authorization is required to reprint the receipt.';
    case 'shift details':
      return 'Manager authorization is required to view shift details.';
    default:
      return 'Manager authorization is required to perform this action.';
  }
});

const handleConfirm = () => {
  const code = codeDigits.value.join('');
  if (!code) return;

  useApi('permission', 'POST', {
    type: 'object',
    data: {
      code: code,
      permission: props.action
    }
  })
    .then(response => {
      if (response.message === true) {
        emit('confirm', true);
        emit('update:modelValue', false);
        push.success('Permission verified successfully');
      } else {
        push.error('Invalid authorization code');
      }
    })
    .catch(error => {
      console.error('Permission verification error:', error);
      push.error('Failed to verify permission');
    })
    .finally(() => {
      codeDigits.value = Array(4).fill('');
    });
};

const onCodeInput = (index) => {
  // Ensure only numbers are entered
  codeDigits.value[index] = codeDigits.value[index].replace(/[^0-9]/g, '');
  
  if (codeDigits.value[index].length === 1 && index < 3) {
    // Move to next input
    codeInputs.value[index + 1]?.focus();
  }
  
  // If all digits are filled, submit automatically
  if (codeDigits.value.every(digit => digit !== '')) {
    handleConfirm();
  }
};

const onCodeKeydown = (event, index) => {
  if (event.key === 'Backspace' && index > 0 && codeDigits.value[index] === '') {
    codeInputs.value[index - 1]?.focus();
  }
};

onMounted(() => {
  // Focus first input when modal opens
  if (codeInputs.value[0]) {
    codeInputs.value[0].focus();
  }
});
</script>