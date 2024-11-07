<template>
  <div class="w-full max-w-[400px] mx-auto space-y-4 bg-white p-6 rounded-xl shadow-lg">
    <!-- Toggle Between Email and OTP -->
    <div class="flex justify-center mb-4">
      <div class="w-full rounded-[12px] p-1 bg-gray-50 shadow-sm" role="group">
        <button
          v-for="method in ['email', 'otp']"
          :key="method"
          @click="loginMethod = method"
          :class="[ 
            'w-[50%] px-4 py-2 text-xs font-medium transition-all duration-300 rounded-lg',
            loginMethod === method
              ? 'bg-[#2b365a] text-white shadow-md transform scale-[1.02]'
              : 'bg-transparent text-gray-600 hover:bg-gray-100'
          ]"
        >
          <div class="flex items-center justify-center space-x-1.5">
            <Icon :name="method === 'email' ? 'mdi:email' : 'mdi:message-lock'" size="14" />
            <span>{{ method === 'email' ? 'Email Login' : 'Code Login' }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Form Section -->
    <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors }">
      <div v-if="loginMethod === 'email'" class="space-y-4">
        <!-- Email Input -->
        <div class="space-y-1.5">
          <label for="email" class="block text-xs font-medium text-gray-700">
            Email Address
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="material-symbols:person-2" class="text-gray-400" size="16" />
            </div>
            <Field
              name="email"
              type="email"
              autocomplete="email"
              required
              class="block w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b365a] focus:border-[#2b365a] transition-all duration-200"
              :class="{ 'border-red-300 ring-red-200': errors.email }"
              placeholder="Enter your email"
            />
          </div>
          <ErrorMessage name="email" class="text-red-500 text-xs mt-1" />
        </div>

        <!-- Password Input -->
        <div class="space-y-1.5">
          <label for="password" class="block text-xs font-medium text-gray-700">
            Password
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="solar:lock-password-bold" class="text-gray-400" size="16" />
            </div>
            <Field
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="block w-full pl-9 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b365a] focus:border-[#2b365a] transition-all duration-200"
              :class="{ 'border-red-300 ring-red-200': errors.password }"
              placeholder="Enter your password"
            />
          </div>
          <ErrorMessage name="password" class="text-red-500 text-[10px] mt-1" />
        </div>
      </div>

      <!-- OTP Input -->
      <div v-else class="space-y-4">
        <div class="bg-gray-50 p-4 rounded-xl">
          <div class="text-center mb-4">
            <h3 class="text-base font-semibold text-gray-800">Enter Code</h3>
            <p class="text-xs text-gray-500 mt-1">Please enter the 4-digit code sent to your device</p>
          </div>
          <div class="flex justify-center gap-2">
            <input
              v-for="(digit, index) in 4"
              :key="index"
              v-model="otpDigits[index]"
              type="text"
              maxlength="1"
              class="w-[45px] h-[45px] text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b365a] focus:border-[#2b365a] transition-all duration-300 bg-white shadow-sm"
              :class="{ 'border-[#2b365a] bg-[#f8faff] transform scale-[1.05]': otpDigits[index] }"
              @input="onOtpInput(index)"
              @keydown="onOtpKeydown($event, index)"
            />
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="mt-6">
        <button
          type="submit"
          class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2b365a] hover:bg-[#22407c] transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b365a]"
        >
          <div class="flex items-center space-x-1.5">
            <Icon :name="loginMethod === 'email' ? 'mdi:login' : 'mdi:message-lock'" size="16" />
            <span>{{ loginMethod === 'email' ? 'Sign in' : 'Send Code' }}</span>
          </div>
        </button>
      </div>
    </Form>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'auth',
})

import { ref, computed } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { object, string } from 'yup'
import HandleReqErrors from "~/helpers/HandleReqErrors.js";
import { useAuthStore } from "~/stores/auth";

const router = useRouter();
const AuthStore = useAuthStore();

const loginMethod = ref('otp')
const otpDigits = ref(Array(4).fill(''))

const schema = computed(() => {
  if (loginMethod.value === 'email') {
    return object({
      email: string().required('Email is required').email('Invalid email format'),
      password: string().required('Password is required').min(8, 'Password must be at least 8 characters'),
    })
  } else {
    return object({})
  }
})

const onSubmit = (values) => {
  let formattedQuery = {}

  if (loginMethod.value === 'email') {
    formattedQuery = {
      email: values.email,
      password: values.password
    }
  } else {
    formattedQuery = {
      login_code: otpDigits.value.join('')
    }
  }

  useApi(`login`, "POST", {
    type: 'object',
    data: formattedQuery
  })
  .then(response => {
    // Prepare user data by excluding roles array to avoid cookie size issues
    const userDataForCookie = {
      first_name: response.user.first_name,
      last_name: response.user.last_name,
      username: response.user.username,
      id: response.user.id,
      shift: response.user.shift,
      role: response.user.roles[0]?.name // Just store the role name
    };
    
    const userData = useCookie("PosUserData", {
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    const userToken = useCookie("PosUserToken", {
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    
    userData.value = userDataForCookie; // Store simplified user data
    userToken.value = response.access_token;

    AuthStore.setToken(`Bearer ${response.access_token}`);
    AuthStore.setUser(response.user); // Store full user object in store
    push.success(response.message);
    
    // Fix typo in requestFullscreea
    if(response.user?.roles[0]?.name === 'cashier') {
      router.push('/cashier').then(() => requestFullscreen());
    } else if(response.user?.roles[0]?.name === 'Admin') {
      router.push('/cashier').then(() => requestFullscreen()); // Fixed typo
    } else if(response.user?.roles[0]?.name === 'waiter') {
      router.push('/waiter');
    } else {
      router.push('/');
    }
  })
  .catch(error => {
    console.log(error)
    HandleReqErrors(error);
  });
}

const requestFullscreen = () => {
  try {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) { // Safari
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) { // IE11
      document.documentElement.msRequestFullscreen();
    }
  } catch (error) {
    console.log('Fullscreen request failed:', error);
  }
}

const onOtpInput = (index) => {
  // Ensure only numbers are entered
  otpDigits.value[index] = otpDigits.value[index].replace(/[^0-9]/g, '');
  
  if (otpDigits.value[index].length === 1 && index < 3) {
    // Move to next input
    document.querySelectorAll('input')[index + 1]?.focus();
  }
  
  // If all digits are filled, submit automatically
  if (otpDigits.value.every(digit => digit !== '')) {
    onSubmit({ login_code: otpDigits.value.join('') });
  }
}

const onOtpKeydown = (event, index) => {
  if (event.key === 'Backspace' && index > 0 && otpDigits.value[index] === '') {
    document.querySelectorAll('input')[index - 1].focus()
  }
}
</script>
