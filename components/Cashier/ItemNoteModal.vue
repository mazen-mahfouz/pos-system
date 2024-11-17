<template>
  <UModal 
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :ui="{ 
      width: 'sm:max-w-[600px]',
      overlay: { background: 'bg-gray-900/60 backdrop-blur-sm' },
      height: 'auto',
      padding: 'p-0',
      background: 'bg-white dark:bg-gray-900',
      rounded: 'rounded-xl'
    }"
  >
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-3">
          <div class="bg-[#2b3c5e]/10 p-2 rounded-lg">
            <Icon name="mdi:note" class="text-[#2b3c5e]" size="24" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-800">
              {{ item?.note ? 'Edit' : 'Add' }} Item Note
            </h2>
            <p class="text-sm text-gray-500 mt-1">{{ item?.name }}</p>
          </div>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
          <Icon name="mdi:close" size="24" />
        </button>
      </div>

      <!-- Note Input -->
      <div class="bg-gray-50 p-5 rounded-xl mb-6">
        <div class="relative">
          <label class="text-[14px] text-gray-600 mb-2 block">
            Special Instructions
          </label>
          <div class="relative">
            <textarea
              v-model="note"
              rows="4"
              class="w-full p-3 text-[15px] border-2 rounded-lg transition-all duration-200 focus:ring-[#2b3c5e] focus:border-[#2b3c5e]"
              placeholder="Enter special instructions or notes for this item..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Quick Notes -->
      <div class="mb-6">
        <h3 class="text-[14px] font-medium text-gray-700 mb-3">Quick Notes</h3>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="quickNote in quickNotes"
            :key="quickNote"
            @click="appendQuickNote(quickNote)"
            class="p-2.5 text-[13px] border-2 rounded-lg transition-all duration-200 text-left hover:border-[#2b3c5e] hover:bg-[#f8faff]"
          >
            {{ quickNote }}
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-3">
        <button
          v-if="item?.note"
          @click="removeNote"
          class="flex-1 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-2"
        >
          <Icon name="mdi:delete" size="18" />
          <span>Remove Note</span>
        </button>
        <button
          @click="closeModal"
          class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
        >
          Cancel
        </button>
        <button
          @click="applyNote"
          class="flex-1 px-4 py-2.5 bg-[#2b3c5e] text-white rounded-lg hover:bg-[#1a2744] transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-2"
        >
          <Icon name="mdi:check" size="18" />
          <span>Apply Note</span>
        </button>
      </div>
    </div>
  </UModal>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  item: Object
});

const emit = defineEmits(['update:modelValue', 'update']);
const note = ref('');

const quickNotes = [
  'No onions',
  'Extra spicy',
  'Well done',
  'No sauce',
  'Extra sauce',
  'No garnish'
];

const appendQuickNote = (quickNote) => {
  if (note.value) {
    note.value += ', ' + quickNote.toLowerCase();
  } else {
    note.value = quickNote.toLowerCase();
  }
};

const applyNote = () => {
  emit('update', {
    ...props.item,
    note: note.value.trim()
  });
  closeModal();
};

const removeNote = () => {
  emit('update', {
    ...props.item,
    note: null
  });
  closeModal();
};

const closeModal = () => {
  emit('update:modelValue', false);
};

// Reset form when modal opens
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    note.value = props.item?.note || '';
  }
});
</script> 