<template>
  <UModal 
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :ui="{ 
      width: 'sm:max-w-[500px]',
      overlay: { background: 'bg-gray-900/60' },
      height: 'auto',
      padding: 'p-0',
      background: 'bg-white dark:bg-gray-900',
      rounded: 'rounded-xl'
    }"
  >
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-2">
          <div class="bg-red-50 p-2 rounded-lg">
            <Icon name="mdi:close-circle" class="text-red-500" size="24" />
          </div>
          <h2 class="text-xl font-bold text-gray-800">Cancel Order</h2>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
          <Icon name="mdi:close" size="24" />
        </button>
      </div>

      <!-- Waste Toggle -->
      <div class="mb-6">
        <div 
          @click="isWaste = !isWaste"
          class="flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all duration-200"
          :class="isWaste ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'"
        >
          <div class="flex items-center space-x-3">
            <Icon 
              name="mdi:trash-can" 
              :class="isWaste ? 'text-red-500' : 'text-gray-500'" 
              size="24" 
            />
            <div>
              <h3 class="text-[15px] font-medium" :class="isWaste ? 'text-red-700' : 'text-gray-700'">
                Mark as Waste
              </h3>
              <p class="text-[13px] text-gray-500">Items will be marked as wasted in inventory</p>
            </div>
          </div>
          <div class="flex-shrink-0">
            <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                 :class="isWaste ? 'border-red-500 bg-red-500' : 'border-gray-300'">
              <Icon v-if="isWaste" name="mdi:check" class="text-white" size="16" />
            </div>
          </div>
        </div>
      </div>

      <!-- Cancellation Reasons -->
      <div class="space-y-3 mb-6">
        <h3 class="text-[14px] font-medium text-gray-700">Select Reason <span class="text-red-500">*</span></h3>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="reason in reasons"
            :key="reason"
            @click="selectedReason = reason"
            class="p-3 text-[13px] border-2 rounded-lg transition-all duration-200 text-left"
            :class="selectedReason === reason 
              ? 'border-[#2b3c5e] bg-[#f8faff] text-[#2b3c5e]' 
              : 'border-gray-200 text-gray-600 hover:border-gray-300'"
          >
            {{ reason }}
          </button>
        </div>
        <p v-if="showError" class="text-red-500 text-[12px] mt-2">
          Please select a reason to continue
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-3">
        <button
          @click="closeModal"
          class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
        >
          Cancel
        </button>
        <button
          @click="handleConfirm"
          class="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-2"
        >
          <Icon name="mdi:check" size="18" />
          <span>Confirm</span>
        </button>
      </div>
    </div>
  </UModal>
</template>

<script setup>
import { ref } from 'vue';
import { useOrderStore } from '~/stores/orderStore';

const OrderStore = useOrderStore();

const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const isWaste = ref(false);
const selectedReason = ref('');
const showError = ref(false);

const reasons = [
  'Customer Cancelled',
  'Out of Stock',
  'Payment Issue',
  'Incorrect Order',
  'Other'
];

const closeModal = () => {
  emit('update:modelValue', false);
  resetForm();
};

const resetForm = () => {
  isWaste.value = false;
  selectedReason.value = '';
  showError.value = false;
};

const handleConfirm = async () => {
  if (!selectedReason.value) {
    showError.value = true;
    return;
  }

  try {
    const response = await useApi(`orders/${OrderStore.currentOrder.id}/cancel`, 'POST', {
      type: 'object',
      data: {
        waste: isWaste.value ? 1 : null,
        reason: selectedReason.value
      }
    });

    if (response) {
      push.success('Order cancelled successfully');
      emit('update:modelValue', false);
      OrderStore.closeOrder();
      resetForm();
    }
  } catch (error) {
    console.error('Error cancelling order:', error);
    push.error('Failed to cancel order');
  }
};
</script> 