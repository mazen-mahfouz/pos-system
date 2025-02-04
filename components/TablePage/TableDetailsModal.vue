<template>
    <UModal v-model="isOpen" :ui="{
      overlay: { background: 'bg-gray-900/60' },
      width: 'sm:max-w-[600px]',
      height: 'auto',
      padding: 'p-0',
      background: 'bg-white dark:bg-gray-900',
      rounded: 'rounded-xl'
    }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100' }">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-semibold text-gray-900">Table {{ table.number }} Details</h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="closeModal" />
          </div>
        </template>
        <div class="p-4 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">Capacity</p>
              <p class="text-base font-medium text-gray-900">{{ table.capacity }} persons</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Status</p>
              <UBadge :color="table.isAvailable ? 'green' : 'red'" class="mt-1">
                {{ table.isAvailable ? 'Available' : 'Occupied' }}
              </UBadge>
            </div>
          </div>
          <div v-if="!table.isAvailable">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">Guest</p>
                <p class="text-base font-medium text-gray-900">{{ table.guest }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Check-in Time</p>
                <p class="text-base font-medium text-gray-900">{{ table.checkInTime }}</p>
              </div>
            </div>
            <div class="mt-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-3">Order Details</h4>
              <ul class="divide-y divide-gray-100">
                <li v-for="(item, index) in table.orderItems" :key="index" class="py-3 flex justify-between">
                  <span class="text-sm font-medium text-gray-900">{{ item.name }}</span>
                  <span class="text-sm text-gray-500">${{ item.price.toFixed(2) }}</span>
                </li>
              </ul>
              <div class="mt-4 flex justify-between items-center font-medium">
                <span class="text-base text-gray-900">Total</span>
                <span class="text-lg text-gray-900">${{ calculateTotal(table.orderItems).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
        <template #footer>
          <div class="flex justify-end">
            <UButton color="gray" @click="closeModal">Close</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </template>
  
  <script setup>
  const props = defineProps({
    table: {
      type: Object,
      required: true
    },
    modelValue: {
      type: Boolean,
      default: false
    }
  })
  
  const emit = defineEmits(['update:modelValue'])
  
  const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  
  const closeModal = () => {
    isOpen.value = false
  }
  
  const calculateTotal = (items) => {
    return items.reduce((total, item) => total + item.price, 0)
  }
  </script>