<template>
  <UModal v-if="item"
    :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
    :ui="{ 
      width: 'sm:max-w-[600px]',
      overlay: { background: 'bg-gray-900/60 ' },
      height: 'auto',
      padding: 'p-0',
      background: 'bg-white dark:bg-gray-900',
      rounded: 'rounded-xl'
    }">
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-3">
          <div class="relative w-12 h-12">
            <NuxtImg :src="itemImage"
              class="w-full h-full rounded-lg object-cover shadow-sm border-2 border-gray-100" />
            <div class="absolute -top-1.5 -right-1.5 bg-[#2b3c5e] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium shadow-sm">
              {{ item?.quantity }}
            </div>
          </div>
          <div>
            <h2 class="text-[15px] font-bold text-gray-800">{{ itemName }}</h2>
            <span class="text-[13px] text-gray-600">Special Instructions</span>
          </div>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <Icon name="mdi:close" size="20" />
        </button>
      </div>

      <!-- Current Note Display -->
      <div v-if="item?.note" class="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <Icon name="mdi:information" class="text-[#2b3c5e]" size="18" />
            <span class="text-[13px] text-gray-700">Current Note</span>
          </div>
          <button @click="removeNote" 
                  class="text-[13px] text-red-600 hover:text-red-700 flex items-center space-x-1">
            <Icon name="mdi:close-circle" size="16" />
            <span>Remove</span>
          </button>
        </div>
        <p class="mt-2 text-[13px] text-gray-700 bg-white p-2 rounded-lg">
          {{ item.note }}
        </p>
      </div>

      <!-- Note Input -->
      <div class="bg-gray-50 p-5 rounded-xl mb-6">
        <div class="space-y-4">
          <div>
            <label class="text-[14px] text-gray-600 mb-2 block">Special Instructions</label>
            <textarea
              v-model="note"
              rows="3"
              class="w-full p-3 text-[14px] border-2 rounded-lg transition-all duration-200"
              :class="[
                'border-gray-200 focus:ring-2 focus:ring-[#2b3c5e] focus:border-[#2b3c5e]'
              ]"
              placeholder="Add special instructions..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Quick Notes -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-[14px] text-gray-600">Quick Notes</h3>
          <button @click="clearNote" 
                  class="text-[12px] text-gray-500 hover:text-gray-700 flex items-center space-x-1">
            <Icon name="mdi:refresh" size="14" />
            <span>Clear</span>
          </button>
        </div>
        
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="quickNote in quickNotes"
            :key="quickNote"
            @click="appendQuickNote(quickNote)"
            class="group p-3 text-[13px] border-2 rounded-lg transition-all duration-200 text-right hover:border-[#2b3c5e] hover:bg-gray-50 flex items-center justify-between"
          >
            <span>{{ quickNote }}</span>
            <Icon name="mdi:plus-circle" 
                  class="opacity-0 group-hover:opacity-100 transition-opacity text-[#2b3c5e]" 
                  size="16" />
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-4">
        <button @click="closeModal"
                class="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center space-x-2 text-[14px] font-medium">
          <Icon name="mdi:close" size="18" />
          <span>Cancel</span>
        </button>
        <button @click="applyNote"
                :disabled="!note.trim()"
                class="flex-1 px-6 py-3 bg-[#2b3c5e] text-white rounded-lg hover:bg-[#22407c] disabled:opacity-50 disabled:hover:bg-[#2b3c5e] transition-all duration-200 flex items-center justify-center space-x-2 text-[14px] font-medium">
          <Icon name="mdi:check" size="18" />
          <span>{{ item?.note ? 'Update' : 'Add' }} Note</span>
        </button>
      </div>
    </div>
  </UModal>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  item: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);
const note = ref('');
const selectedCategory = ref('');

const quickNotes = [
  'بدون بصل',
  'حار زيادة',
  'مستوي كويس',
  'بدون صوص',
];

const noteCategories = [
  { 
    name: 'Cooking',
    notes: ['مستوي كويس', 'متوسط', 'مقرمش', 'خفيف', 'ويل دن']
  },
  { 
    name: 'Spice Level',
    notes: ['حار زيادة', 'حار متوسط', 'خفيف', 'مش حار', 'سبايسي']
  },
  { 
    name: 'Additions',
    notes: ['صوص زيادة', 'جبنة زيادة', 'خضار زيادة', 'بورشن دبل', 'اكستر تشيز']
  },
  { 
    name: 'Removals',
    notes: ['بدون بصل', 'بدون توم', 'بدون صوص', 'بدون زعتر', 'بدون مخلل']
  }
];

const selectCategory = (category) => {
  selectedCategory.value = category.name;
  // Update quick notes based on category
  quickNotes.value = category.notes;
};

const appendQuickNote = (quickNote) => {
  if (note.value) {
    note.value += note.value.endsWith('.') ? ' ' : ', ';
  }
  note.value += quickNote.toLowerCase();
};

const clearNote = () => {
  note.value = '';
};

const applyNote = () => {
  const OrderStore = useOrderStore();
  
  OrderStore.updateItemNote(props.item.id || props.item.order_id, note.value.trim())
  .then(() => {
    push.success('Note updated successfully');
    closeModal();
  })
  .catch(error => {
    push.error('Failed to update note');
    console.error('Error:', error);
  });
};

const removeNote = () => {
  const OrderStore = useOrderStore();
  
  OrderStore.updateItemNote(props.item.id || props.item.order_id, '')
  .then(() => {
    push.success('Note removed successfully');
    closeModal();
  })
  .catch(error => {
    push.error('Failed to remove note');
    console.error('Error:', error);
  });
};

const closeModal = () => {
  emit('update:modelValue', false);
};

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    note.value = props.item?.note || '';
    selectedCategory.value = '';
  }
});

// Add computed properties for safer access
const itemImage = computed(() => {
  return props.item?.product?.image || props.item?.image || '/img/notfound.png';
});

const itemName = computed(() => {
  return props.item?.product?.name || props.item?.name || 'Unknown Item';
});

// في OrderDetails.vue
const openNoteModal = (item) => {
  if (!item) return; // Add validation
  selectedItem.value = item;
  showNoteModal.value = true;
};
</script> 