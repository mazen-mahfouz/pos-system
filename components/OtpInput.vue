<template>
    <div id="otp" class="flex justify-center space-x-2">
      <OtpInput
        v-model="otp"
        :num-inputs="length"
        separator=" "
        input-class="otp-input"
        @on-complete="handleComplete"
      />
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import OtpInput from 'vue3-otp-input'

  const emit = defineEmits(['complete'])
  
  const otp = ref('')
  const length = 4 
  
  const handleComplete = (otpValue) => {
    emit('complete', otpValue)
  }
  </script>
  
  <style>
  #otp input {
    width: 70px;
    height: 70px;
    text-align: center;
    color: #5d5d5da2;
    font-weight: 300;
    font-size: 2rem;
    border: 1px solid rgb(207, 175, 180); /* اللون الرمادي */
    border-radius: 0.375rem;
    background-color: transparent;
    transition: border-color 0.3s ease;
    margin: 0 10px;
  }
  
  #otp input:focus {
    border-color: #6365f124; /* اللون الإرجواني */
    outline: none;
  }
  </style>
  