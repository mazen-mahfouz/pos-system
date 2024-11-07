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
      <!-- <div class="mb-6">
        <div class="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
          <Icon name="mdi:alert" class="text-yellow-600 mt-0.5" size="20" />
          <div>
            <h3 class="text-sm font-medium text-yellow-800 mb-1">Authorization Required</h3>
            <p class="text-sm text-yellow-600">{{ actionMessage }}</p>
          </div>
        </div>
      </div> -->

      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700 block">Manager Code</label>
        <div class="relative">
          <input
            v-model="permissionCode"
            type="password"
            class="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2b3c5e]/20 focus:border-[#2b3c5e] transition-all duration-200"
            placeholder="Enter authorization code"
            @keyup.enter="handleConfirm"
            ref="codeInput"
          />
          <Icon 
            name="mdi:lock" 
            class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size="18" 
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
          :disabled="!permissionCode"
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
      'reprint reciept',
      'shift details'
    ].includes(value)
  }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const permissionCode = ref('');
const codeInput = ref(null);

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
    case 'reprint reciept':
      return 'Manager authorization is required to reprint the receipt.';
    case 'shift details':
      return 'Manager authorization is required to view shift details.';
    default:
      return 'Manager authorization is required to perform this action.';
  }
});

onMounted(() => {
  // Focus input when modal opens
  if (codeInput.value) {
    codeInput.value.focus();
  }
});

const handleConfirm = () => {
  if (!permissionCode.value) return;

  useApi('permission', 'POST', {
    type: 'object',
    data: {
      code: permissionCode.value,
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
      permissionCode.value = '';
    });
};
</script>