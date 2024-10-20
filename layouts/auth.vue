<template>
    <div class="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      <!-- Left side with the image -->
      <div class="lg:w-[50%] text-white p-12 hidden lg:flex flex-col justify-center relative">
        <img
          src="/assets/img/login-background.jpg"
          class="object-cover w-full h-full absolute top-0 left-0"
        />
        <!-- Overlay Layer -->
        <div class="absolute top-0 left-0 w-full h-full bg-black/50"></div>
            <div class="lg:max-w-2xl mx-auto z-[10] relative">
                <h1 class="text-[45px] font-bold mb-3">Welcome Back</h1>
                <p class="text-xl mb-8">Sign in to your account to continue your journey with us.</p>
            </div>
      </div>
      
      <!-- Right side with the form -->
      <div class="lg:w-[50%] h-screen lg:h-auto p-8 lg:p-12 flex items-center justify-center">
        <div class="w-full max-w-md">
          <NuxtPage></NuxtPage>
        </div>
      </div>
      <Notivue v-slot="item">
          <Notification :item="item" :theme="darkTheme" />
      </Notivue>
    </div>
  </template>
  
  <script setup>
  // No additional logic needed for the layout
  </script>
  