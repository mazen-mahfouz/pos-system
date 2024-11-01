<template>
  <div class="flex items-center justify-between gap-[10px] bg-[#fff] p-[0px_5px] rounded-[60px] overflow-hidden mt-[10px]">
    <input v-model="searchValue" @input="emitSearch" type="text" placeholder="Search something sweet on your mind ..." class="w-full h-[40px] text-[10px] font-[400] ml-[10px]">
    <div class="bg-[#f7f7f7] rounded-full flex items-center justify-center p-[6px] w-fit">
      <UIcon name="mdi:search" class="text-[#5f5f5f] text-[14px] font-[100]" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const searchValue = ref('');
const emit = defineEmits(['searchChanged']);

const emitSearch = () => {
  emit('searchChanged', searchValue.value);
};
</script>