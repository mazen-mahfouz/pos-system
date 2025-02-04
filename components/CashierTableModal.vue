<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 bg-gray-900/60  flex items-center justify-center z-50" @click="close">
        <div class="bg-white rounded-3xl p-4 sm:p-8 w-11/12 sm:w-10/12 md:w-9/12 lg:w-9/12 xl:w-9/12 max-w-4xl max-h-[85vh] overflow-y-auto" @click.stop>
          <div class="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 class="text-lg sm:text-xl xl:text-2xl font-bold text-gray-800">Select Table</h2>
              <p class="text-xs sm:text-sm xl:text-base text-gray-500 mt-1">Choose a table for your guests</p>
            </div>
            <button @click="close" class="text-gray-400 hover:text-gray-600">
              <Icon name="mdi:close" size="20 sm:24" />
            </button>
          </div>            
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4  gap-3 sm:gap-4">
            <button 
              @click="selectTable({ id: null, number: 'Any', capacity: '-', is_free: 1 })" 
              class="table-btn"
            >
              <div class="mb-1 sm:mb-2 p-1 sm:p-2 rounded-full bg-gray-50">
                <Icon 
                  name="mdi:table-plus" 
                  class="text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#2b3c5e]"
                />
              </div>
              <div class="text-sm sm:text-base md:text-lg lg:text-xl font-bold">Any Table</div>
              <div class="mt-1 text-[11px] sm:text-xs md:text-sm text-gray-600">
                Flexible Seating
              </div>
              <div class="mt-1 text-[12px] sm:text-sm md:text-base text-green-600">
                Always Available
              </div>
            </button>

            <button 
              v-for="table in tables" 
              :key="table.id" 
              @click="selectTable(table)" 
              class="table-btn"
              :class="{
                'occupied': table.is_free === 0,
                'available': table.is_free === 1
              }"
            >
              <div class="mb-1 sm:mb-2 p-1 sm:p-2 rounded-full bg-gray-50 transition-all duration-300">
                <Icon 
                  :name="table.is_free === 1 ? 'mdi:table-furniture' : 'mdi:table-lock'" 
                  class="text-lg sm:text-xl md:text-2xl lg:text-3xl"
                  :class="[
                    table.is_free === 1 ? 'text-[#2b3c5e] group-hover:text-white' : 'text-red-500'
                  ]"
                />
              </div>
              <div class="text-sm sm:text-base md:text-lg lg:text-xl font-bold">{{ table.number }}</div>
              <div class="mt-1 text-[11px] sm:text-xs md:text-sm text-gray-600">
                {{ table.capacity }} {{ table.capacity === 1 ? 'Guest' : 'Guests' }}
              </div>
              <div class="mt-1 text-[12px] sm:text-sm md:text-base" 
                  :class="{'text-green-600': table.is_free === 1, 'text-red-600': table.is_free === 0}">
                {{ table.is_free === 0 ? formatDate(table.created_at) : 'Available' }}
              </div>
              <div v-if="table.is_free === 0" class="mt-1 text-[12px] sm:text-sm md:text-base text-gray-500">
                {{ table.waiter }}
              </div>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { format } from 'date-fns';
import HandleReqErrors from "~/helpers/HandleReqErrors.js"
import { useTableStore } from '~/stores/tableStore';

const props = defineProps({
  modelValue: Boolean,
  tables: Array
});

const emit = defineEmits(['update:modelValue', 'select-table']);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, 'EEE, h:mm a');
};

const selectTable = (table) => {
  if (table.is_free === 1) {
    emit('select-table', table);
  }
};

const close = () => {
  emit('update:modelValue', false);
};

const TableStore = useTableStore();

onMounted(() => {
  // تهيئة WebSocket عند تحميل المكون
  TableStore.initializeWebSocket();
  // تحميل البيانات الأولية
  // TableStore.fetchInitialTables();
});

// استخدام tables من الـ store
const tables = computed(() => TableStore.tables);
</script>

<style lang="scss" scoped>
.table-btn {
  @apply flex flex-col items-center justify-center p-4 sm:p-6 bg-white border-2 rounded-xl sm:rounded-2xl transition-all duration-300;
  &.occupied {
    @apply border-red-300 bg-red-50;
  }
  &.available {
    @apply border-green-300 bg-green-50;
  }
  &:hover {
    @apply transform scale-105;
  }
}
</style> 