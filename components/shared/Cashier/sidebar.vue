<template>
  <div>
      <transition name="fade">
          <div v-if="openSidebar" class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50" @click="closeSidebar"></div>
      </transition>
      <transition name="slide">
          <div :class="['flex flex-col gap-[20px] transition-transform duration-300 ease-in-out z-[99] absolute top-0 left-0 min-w-[300px] bg-white h-screen', { 'transform translate-x-0': openSidebar, 'transform -translate-x-full': !openSidebar }]">
              <div class="w-full p-[15px_10px] flex gap-[10px] justify-between items-center shadow-md">
                  <UDropdown v-model:open="open" :items="items" :ui="{  width: 'w-48',  container: '!inset-[0px_auto_auto_25px]', item: { disabled: 'cursor-text select-text' } }" :popper="{ placement: 'bottom-start' }">
                  <div class="bg-[#f7f7f7] p-[7px_20px] flex justify-between items-center rounded-full gap-[15px]">
                      <div class="flex justify-center items-center rounded-full">
                          <img src="/assets/img/avatar.png" class="w-[38px] h-[38px] rounded-full"  alt="" />
                      </div>
                      <h1 class="text-[#040404] text-[14px] font-[400] flex gap-[20px] items-center">
                          <div>
                            <h1 class="text-[#262626] text-[14px] font-medium">{{ AuthStore?.user?.first_name }} {{ AuthStore?.user?.last_name }}</h1>
                            <span class="text-[#7e7e7e] text-[13px]">{{ AuthStore?.user?.roles?.[0]?.name }}</span>
                          </div>
                          <Icon name="material-symbols:keyboard-arrow-down" class="text-[18px] mt-[4px] box-border rounded-full" />
                      </h1>
                  </div>                
                  <template #item="{ item }">
                      <NuxtLink @click="logout(), AuthStore.logout()" class="w-full flex items-center justify-between">
                          <span class="text-[#ff0a0a] text-[13px] font-[400]">{{ item.label }}</span>
                          <UIcon :name="item.icon" class="flex-shrink-0 h-4 w-4 ms-auto text-[#ff1f1f] text-[22px]" />
                      </NuxtLink>
                  </template>
                  </UDropdown>
                  <div class="bg-[#fff5f5] p-[5px_15px] h-[100%] flex justify-between items-center rounded-full" @click="closeSidebar">
                    <UIcon name="mdi:close" class="text-[#fc4c4c] text-[25px] font-[100]" />                  
                  </div>
              </div>
              <div class="flex flex-col gap-[10px]">
                <nuxt-link v-for="link in navLinks" :key="link.path" :to="link.path" class="my-link flex items-center gap-[15px] p-3 bg-white hover:bg-[#f0f5ff] text-left transition duration-300 ease-in-out">
                  <div class="bg-[#f7f7f7] rounded-full flex items-center justify-center p-[10px]">
                    <UIcon :name="link.icon" class="text-[#919191] text-[22px] font-[100]" />                  
                  </div>
                  <span class="text-[#0a0a0a] font-[400] text-[15px]">{{link.name}}</span>
                </nuxt-link>
              </div>
              <!-- <div data-v-3c766150="" class="bg-[#030b1ce7] w-full p-[12px] absolute bottom-0  flex justify-center items-center text-[10px] font-[00] w-full text-[#eeeeee] text-center !block" style="display: none;">
                <p data-v-3c766150="" class="leading-5 max-w-[280px] m-auto rounded-[20px_20px_20px_0px]">
                  © 2024 pos system, All rights reserved. | Powered by 
                  <span data-v-3c766150="" class="text-[#5599f9]">{</span> 
                    <a data-v-3c766150="" href="https://api.whatsapp.com/send/?phone=201099634244&amp;text&amp;type=phone_number&amp;app_absent=0">Ahmed Mahfouz</a> 
                    , <a data-v-3c766150="" href="https://api.whatsapp.com/send/?phone=201097266969&amp;text&amp;type=phone_number&amp;app_absent=0">Mazen Mahfouz</a> 
                    <span data-v-3c766150="" class="text-[#5599f9]">}</span>
                </p>
              </div> -->

          </div>
      </transition>
  </div>
</template>

<script setup>
import HandleReqErrors from "~/helpers/HandleReqErrors.js";
import { useAuthStore } from "~/stores/auth";

const openSidebar = useState("openSidebar");

const AuthStore = useAuthStore()
const router = useRouter();

const items = [
  [{
    label: 'Logout',
    icon: 'mdi:location-exit',
    link: '/auth/login'
  }]
]
const open = ref(false)


const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    }
});

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

const emit = defineEmits();

const navLinks = [
    { name: 'Cashier', path: '/cashier', icon: 'mdi:cash-register' },
];

const closeSidebar = () => {
    openSidebar.value = false;
};

watch(openSidebar, (newValue) => {
    emit('update:modelValue', newValue);
});
</script>

<style scoped>
.router-link-active {
  @apply bg-[#1d59cf];
  span{
    @apply text-[#fff];
  }
  div{
    background-color: #2d71f8;
    span{
      color: white;
    }
  }
}
.router-link-active:hover {
    @apply bg-[#1d59cf];
    span{
    @apply text-[#ffffff];
  }
  div{
    background-color: #2d71f8;
    span{
      color: white;
    }
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease-in-out;
}
.slide-enter, .slide-leave-to {
  transform: translateX(-100%);
}
</style>