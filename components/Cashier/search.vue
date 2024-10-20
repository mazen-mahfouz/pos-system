<template>
  <div class="flex items-center justify-between gap-[10px] bg-[#fff] p-[0px_10px] rounded-[60px] overflow-hidden mt-[15px]">
    <input v-model="searchValue" @input="emitSearch" type="text" placeholder="Search something sweet on your mind ..." class="w-full h-[50px] text-[12px] font-[400] ml-[10px]">
    <div class="bg-[#f7f7f7] rounded-full flex items-center justify-center p-[8px] w-fit">
      <UIcon name="mdi:search" class="text-[#5f5f5f] text-[18px] font-[100]" />
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