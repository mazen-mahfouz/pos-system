<template>
  <UModal 
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :ui="{ 
      width: 'sm:max-w-[500px]',
      overlay: { background: 'bg-gray-900/60 backdrop-blur-sm' },
      padding: 'p-0',
      background: 'bg-white dark:bg-gray-900',
      rounded: 'rounded-xl'
    }"
  >
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-3">
          <div class="bg-blue-50 p-2 rounded-lg">
            <Icon name="mdi:note-text" class="text-blue-600" size="24" />
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

      <!-- Quick Notes -->
      <div class="mb-4">
        <h3 class="text-sm font-medium text-gray-700 mb-2">Quick Notes</h3>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="quickNote in quickNotes"
            :key="quickNote"
            @click="addQuickNote(quickNote)"
            class="px-3 py-1.5 text-sm rounded-full border-2 transition-all duration-200"
            :class="note.includes(quickNote) 
              ? 'border-blue-500 bg-blue-50 text-blue-700' 
              : 'border-gray-200 hover:border-gray-300 text-gray-600'"
          >
            {{ quickNote }}
          </button>
        </div>
      </div>

      <!-- Note Input -->
      <div class="mb-6">
        <label class="text-sm font-medium text-gray-700 mb-2 block">
          Custom Note
        </label>
        <textarea
          v-model="note"
          rows="4"
          class="w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          :class="{ 'border-red-300': showError }"
          placeholder="Enter special instructions or notes..."
        ></textarea>
        <div class="flex justify-between mt-1">
          <p v-if="showError" class="text-red-500 text-xs">
            {{ errorMessage }}
          </p>
          <p class="text-xs text-gray-500">
            {{ note.length }}/200 characters
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-3">
        <button
          v-if="item?.note"
          @click="removeNote"
          class="flex-1 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
        >
          Remove Note
        </button>
        <button
          @click="saveNote"
          class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {{ item?.note ? 'Update' : 'Save' }} Note
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

const note = ref(props.item?.note || '');
const showError = ref(false);
const errorMessage = ref('');

const quickNotes = [
  'No onions',
  'Extra spicy',
  'No garlic',
  'Gluten free',
  'Well done',
  'Medium rare',
  'Extra sauce',
  'No nuts'
];

const addQuickNote = (quickNote) => {
  if (note.value.includes(quickNote)) {
    note.value = note.value.replace(quickNote + '\n', '').trim();
  } else {
    note.value = (note.value + '\n' + quickNote).trim();
  }
};

const validateNote = () => {
  if (note.value.length > 200) {
    errorMessage.value = 'Note cannot exceed 200 characters';
    showError.value = true;
    return false;
  }
  showError.value = false;
  return true;
};

const saveNote = () => {
  if (!validateNote()) return;

  emit('update', {
    ...props.item,
    note: note.value.trim() || null
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
    showError.value = false;
  }
});
</script> 