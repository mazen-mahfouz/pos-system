<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
    <div class="text-center mb-6 transform hover:scale-[1.02] transition-all duration-300">
      <!-- <div class="bg-white p-3 rounded-xl shadow-sm inline-block mb-3">
        <img src="/assets/img/logo.svg" alt="Sugar Rush" class="h-12 w-auto" />
      </div> -->
      <h1 class="text-[12px] font-medium text-gray-500 mb-1">Welcome Back to</h1>
      <h1 class="text-[24px] font-bold text-[#2b365a]">Sugar Rush</h1>
    </div>
    
    <div class="w-full max-w-sm animate-fadeIn">
      <NuxtPage></NuxtPage>
    </div>

    <Notivue v-slot="item">
      <Notification :item="item" :theme="darkTheme" />
    </Notivue>
  </div>
</template>

<style>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}
</style>

<script setup>
// No additional logic needed for the layout
</script>
