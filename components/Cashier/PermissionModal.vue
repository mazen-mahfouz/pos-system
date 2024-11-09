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

    <div class="p-6">
      <div class="space-y-4">
        <div class="text-sm text-gray-600">{{ actionMessage }}</div>
        
        <div class="bg-gray-50 p-4 rounded-xl">
          <div class="space-y-4">
            <div class="text-center mb-2">
              <h3 class="text-base font-semibold text-gray-800">Manager Code</h3>
              <p class="text-xs text-gray-500 mt-1">Please enter the 4-digit authorization code</p>
            </div>

            <div class="flex justify-center gap-2">
              <input
                v-for="(digit, index) in 4"
                :key="index"
                v-model="codeDigits[index]"
                type="password"
                inputmode="numeric"
                maxlength="1"
                :disabled="isLoading"
                class="w-[45px] h-[45px] text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b3c5e]/20 focus:border-[#2b3c5e] transition-all duration-300 bg-white shadow-sm disabled:opacity-50"
                :class="{ 'border-[#2b3c5e] bg-[#f8faff] transform scale-[1.05]': codeDigits[index] }"
                @input="onCodeInput(index)"
                @keydown="onCodeKeydown($event, index)"
                ref="codeInputs"
              />
            </div>

            <div class="mt-6 grid grid-cols-3 gap-2">
              <button
                v-for="n in 9"
                :key="n"
                type="button"
                @click="appendDigit(n)"
                :disabled="isLoading"
                class="w-full h-12 rounded-lg bg-white border-2 border-gray-200 text-gray-700 font-semibold text-lg hover:bg-[#f8faff] hover:border-[#2b3c5e] hover:scale-[1.02] transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ n }}
              </button>
              <button
                type="button"
                @click="clearLastDigit"
                :disabled="isLoading"
                class="w-full h-12 rounded-lg bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:bg-[#f8faff] hover:border-[#2b3c5e] hover:scale-[1.02] transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="material-symbols:backspace-outline" size="20" />
              </button>
              <button
                type="button"
                @click="appendDigit(0)"
                :disabled="isLoading"
                class="w-full h-12 rounded-lg bg-white border-2 border-gray-200 text-gray-700 font-semibold text-lg hover:bg-[#f8faff] hover:border-[#2b3c5e] hover:scale-[1.02] transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                0
              </button>
              <button
                type="button"
                @click="clearAllDigits"
                :disabled="isLoading"
                class="w-full h-12 rounded-lg bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:bg-[#f8faff] hover:border-[#2b3c5e] hover:scale-[1.02] transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
      <div class="flex items-center justify-end space-x-3">
        <button
          @click="$emit('update:modelValue', false)"
          :disabled="isLoading"
          class="px-4 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        
        <button
          @click="handleConfirm"
          :disabled="!codeDigits.some(digit => digit !== '') || isLoading"
          class="px-6 py-2.5 bg-[#2b3c5e] text-white rounded-lg hover:bg-[#1a2744] active:bg-[#2b3c5e] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium flex items-center space-x-2"
        >
          <template v-if="isLoading">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Verifying...</span>
          </template>
          <template v-else>
            <Icon name="mdi:shield-check" size="18" />
            <span>Authorize</span>
          </template>
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
const isLoading = ref(false);

const actionMessage = computed(() => {
  const messages = {
    'end shift': 'Manager authorization is required to end the current shift.',
    'edit order': 'Manager authorization is required to edit this order.',
    'cancel order': 'Manager authorization is required to cancel this order.',
    'split order': 'Manager authorization is required to split this order.',
    'merge order': 'Manager authorization is required to merge orders.',
    'remove discount': 'Manager authorization is required to remove the discount.',
    'create discount': 'Manager authorization is required to create a new discount.',
    'edit discount': 'Manager authorization is required to edit the discount.',
    'delete discount': 'Manager authorization is required to delete the discount.',
    'reprint receipt': 'Manager authorization is required to reprint the receipt.',
    'shift details': 'Manager authorization is required to view shift details.'
  };
  return messages[props.action] || 'Manager authorization is required to perform this action.';
});

const handleConfirm = () => {
  const code = codeDigits.value.join('');
  if (!code) return;

  isLoading.value = true;

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
      isLoading.value = false;
      codeDigits.value = Array(4).fill('');
    });
};

const onCodeInput = (index) => {
  codeDigits.value[index] = codeDigits.value[index].replace(/[^0-9]/g, '');
  
  if (codeDigits.value[index].length === 1 && index < 3) {
    codeInputs.value[index + 1]?.focus();
  }
  
  if (codeDigits.value.every(digit => digit !== '')) {
    setTimeout(() => {
      handleConfirm();
    }, 300);
  }
};

const onCodeKeydown = (event, index) => {
  if (event.key === 'Backspace' && index > 0 && codeDigits.value[index] === '') {
    codeInputs.value[index - 1]?.focus();
  }
};

const appendDigit = (digit) => {
  const emptyIndex = codeDigits.value.findIndex(d => d === '');
  if (emptyIndex !== -1) {
    codeDigits.value[emptyIndex] = digit.toString();
    if (emptyIndex < 3) {
      codeInputs.value[emptyIndex + 1]?.focus();
    }
    if (codeDigits.value.every(digit => digit !== '')) {
      setTimeout(() => {
        handleConfirm();
      }, 300);
    }
  }
};

const clearLastDigit = () => {
  const lastFilledIndex = codeDigits.value.map(d => d !== '').lastIndexOf(true);
  if (lastFilledIndex !== -1) {
    codeDigits.value[lastFilledIndex] = '';
    codeInputs.value[lastFilledIndex]?.focus();
  }
};

const clearAllDigits = () => {
  codeDigits.value = Array(4).fill('');
  codeInputs.value[0]?.focus();
};

onMounted(() => {
  if (codeInputs.value[0]) {
    codeInputs.value[0].focus();
  }
});
</script>