<template>
  <div class="min-h-screen bg-gradient-to-tr from-blue-50 via-blue-100/50 to-blue-50">
    <!-- Top Logo -->
    <div class="absolute top-10 left-16 z-10">
      <img src="/img/logo.png" alt="Miresto" class="w-40 animate-float" />
    </div>
    
    <div class="min-h-screen flex">
      <!-- Left Section - Brand -->
      <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 to-blue-700 items-center justify-center relative overflow-hidden">
        <div class="absolute inset-0 bg-pattern opacity-10"></div>
        <div class="relative z-10 text-white text-center p-12 transform transition-transform duration-500">
          <h2 class="text-5xl font-bold mb-6 tracking-tight">Maresto POS</h2>
          <p class="text-xl text-blue-100 font-light">Your Recipe for Success!</p>
          <div class="mt-12 space-y-4">
            <div class="flex items-center justify-center space-x-3 text-blue-100">
              <Icon name="material-symbols:speed" size="24" />
              <span>Lightning Fast Performance</span>
            </div>
            <div class="flex items-center justify-center space-x-3 text-blue-100">
              <Icon name="material-symbols:security" size="24" />
              <span>Enterprise-Grade Security</span>
            </div>
            <div class="flex items-center justify-center space-x-3 text-blue-100">
              <Icon name="material-symbols:analytics" size="24" />
              <span>Advanced Analytics</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right Section - Content -->
      <div class="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div class="w-full max-w-md">
          <div class="bg-white/90 rounded-3xl shadow-2xl p-8">
            <NuxtPage />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

.bg-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E");
  background-size: 30px 30px;
}
</style>

<script setup>
// No additional logic needed for the layout
</script>
