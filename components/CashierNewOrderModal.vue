<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50" @click="close">
        <div class="bg-white rounded-3xl p-6 lg:p-10 w-10/12 lg:w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
          <div class="grid grid-cols-2 gap-8">
            <button @click="selectOrderType('dine-in')" class="order-type-btn" :class="{ 'selected': selectedOrderType === 'dine-in' }">
              <Icon name="mdi:silverware-fork-knife" class="text-[45px] lg:text-[64px]" />
              <span class="text-[23px] lg:text-2xl font-bold mt-6">Dine In</span>
            </button>
            <button @click="selectOrderType('takeaway')" class="order-type-btn" :class="{ 'selected': selectedOrderType === 'takeaway' }">
              <Icon name="mdi:food-takeout-box" class="text-[45px] lg:text-[64px]" />
              <span class="text-[23px] lg:text-2xl font-bold mt-6">Take Away</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue', 'select-order-type']);

const selectedOrderType = ref(null);

const selectOrderType = (type) => {
  selectedOrderType.value = type;
  emit('select-order-type', type);
};

const close = () => {
  emit('update:modelValue', false);
};
</script>

<style lang="scss" scoped>
.order-type-btn {
  @apply flex flex-col items-center justify-center p-10 bg-white border-2 border-gray-200 rounded-3xl transition-all duration-300;
  &.selected {
    @apply border-blue-500 bg-blue-50;
  }
  &:hover {
    @apply bg-gray-50 transform scale-105;
  }
}
</style> 