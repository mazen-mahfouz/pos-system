<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" 
           class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
           @click="closeModal">
        
        <!-- Modal Container -->
        <div class="bg-white rounded-lg w-full max-w-4xl h-[90vh] shadow-xl flex flex-col" 
             @click.stop>
          
             
          <!-- Header -->
          <div class="bg-gradient-to-r from-[#2b3c5e] to-[#1a2744] p-3 rounded-t-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="bg-white/10 p-2 rounded-lg">
                  <Icon name="mdi:call-split" class="text-white" size="16" />
                </div>
                <div>
                  <h2 class="text-white text-lg font-semibold">Split Order #{{ order?.id }}</h2>
                  <p class="text-white/70 text-xs mt-0.5">Drag items between orders to split</p>
                </div>
              </div>
              <button @click="closeModal" 
                      class="text-white/70 hover:text-white transition-colors">
                <Icon name="mdi:close" size="18" />
              </button>
            </div>
          </div>

          <!-- Split Area -->
          <div class="flex-1 flex gap-4 p-4 min-h-0 bg-gray-50/50">
            <!-- Original Order -->
            <div class="flex-1 flex flex-col bg-white rounded-lg border border-gray-100 shadow-sm">
              <div class="p-3 border-b border-gray-100">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <div class="bg-[#2b3c5e]/10 p-1.5 rounded-lg">
                      <Icon name="mdi:receipt" class="text-[#2b3c5e]" size="14" />
                    </div>
                    <h3 class="font-semibold text-[#2b3c5e] text-base">Original Order</h3>
                  </div>
                  <div class="bg-[#2b3c5e]/10 px-2.5 py-1 rounded-lg">
                    <span class="text-xs text-[#2b3c5e] font-medium">
                      {{ originalItems.length }} items
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Draggable Items List -->
              <draggable 
                v-model="originalItems" 
                class="flex-1 p-3 space-y-2 overflow-y-auto scrollbar-thin"
                :group="{ name: 'items', pull: originalItems.length > 1 }"
                item-key="temp_id"
                :animation="200"
                @start="handleDragStart"
                @end="handleDragEnd"
              >
                <template #item="{ element }">
                  <div 
                    class="group bg-white p-2.5 rounded-lg border border-gray-100 cursor-move hover:border-[#2b3c5e] hover:shadow-sm transition-colors duration-200 flex items-center gap-3"
                    :class="{ 'opacity-50': isDragging && draggedItem?.temp_id === element.temp_id }"
                  >
                    <!-- Item Image -->
                    <div class="relative flex-shrink-0">
                      <img 
                        :src="getItemImage(element)" 
                        :alt="getItemName(element)" 
                        class="w-10 h-10 rounded-lg object-cover shadow-sm"
                      >
                      <div class="absolute -top-1.5 -right-1.5 bg-[#2b3c5e] text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-medium shadow-md">
                        {{ element.quantity }}
                      </div>
                    </div>
                    
                    <!-- Item Details -->
                    <div class="flex-1 min-w-0">
                      <h4 class="font-medium text-gray-800 text-sm">{{ getItemName(element) }}</h4>
                      <div class="flex items-center gap-2 mt-0.5">
                        <p class="text-xs text-[#2b3c5e] font-semibold">£{{ formatPrice(getItemPrice(element)) }}</p>
                        <div class="h-3 w-px bg-gray-200"></div>
                      </div>
                    </div>

                    <!-- Drag Handle -->
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-50 p-1.5 rounded-lg">
                      <Icon name="mdi:drag" class="text-gray-400" size="14" />
                    </div>
                  </div>
                </template>
              </draggable>
            </div>

            <!-- Split Order -->
            <div class="flex-1 flex flex-col bg-white rounded-lg border border-gray-100 shadow-sm">
              <!-- Similar header structure as Original Order -->
              <div class="p-3 border-b border-gray-100">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="bg-[#2b3c5e]/10 p-2.5 rounded-lg">
                      <Icon name="mdi:call-split" class="text-[#2b3c5e]" size="16" />
                    </div>
                    <h3 class="font-semibold text-[#2b3c5e] text-base">Split Order</h3>
                  </div>
                  <div class="bg-[#2b3c5e]/10 px-2.5 py-1 rounded-lg">
                    <span class="text-xs text-[#2b3c5e] font-medium">
                      {{ splitItems.length }} items
                    </span>
                  </div>
                </div>
              </div>

              <!-- Similar draggable structure for split items -->
              <draggable 
                v-model="splitItems" 
                class="flex-1 p-3 space-y-2 overflow-y-auto scrollbar-thin"
                :group="{ name: 'items' }"
                item-key="temp_id"
                :animation="200"
                @add="handleItemAdded"
              >
                <template #item="{ element }">
                  <div 
                    class="group bg-white p-2.5 rounded-lg border border-gray-100 cursor-move hover:border-[#2b3c5e] hover:shadow-sm transition-colors duration-200 flex items-center gap-3"
                    :class="{ 'opacity-50': isDragging && draggedItem?.temp_id === element.temp_id }"
                  >
                    <!-- نفس محتوى العنصر كما في الأصل -->
                    <div class="relative flex-shrink-0">
                      <img 
                        :src="getItemImage(element)" 
                        :alt="getItemName(element)" 
                        class="w-10 h-10 rounded-lg object-cover shadow-sm"
                      >
                      <div class="absolute -top-1.5 -right-1.5 bg-[#2b3c5e] text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-medium shadow-md">
                        {{ element.quantity }}
                      </div>
                    </div>
                    
                    <div class="flex-1 min-w-0">
                      <h4 class="font-medium text-gray-800 text-sm">{{ getItemName(element) }}</h4>
                      <div class="flex items-center gap-2 mt-0.5">
                        <p class="text-xs text-[#2b3c5e] font-semibold">£{{ formatPrice(getItemPrice(element)) }}</p>
                        <div class="h-3 w-px bg-gray-200"></div>
                      </div>
                    </div>

               <div class="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-50 p-1.5 rounded-lg">
                      <Icon name="mdi:drag" class="text-gray-400" size="14" />
                    </div>
                  </div>
                </template>
              </draggable>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-4 bg-white rounded-b-lg border-t border-gray-100">
            <div class="flex justify-between items-center">
              <!-- Order Totals -->
              <div class="flex items-center gap-6">
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500 mb-0.5">Original Order Total</span>
                  <div class="text-base font-semibold text-[#2b3c5e]">
                    £{{ formatPrice(calculateTotal(originalItems)) }}
                  </div>
                </div>
                <div class="h-8 w-px bg-gray-200"></div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500 mb-0.5">Split Order Total</span>
                  <div class="text-base font-semibold text-[#2b3c5e]">
                    £{{ formatPrice(calculateTotal(splitItems)) }}
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center space-x-3">
                <button 
                  @click="closeModal"
                  class="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-xs font-medium"
                >
                  Cancel
                </button>
                <button 
                  @click="confirmSplit"
                  class="px-5 py-2 bg-[#2b3c5e] text-white rounded-lg hover:bg-[#1a2744] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 text-xs font-medium flex items-center space-x-1.5 min-w-[120px] justify-center shadow-sm"
                  :disabled="!canSplit || originalItems.length === 0"
                >
                  <Icon name="mdi:check" size="14" />
                  <span>Complete Split</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import draggable from 'vuedraggable';

