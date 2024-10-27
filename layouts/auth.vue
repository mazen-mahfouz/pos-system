<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
    <div class="text-center mb-8">
      <h1 class="text-[12px] font-[500] text-[#757575] mb-1">Welcome Back</h1>
      <h1 class="text-[30px] font-[500] text-[#2b365a] mb-2">Suger Rush</h1>

    </div>
    
    <div class="w-full max-w-md">
      <NuxtPage></NuxtPage>
    </div>

    <Notivue v-slot="item">
      <Notification :item="item" :theme="darkTheme" />
    </Notivue>
  </div>
</template>

<script setup>
// No additional logic needed for the layout
</script>
