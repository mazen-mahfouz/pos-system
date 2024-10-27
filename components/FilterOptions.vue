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
        class="btn-filter text-[12px] font-[600] cursor-pointer px-4 py-2 rounded-xl text-[#515151] bg-[#a0a0ff24] peer-checked:bg-[#1d3c7e] peer-checked:text-white"
        :for="`option-${idx + 1}`"
      >
        {{ option.name }}
        <span v-if="idx === 0">({{ option.count }})</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  filters: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: String,
    default: 'all',
  },
});

const emit = defineEmits(['update:modelValue']);

const selected = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
  selected.value = newVal;
});

watch(selected, (newVal) => {
  emit('update:modelValue', newVal);
});
</script>

<style scoped>
.btn-filter {
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
}
</style>