const props = defineProps({
  modelValue: Boolean,
  order: Object,
});

const emit = defineEmits(['update:modelValue', 'split-complete']);

const originalItems = ref([]);
const splitItems = ref([]);
const isDragging = ref(false);
const draggedItem = ref(null);

watch(() => props.order, (newOrder) => {
  if (newOrder?.items) {
    originalItems.value = newOrder.items.flatMap((item) => {
      const items = [];
      for (let i = 0; i < item.quantity; i++) {
        items.push({
          ...item,
          quantity: 1,
          image: getItemImage(item),
          name: getItemName(item),
          price: getItemPrice(item),
          temp_id: `${item.product_id}-${i}`,
          original_group_id: item.product_id,
        });
      }
      return items;
    });
    splitItems.value = [];
  }
}, { immediate: true });

const formatPrice = (price) => {
  return typeof price === 'number' ? price.toFixed(2) : '0.00';
};

const calculateTotal = (items) => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

const canSplit = computed(() => {
  return splitItems.value.length > 0;
});

const closeModal = () => {
  emit('update:modelValue', false);
};

const handleDragStart = (evt) => {
  isDragging.value = true;
  draggedItem.value = evt.item.__draggable_context.element;
};

const handleDragEnd = () => {
  isDragging.value = false;
  draggedItem.value = null;
};

const handleItemAdded = (evt) => {
  if (evt.added) {
    const addedItem = evt.added.element;
    const index = originalItems.value.findIndex(item => item.temp_id === addedItem.temp_id);
    if (index !== -1) {
      originalItems.value.splice(index, 1);
    }
  }
};

const confirmSplit = () => {
  if (!canSplit.value) return;
  
  const groupOriginalItems = groupItemsByProductId(originalItems.value);
  const groupSplitItems = groupItemsByProductId(splitItems.value);
  
  emit('split-complete', {
    originalItems: groupOriginalItems,
    splitItems: groupSplitItems,
  });
  emit('update:modelValue', false);
};

const groupItemsByProductId = (items) => {
  const groupedItems = items.reduce((acc, item) => {
    const existingItem = acc.find(i => i.product_id === item.product_id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      acc.push({
        product_id: item.product_id,
        quantity: 1
      });
    }
    return acc;
  }, []);
  
  return groupedItems;
};

const getItemImage = (item) => {
  if (item.product?.image) {
    return item.product.image;
  }
  return item.image;
};

const getItemName = (item) => {
  if (item.product?.name) {
    return item.product.name;
  }
  return item.name;
};

const getItemPrice = (item) => {
  if (item.product?.price) {
    return parseFloat(item.product.price);
  }
  return parseFloat(item.price);
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.flip-list-move {
  transition: transform 0.3s ease;
}

.ghost {
  opacity: 0.5;
  @apply bg-[#2b3c5e]/10;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 8px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 4px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style> 