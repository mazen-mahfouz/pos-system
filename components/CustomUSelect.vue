<template>
  <div class="relative w-full">
    <button
      class="w-full bg-white border min-w-[150px] border-gray-300 rounded-lg px-4 h-[40px] flex justify-between items-center gap-2"
      @click="toggleDropdown"
    >
      <span class="text-gray-700 text-[12px] font-[600]">
        {{ selectedLabel }}
      </span>
      <svg
        class="w-5 h-5 text-gray-500"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <transition name="fade">
      <ul
        v-if="isOpen"
        class="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
      >
        <li
          v-for="(option, index) in options"
          :key="index"
          @click="selectOption(option)"
          class="px-4 py-3 border-b border-[#8080801b] hover:bg-[#F5F5F5] cursor-pointer"
        >
          {{ option.label }}
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  options: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: [String, Number, null],
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);

// State and logic
const isOpen = ref(false);

// Compute the selected label
const selectedLabel = computed(() => {
  const selected = props.options.find(
    (option) => option.value === props.modelValue
  );
  return selected ? selected.label : 'Select an option';
});

// Toggle the dropdown visibility
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

// Select an option and close the dropdown
const selectOption = (option) => {
  emit('update:modelValue', option.value);
  isOpen.value = false;
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>