<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50" @click="close">
        <div class="bg-white rounded-3xl p-8 w-10/12 lg:w-11/12 max-w-4xl max-h-[85vh] overflow-y-auto" @click.stop>
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl xl:text-[24px] font-bold text-gray-800">Change Table</h2>
              <p class="text-sm xl:text-[18px] text-gray-500 mt-1">Select a new table for the order</p>
            </div>
            <button @click="close" class="text-gray-400 hover:text-gray-600">
              <Icon name="mdi:close" size="24" />
            </button>
          </div>            
          <div class="grid grid-cols-3 md:grid-cols-4 gap-4">
            <button 
              v-for="table in tables" 
              :key="table.id" 
              @click="updateTable(table)" 
              class="table-btn"
              :class="{
                'occupied': table.is_free === 0,
                'available': table.is_free === 1,
                'selected': table.id === currentTable
              }"
            >
              <div class="mb-1 sm:mb-2 md:mb-3 p-1 sm:p-2 md:p-2 rounded-full bg-gray-50 transition-all duration-300">
                <Icon 
                  :name="table.is_free === 1 ? 'mdi:table-furniture' : 'mdi:table-lock'" 
                  class="text-xl md:text-2xl lg:text-[34px]"
                  :class="[
                    table.is_free === 1 ? 'text-[#2b3c5e] group-hover:text-white' : 'text-red-500'
                  ]"
                />
              </div>
              <div class="md:text-[16px] lg:text-[18px] xl:text-xl font-bold">{{ table.number }}</div>
              <div class="mt-1 sm:mt-2 text-[13px] lg:text-[15px] text-gray-600">
                {{ table.capacity }} {{ table.capacity === 1 ? 'Guest' : 'Guests' }}
              </div>
              <div class="mt-1 sm:mt-2 text-[14px] lg:text-md" 
                  :class="{'text-green-600': table.is_free === 1, 'text-red-600': table.is_free === 0}">
                {{ table.is_free === 0 ? formatDate(table.created_at) : 'Available' }}
              </div>
              <div v-if="table.is_free === 0" class="mt-1 text-[14px] lg:text-lg text-gray-500">
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

const props = defineProps({
  modelValue: Boolean,
  tables: Array,
  currentTable: [Number, String]
});

const emit = defineEmits(['update:modelValue', 'update-table']);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, 'EEE, h:mm a');
};

const updateTable = (table) => {
  if (table.is_free === 1) {
    emit('update-table', table);
    emit('update:modelValue', false);
  }
};

const close = () => {
  emit('update:modelValue', false);
};

const tables = ref([]);

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    useApi('tables', 'GET')
      .then(response => {
        tables.value = response;
      })
      .catch(error => {
        HandleReqErrors(error);
      });
  }
});
</script>

<style lang="scss" scoped>
.table-btn {
  @apply flex flex-col items-center justify-center p-6 bg-white border-2 rounded-2xl transition-all duration-300;
  &.occupied {
    @apply border-red-300 bg-red-50;
  }
  &.available {
    @apply border-green-300 bg-green-50;
  }
  &.selected {
    @apply border-blue-500 bg-blue-50;
  }
  &:hover {
    @apply transform scale-105;
  }
}
</style> 