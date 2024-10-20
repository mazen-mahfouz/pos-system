<template>
  <div class="flex items-center space-x-4">
    <div class="flex items-center justify-center gap-2 border border-[#d1d5db] rounded-lg p-2">
      <span class="flex items-center justify-center gap-2 pr-2 border-r border-[#d1d5db]">
        <Icon name="line-md:calendar" class="text-[#686868] text-[16px]" />
        <span class="text-[15px] font-semibold text-[#686868]">From</span>
      </span>
      <UPopover :popper="{ placement: 'bottom-start' }">
        <UButton :label="formatDate(modelFrom)" class="text-gray-600 bg-transparent hover:bg-transparent p-1" />
        <template #panel>
          <ReusableDatePicker v-model="modelFrom" is-required @update:modelValue="updateDates" />
        </template>
      </UPopover>
    </div>
    <div class="flex items-center justify-center gap-2 border border-[#d1d5db] rounded-lg p-2">
      <span class="flex items-center justify-center gap-2 pr-2 border-r border-[#d1d5db]">
        <Icon name="line-md:calendar" class="text-[#686868] text-[16px]" />
        <span class="text-[15px] font-semibold text-[#686868]">To</span>
      </span>
      <UPopover :popper="{ placement: 'bottom-start' }">
        <UButton :label="formatDate(modelTo)" class="text-gray-600 bg-transparent hover:bg-transparent p-1" />
        <template #panel>
          <ReusableDatePicker v-model="modelTo" is-required @update:modelValue="updateDates" />
        </template>
      </UPopover>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { format } from 'date-fns';

const props = defineProps({
  from: {
    type: Date,
    default: null,
  },
  to: {
    type: Date,
    default: null,
  },
});

const emit = defineEmits(['update:from', 'update:to', 'update:dates']);

const modelFrom = ref(props.from);
const modelTo = ref(props.to);

watch(() => props.from, (newValue) => {
  modelFrom.value = newValue;
});

watch(() => props.to, (newValue) => {
  modelTo.value = newValue;
});

const updateDates = () => {
  emit('update:from', modelFrom.value);
  emit('update:to', modelTo.value);
  emit('update:dates');
};

const formatDate = (date) => {
  if (!date) return 'Select date';
  return format(date, 'MMM dd, yyyy');
};
</script>