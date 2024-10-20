<template>
    <div class="admin p-[10px] flex gap-[40px] flex-col">
        <SharedAdminNavbar />
        <div class="flex w-full h-screen">
            <SharedAdminSidebar />
            <main class="rounded-lg transition-width duration-200 ease-in" :class="{ 'w-[100%]': !openSidebar, 'w-[calc(100%_-_200px)]': openSidebar }">
                <NuxtPage></NuxtPage>
            </main>
        </div>
        <Notivue v-slot="item">
            <Notification :item="item" :theme="darkTheme" />
        </Notivue>
    </div>
</template>
<script setup>
const openSidebar = useState("openSidebar");

</script>
<style lang="">
    
</style>