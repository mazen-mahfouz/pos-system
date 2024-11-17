<template>
  <UModal 
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :ui="{ 
      width: 'sm:max-w-[400px]',
      overlay: { background: 'bg-gray-900/60 backdrop-blur-sm' },
      padding: 'p-4',
    }"
  >
    <div class="space-y-4">
      <h3 class="text-lg font-semibold">Item Actions</h3>
      
      <div class="grid grid-cols-2 gap-4">
        <button
          @click="$emit('open-discount', item)"
          class="flex items-center justify-center space-x-2 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
        >
          <Icon name="mdi:tag" class="text-green-600" />
          <span class="text-green-700 font-medium">
            {{ item?.discount ? 'Edit Discount' : 'Add Discount' }}
          </span>
        </button>

        <button
          @click="$emit('open-note', item)"
          class="flex items-center justify-center space-x-2 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          <Icon name="mdi:note" class="text-blue-600" />
          <span class="text-blue-700 font-medium">
            {{ item?.note ? 'Edit Note' : 'Add Note' }}
          </span>
        </button>
      </div>
    </div>
  </UModal>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  item: Object
});

defineEmits(['update:modelValue', 'open-discount', 'open-note']);
</script> 