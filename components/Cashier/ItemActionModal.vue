<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50" @click="close">
        <div class="bg-white rounded-3xl p-4 sm:p-8 w-11/12 sm:w-10/12 md:w-9/12 lg:w-9/12 xl:w-8/12 max-w-4xl max-h-[85vh] overflow-y-auto" @click.stop>
          <div class="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 class="text-lg sm:text-xl xl:text-2xl font-bold text-gray-800">Item Actions</h2>
              <p class="text-xs sm:text-sm xl:text-base text-gray-500 mt-1">Choose what you want to do with this item</p>
            </div>
            <button @click="close" class="text-gray-400 hover:text-gray-600">
              <Icon name="mdi:close" size="20 sm:24" />
            </button>
          </div>

          <div class="grid grid-cols-2 gap-4 sm:gap-5">
            <button @click="handleDiscount" 
                    class="action-btn"
                    :class="{ 'selected': selectedAction === 'discount' }">
              <div class="mb-2 p-2 rounded-full bg-gray-50">
                <Icon name="mdi:tag" 
                      class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-green-600" />
              </div>
              <div class="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
                {{ item?.discount ? 'Edit Discount' : 'Add Discount' }}
              </div>
              <div class="mt-1 text-xs sm:text-sm md:text-base text-gray-600">
                Apply special pricing
              </div>
            </button>

            <button @click="handleNote" 
                    class="action-btn"
                    :class="{ 'selected': selectedAction === 'note' }">
              <div class="mb-2 sm:mb-3 p-2 sm:p-3 rounded-full bg-gray-50">
                <Icon name="mdi:note" 
                      class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-blue-600" />
              </div>
              <div class="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
                {{ item?.note ? 'Edit Note' : 'Add Note' }}
              </div>
              <div class="mt-2 text-xs sm:text-sm md:text-base text-gray-600">
                Special instructions
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
  modelValue: Boolean,
  item: Object
});

const emit = defineEmits(['update:modelValue', 'open-discount', 'open-note']);

const selectedAction = ref(null);

const handleDiscount = () => {
  selectedAction.value = 'discount';
  emit('update:modelValue', false);
  setTimeout(() => {
    emit('open-discount', props.item);
  }, 100);
};

const handleNote = () => {
  selectedAction.value = 'note';
  emit('update:modelValue', false);
  setTimeout(() => {
    emit('open-note', props.item);
  }, 100);
};

const close = () => {
  emit('update:modelValue', false);
};
</script>

<style lang="scss" scoped>
.action-btn {
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 