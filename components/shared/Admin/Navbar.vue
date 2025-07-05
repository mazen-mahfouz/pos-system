<template>
    <div class="w-full rounded-lg flex justify-between p-[10px] shadow-[0px_2px_6px_#c4c4c470]">
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
            <UDropdown :items="items" :ui="{ item: { disabled: 'cursor-text select-text' } }" :popper="{ placement: 'bottom-start' }">
                <div class="bg-[#ffffff] shadow-md p-[5px_8px] lg:p-[6px_10px] xl:p-[8px_12px] flex justify-between items-center rounded-full gap-[10px]">
                    <img src="/assets/img/avatar.png" class="w-[32px] h-[32px] lg:w-[40px] lg:h-[40px] xl:w-[48px] xl:h-[48px] rounded-full" alt="" />
                </div>

                <template #account="{ item }">
                    <div class="text-left">
                        <h1 class="text-[#262626] text-[14px] lg:text-[16px] xl:text-[18px] font-medium">{{ AuthStore?.user?.first_name }} {{ AuthStore?.user?.last_name }}</h1>
                        <p class="truncate font-medium text-[11px] lg:text-[13px] xl:text-[14px] text-gray-900 dark:text-white">
                            {{ AuthStore?.user?.roles?.[0]?.name }}
                        </p>
                    </div>
                </template>

                <template #item="{ item }">
                    <NuxtLink @click="logout(), AuthStore.logout()" class="w-full flex items-center justify-between">
                        <span class="text-[#ff0a0a] text-[13px] font-[400]">{{ item.label }}</span>
                        <UIcon :name="item.icon" class="flex-shrink-0 h-4 w-4 ms-auto text-[#ff1f1f] text-[22px]" />
                    </NuxtLink>
                </template>
            </UDropdown>
        </div>
    </div>
</template>
<script setup>
import HandleReqErrors from "~/helpers/HandleReqErrors.js";

const pageTitle = useState("pageTitle");
const openSidebar = useState("openSidebar");
openSidebar.value = false;

import { useAuthStore } from "~/stores/auth";
import { useCookie, navigateTo } from '#app';

const AuthStore = useAuthStore();

const items = [
    [{
        label: 'ben@example.com',
        slot: 'account',
        disabled: true
    }],
    [{
        label: 'Logout',
        icon: 'mdi:location-exit',
    }]
];

const logout = () => {
  useApi(`logout`, "POST")
    .then(response => {
      push.success(response.message)
      navigateTo('/auth/login')
    })
    .catch(error => {
      HandleReqErrors(error);
    });
};

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