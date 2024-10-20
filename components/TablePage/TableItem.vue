<template>
    <div
    @click="$emit('click', table)"
    class="p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-md flex flex-col items-center justify-center"
      :class="[
        table.isAvailable ? 'border-[#ceffe0]' : 'border-[#ffdfdf]',
        'bg-white'
      ]"
    >
      <h2 class="text-xl font-semibold mb-2">Table {{ table.number }}</h2>
      <p class="text-gray-600">Capacity: {{ table.capacity }}</p>
      <p :class="table.isAvailable ? 'text-green-700' : 'text-red-700'" class="font-medium mt-2">
        {{ table.isAvailable ? 'Available' : 'Occupied' }}
      </p>
      <p v-if="!table.isAvailable" class="text-sm text-gray-500 mt-1">{{ table.guest }}</p>
    </div>
  </template>
  
  <script setup>
  defineProps({
    table: {
      type: Object,
      required: true
    }
  })
  </script>