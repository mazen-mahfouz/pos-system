<template>
  <div class="w-full rounded-lg flex justify-between p-2 ">
    <div class="flex items-center justify-between gap-[10px]">
      <UDropdown :items="items" :ui="{ item: { disabled: 'cursor-text select-text' } }" :popper="{ placement: 'bottom-start' }">
        <img src="/assets/img/avatar.png" class="w-[32px] h-[32px] mx-[10px] rounded-full" />

        <template #account="{ item }">
          <div class="text-left">
            <h1 class="text-[#262626] text-[14px] font-medium">{{ AuthStore?.user?.first_name }} {{ AuthStore?.user?.last_name }}</h1>
            <p class="truncate font-medium text-[11px] text-gray-900 dark:text-white">
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
      <div class="flex items-center gap-[5px]">
        <div class="bg-[#ffffff] shadow-md p-[5px_8px] pr-[18px] flex justify-between items-center rounded-full gap-[10px]">
          <div class="bg-[#f5f9ff] p-[4px] flex justify-center items-center rounded-full">
            <Icon name="material-symbols:calendar-month-outline-rounded" class="text-[#6b9bfa] text-[15px]" />
          </div>
          <h1 class="text-[#040404] text-[10px] font-[500]">{{ formattedDate }}</h1>
        </div>
        <span class="text-[20px] text-[#6d6d6d]">-</span>
        <div class="bg-[#ffffff] shadow-md p-[5px_8px] pr-[18px] flex justify-between items-center rounded-full gap-[10px]">
          <div class="bg-[#f5f9ff] p-[4px] flex justify-center items-center rounded-full">
            <Icon name="bi:clock" class="text-[#6b9bfa] text-[13px]" />
          </div>
          <h1 class="text-[#040404] text-[11px] font-[500]">{{ formattedTime }}</h1>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-[10px]">
      <div @click="openOrdersModal" class="bg-[#ffffff] shadow-md p-[4px_10px] cursor-pointer transition duration-200 ease-in hover:bg-[#f2f2f2] flex justify-between items-center rounded-full gap-[10px]">
        <div class="flex items-center justify-between gap-[10px]" >
          <div class="bg-[#f5f9ff] p-[3px] flex justify-center items-center rounded-full">
            <Icon name="line-md:list" class="text-[#1e8370] text-[15px]" />
          </div>
          <h1 class="text-[#040404] text-[10px] font-[600]">Open Orders</h1>
        </div>
      </div>
      <div @click="openNewOrder" class="bg-[#1ca84f] shadow-md p-[4px_10px] cursor-pointer transition duration-200 ease-in hover:bg-[#299751] flex justify-between items-center rounded-full gap-[10px]">
        <div class="flex items-center justify-between gap-[10px]" >
        <div class="bg-[#f1f6ff] p-[3px] flex justify-center items-center rounded-full">
          <Icon name="i-heroicons-plus" class="text-[#125b2d] text-[13px]" />
        </div>          
        <h1 class="text-[#fff] text-[10px] font-[600]">New order</h1>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import HandleReqErrors from "~/helpers/HandleReqErrors.js";
import { useOrderStore } from '~/stores/orderStore';
import { inject, ref, onMounted } from 'vue';
import { useAuthStore } from "~/stores/auth";


const OrderStore = useOrderStore();
const openNewOrderModal = inject('openNewOrderModal');
const openOrdersModal = inject('openOrdersModal');
const AuthStore = useAuthStore()

const openNewOrder = () => {
  console.log(OrderStore.$state.openOrder)
  if(OrderStore.$state.openOrder){
    push.error('There is an open order now.');
  }else{
    openNewOrderModal();
  }
};

const openOrders = () => {
  console.log(OrderStore.$state.openOrder)
  if(OrderStore.$state.openOrder){
    push.error('There is an open order now.');
  }else{
    openOrdersModal();
  }
};

const items = [
  [{
      label: 'ben@example.com',
      slot: 'account',
      disabled: true
  }],
  [{
      label: 'Logout',
      icon: 'mdi:location-exit',
      link: '/auth/login'
  }]
]
const open = ref(false)

const pageTitle = useState("pageTitle");
const openSidebar = useState("openSidebar");
openSidebar.value = false;
const router = useRouter();


const formattedDate = ref('');
const formattedTime = ref('');

const logout = () => {
  useApi(`logout`, "POST")
    .then(response => {
      push.success(response.message)
      router.push('/auth/login')
    })
    .catch(error => {
      HandleReqErrors(error);
    });
};

// Format date and time
const formatDate = () => {
  const today = new Date();
  const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  formattedDate.value = today.toLocaleDateString('en-GB', dateOptions).replace(',', '');

  const hours = today.getHours();
  const minutes = today.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';

  // Format time in hh:mm format with AM/PM
  const formattedHours = hours % 12 || 12; // Converts 0 to 12 for 12 AM/PM
  formattedTime.value = `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const toggleSidebar = () => {
  openSidebar.value = !openSidebar.value;
};

onMounted(() => {
  formatDate();
});
</script>

<style lang="">
</style>