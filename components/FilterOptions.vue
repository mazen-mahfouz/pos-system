<template>
  <div class="filter-wrapper flex items-center gap-4">
    <div 
      v-for="(option, idx) in filters" 
      :key="idx" 
      class="flex items-center"
    >
      <input
        type="radio"
        class="hidden peer"
        name="filters"
        :value="option.value"
        v-model="selected"
        :id="`option-${idx + 1}`"
        autocomplete="off"
      />
      <label
        class="btn-filter text-[13px] font-[600] cursor-pointer px-4 py-2 rounded-xl  text-[#515151] bg-[#a0a0ff24] peer-checked:bg-[#2d71f8] peer-checked:text-white"
        :for="`option-${idx + 1}`"
      >
        {{ option.name }}
        <span v-if="idx === 0">({{ option.count }})</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Props to pass filter options from parent
defineProps({
  filters: {
    type: Array,
    required: true,
  },
});

// Store selected filter
const selected = ref(null);

// Emit event to parent when a filter is selected
defineEmits(['update:modelValue']);
watch(selected, (newVal) => {
  emit('update:modelValue', newVal);
});
</script>

<style scoped>
.btn-filter {
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
}
</style>
