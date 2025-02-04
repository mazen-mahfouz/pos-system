<!-- إنشاء مكون أساسي للمودال يمكن إعادة استخدامه -->
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" 
           class="fixed inset-0 bg-gray-900/60  flex items-center justify-center z-40 p-4"
           @click="$emit('update:modelValue', false)">
        <div class="bg-white rounded-2xl w-full relative overflow-hidden shadow-xl"
             :class="[
               sizeClasses[size],
               {'h-[90vh] max-h-[850px]': scrollable}
             ]"
             @click.stop>
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <div class="flex items-center gap-3">
              <div v-if="icon" class="bg-primary-50 p-2 rounded-lg">
                <Icon :name="icon" class="text-primary-600" size="20" />
              </div>
              <h2 class="text-lg font-semibold text-gray-800">
                <slot name="header">{{ title }}</slot>
              </h2>
            </div>
            <button @click="$emit('update:modelValue', false)" 
                    class="text-gray-400 hover:text-gray-600 transition-colors">
              <Icon name="mdi:close" size="20" />
            </button>
          </div>

          <!-- Content -->
          <div :class="[
            'px-6',
            {'overflow-y-auto': scrollable},
            {'py-6': !noPadding},
            heightClass
          ]">
            <slot></slot>
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" 
               class="px-6 py-4 bg-gray-50 border-t border-gray-100 sticky bottom-0">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  title: String,
  icon: String,
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  scrollable: {
    type: Boolean,
    default: true
  },
  noPadding: Boolean,
  maxHeight: String
});

const sizeClasses = {
  sm: 'max-w-[400px]',
  md: 'max-w-[550px]',
  lg: 'max-w-[700px]',
  xl: 'max-w-[900px]'
};

const heightClass = computed(() => 
  props.maxHeight ? `max-h-[${props.maxHeight}]` : ''
);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom Scrollbar */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #E5E7EB transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #E5E7EB;
  border-radius: 3px;
}
</style>