<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50" @click="close">
        <div class="bg-white rounded-3xl p-4 sm:p-8 w-11/12 sm:w-10/12 md:w-9/12 lg:w-8/12 xl:w-8/12 max-w-4xl max-h-[85vh] overflow-y-auto" @click.stop>
          <div class="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 class="text-lg sm:text-xl xl:text-2xl font-bold text-gray-800">Select Order Type</h2>
              <p class="text-xs sm:text-sm xl:text-base text-gray-500 mt-1">Choose how you want to serve your guests</p>
            </div>
            <button @click="close" class="text-gray-400 hover:text-gray-600">
              <Icon name="mdi:close" size="20 sm:24" />
            </button>
          </div>

          <div class="grid grid-cols-2 gap-4 sm:gap-5">
            <button @click="selectOrderType('dine-in')" 
                    class="table-btn"
                    :class="{ 'selected': selectedOrderType === 'dine-in' }">
              <div class="mb-2 p-2 rounded-full bg-gray-50">
                <Icon name="mdi:silverware-fork-knife" 
                      class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#2b3c5e]" />
              </div>
              <div class="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Dine In</div>
              <div class="mt-1 text-xs sm:text-sm md:text-base text-gray-600">
                Restaurant Seating
              </div>
            </button>

            <button @click="selectOrderType('takeaway')" 
                    class="table-btn"
                    :class="{ 'selected': selectedOrderType === 'takeaway' }">
              <div class="mb-2 sm:mb-3 p-2 sm:p-3 rounded-full bg-gray-50">
                <Icon name="mdi:food-takeout-box" 
                      class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#2b3c5e]" />
              </div>
              <div class="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Take Away</div>
              <div class="mt-2 text-xs sm:text-sm md:text-base text-gray-600">
                To-Go Orders
              </div>
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
.table-btn {
  @apply flex flex-col items-center justify-center p-4 sm:p-5 md:p-6 lg:p-8 
         bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl 
         transition-all duration-300;
  &.selected {
    @apply border-blue-500 bg-blue-50;
  }
  &:hover {
    @apply transform scale-105;
  }
}
</style> 