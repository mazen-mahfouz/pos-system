<template>
    <div class="overflow-hidden flex justify-between flex-col transition-width duration-200 ease-in" :class="{ 'w-0': !openSidebar, 'w-[200px]': openSidebar }">
        <div class="flex flex-col gap-[10px] w-[176px]">
            <nuxt-link v-for="link in navLinks" :key="link.path" :to="link.path" class="my-link p-[12px_15px] bg-[#ffffff] hover:bg-[#eaeaea] text-start rounded-lg transition duration-300 ease-in-out">
                <span class="text-[#040404] font-[400] text-[14px]">{{link.name}}</span>
            </nuxt-link>
        </div>
        <div>
          {{ openSidebar }}
        </div>
    </div>
</template>

<script setup>

const pageTitle = useState("pageTitle");
const openSidebar = useState("openSidebar");

const navLinks = [
  { name: 'Home', path: '/admin' },
  { name: 'Items', path: '/admin/items' },
  { name: 'Tables', path: '/admin/table' },
  { name: 'Orders History', path: '/admin/order-history' },
  { name: 'Coupons', path: '/admin/coupons' },

];


</script>
<style scoped>
.router-link-active {
  @apply bg-[#2d71f8];
  span{
    @apply text-[#fff];
  }
}
.router-link-active:hover {
    @apply bg-[#1d59cf];
}
</style>