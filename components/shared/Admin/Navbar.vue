<template>
    <div class="w-full rounded-lg flex justify-between py-[10px] shadow-[0px_2px_6px_#c4c4c470]">
        <div class="flex items-center justify-between gap-[30px]">
            <div @click="openSidebar = !openSidebar" class="bg-[#f8f8f8] p-[10px] flex justify-center items-center cursor-pointer rounded-full">
                <Icon name="humbleicons:align-text-justify" class="text-[#2d71f8] text-[28px]" />
            </div>
            <div class="flex items-center gap-[5px]">
                <h1 class="text-[#040404] text-[22px] font-[500]">Admin</h1>
                <h1 class="text-[#8d8d8d] text-[15px] mt-[4px]">{{ pageTitle }}</h1>
            </div>
        </div>
        <div class="flex items-center gap-[10px]">
            <div class="bg-[#f8f8f8] p-[5px_20px] flex justify-between items-center rounded-full gap-[15px]">
                <h1 class="text-[#040404] text-[13px] font-[400]">{{ formattedDate }}</h1>
                <div class="bg-[#f5f9ff] p-[5px] flex justify-center items-center rounded-full">
                    <Icon name="material-symbols:calendar-month-outline-rounded" class="text-[#6b9bfa] text-[20px]" />
                </div>
            </div>
            <UDropdown v-model:open="open" :items="items" :ui="{  width: 'w-48',  container: '!inset-[0px_auto_auto_25px]', item: { disabled: 'cursor-text select-text' } }" :popper="{ placement: 'bottom-start' }">
                <div class="bg-[#f8f8f8] p-[5px_20px] flex justify-between items-center rounded-full gap-[15px]">
                    <div class="flex justify-center items-center rounded-full">
                        <img src="/assets/img/avatar.jpg" class="w-[35px] h-[35px] rounded-full"  alt="" />
                    </div>
                    <h1 class="text-[#040404] text-[14px] font-[400] flex gap-[10px]">Mazen mahfouz
                        <Icon name="material-symbols:keyboard-arrow-down" class="text-[18px] mt-[4px]" />
                    </h1>
                </div>                
                <template #item="{ item }">
                    <span class="text-[#ff0a0a] text-[13px] font-[400]">{{ item.label }}</span>
                    <UIcon :name="item.icon" class="flex-shrink-0 h-4 w-4 ms-auto text-[#ff1f1f] text-[22px]" />
                </template>
            </UDropdown>
        </div>
    </div>
</template>
<script setup>

const pageTitle = useState("pageTitle");
const openSidebar = useState("openSidebar");
openSidebar.value = false;

const items = [
  [{
    label: 'Logout',
    icon: 'mdi:location-exit'
  }]
]
const open = ref(false)

const formattedDate = ref('');
const formatDate = () => {
const today = new Date();
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    formattedDate.value = today.toLocaleDateString('en-GB', options).replace(',', '');
};
onMounted(() => {
  formatDate();
});



</script>
<style lang="">
    
</style>