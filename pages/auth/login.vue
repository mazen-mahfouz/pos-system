<template>
  <div class="w-full max-w-sm mx-auto space-y-6">
    <!-- Brand Section -->
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">Welcome Back!</h2>
      <p class="text-sm text-gray-500 mt-1">Access your POS dashboard securely</p>
    </div>

    <!-- Login Method Switcher -->
    <div class="bg-blue-50/50 p-1.5 rounded-xl">
      <div class="relative flex rounded-lg p-0.5 bg-white shadow">
        <button
          v-for="method in ['email', 'otp']"
          :key="method"
          @click="loginMethod = method"
          class="relative flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium transition-all duration-300"
          :class="[
            loginMethod === method 
              ? 'text-white z-10' 
              : 'text-gray-600'
          ]"
        >
          <div class="flex items-center space-x-2">
            <Icon :name="method === 'email' ? 'mdi:email' : 'mdi:message-lock'" size="18" />
            <span>{{ method === 'email' ? 'Email Login' : 'Code Login' }}</span>
          </div>
        </button>
        <!-- Animated Background -->
        <div
          class="absolute inset-y-0.5 w-1/2 bg-gradient-to-r from-blue-500 to-blue-700 rounded-md transition-all duration-300"
          :class="loginMethod === 'email' ? 'left-0.5' : 'left-[50%]'"
        ></div>
      </div>
    </div>

    <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors }" class="space-y-4">
      <div v-if="loginMethod === 'email'" class="space-y-4">
        <div class="space-y-1">
          <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Icon name="material-symbols:person-2" size="20" />
            </div>
            <Field
              name="email"
              type="email"
              autocomplete="email"
              required
              class="block w-full pl-10 pr-3 py-2.5 text-gray-700 bg-gray-50/50 border border-gray-200 rounded-lg focus:bg-white focus:border-sky-400 transition-colors duration-200"
              :class="{ 'border-red-300': errors.email }"
              placeholder="Enter your email"
            />
          </div>
          <ErrorMessage name="email" class="text-red-500 text-xs mt-1" />
        </div>

        <div class="space-y-1">
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Icon name="solar:lock-password-bold" size="20" />
            </div>
            <Field
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="block w-full pl-10 pr-3 py-2.5 text-gray-700 bg-gray-50/50 border border-gray-200 rounded-lg focus:bg-white focus:border-sky-400 transition-colors duration-200"
              :class="{ 'border-red-300': errors.password }"
              placeholder="Enter your password"
            />
          </div>
          <ErrorMessage name="password" class="text-red-500 text-xs mt-1" />
        </div>
      </div>

      <div v-else class="space-y-6">
        <div class="bg-sky-50/50 p-6 rounded-xl">
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
              @paste="handlePaste"
              class="w-[45px] h-[45px] text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b365a] focus:border-[#2b365a] transition-all duration-300 bg-white shadow-sm"
              :class="{ 'border-[#2b365a] bg-[#f8faff] transform scale-[1.05]': otpDigits[index] }"
              @input="onOtpInput(index)"
              @keydown="onOtpKeydown($event, index)"
              style="-webkit-text-security: disc;"
            />
          </div>

          <div class="mt-6 grid grid-cols-3 gap-2">
            <button
              v-for="n in 9"
              :key="n"
              type="button"
              @click="appendDigit(n)"
              class="w-full h-12 rounded-lg bg-white border-2 border-gray-200 text-gray-700 font-semibold text-lg hover:bg-[#f8faff] hover:border-[#2b365a] hover:scale-[1.02] transition-all duration-300 shadow-sm"
            >
              {{ n }}
            </button>
            <button
              type="button"
              @click="clearLastDigit"
              class="w-full h-12 rounded-lg bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:bg-[#f8faff] hover:border-[#2b365a] hover:scale-[1.02] transition-all duration-300 shadow-sm"
            >
              <Icon name="material-symbols:backspace-outline" size="20" />
            </button>
            <button
              type="button"
              @click="appendDigit(0)"
              class="w-full h-12 rounded-lg bg-white border-2 border-gray-200 text-gray-700 font-semibold text-lg hover:bg-[#f8faff] hover:border-[#2b365a] hover:scale-[1.02] transition-all duration-300 shadow-sm"
            >
              0
            </button>
            <button
              type="button"
              @click="clearAllDigits"
              class="w-full h-12 rounded-lg bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:bg-[#f8faff] hover:border-[#2b365a] hover:scale-[1.02] transition-all duration-300 shadow-sm"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-700 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-800"
      >
        <div class="flex items-center space-x-2">
          <template v-if="isLoading">
            <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Authenticating...</span>
          </template>
          <template v-else>
            <Icon :name="loginMethod === 'email' ? 'mdi:login' : 'mdi:message-lock'" size="20" />
            <span>{{ loginMethod === 'email' ? 'Sign in' : 'Verify Code' }}</span>
          </template>
        </div>
      </button>
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
import HandleReqErrors from "~/helpers/HandleReqErrors.js"
import { useAuthStore } from "~/stores/auth"
import { useOrderStore } from '~/stores/orderStore';

const router = useRouter()
const AuthStore = useAuthStore()
const OrderStore = useOrderStore()
const loginMethod = ref('otp')
const otpDigits = ref(Array(4).fill(''))
const isLoading = ref(false)

const schema = computed(() => {
  if (loginMethod.value === 'email') {
    return object({
      email: string().required('Email is required').email('Invalid email format'),
      password: string().required('Password is required').min(8, 'Password must be at least 8 characters'),
    })
  }
  return object({})
})

const onSubmit = (values) => {
  const formattedQuery = loginMethod.value === 'email' 
    ? { email: values.email, password: values.password }
    : { login_code: otpDigits.value.join('') }

  isLoading.value = true

  useApi(`login`, "POST", {
    type: 'object',
    data: formattedQuery
  })
    .then(response => {
      const userDataForCookie = {
        first_name: response.user.first_name,
        last_name: response.user.last_name,
        username: response.user.username,
        id: response.user.id,
        shift: response.user.shift,
        role: response.user.roles[0]?.name
      }
      
      const userData = useCookie("PosUserData", {
        path: "/",
        maxAge: 60 * 60 * 24,
      })
      const userToken = useCookie("PosUserToken", {
        path: "/",
        maxAge: 60 * 60 * 24,
      })
      
      userData.value = userDataForCookie
      userToken.value = response.access_token
      AuthStore.setToken(`Bearer ${response.access_token}`)
      AuthStore.setUser(response.user)
      push.success(response.message)
      
      // Reset the order store
      OrderStore.$reset()
      
      const role = response.user?.roles[0]?.name
      if(role === 'cashier' || role === 'Admin') {
        router.push('/cashier').then(() => requestFullscreen())
      } else if(role === 'waiter') {
        router.push('/waiter')
      } else {
        router.push('/')
      }
    })
    .catch(error => {
      console.log(error)
      HandleReqErrors(error)
    })
    .finally(() => {
      isLoading.value = false
    })
}

const requestFullscreen = () => {
  const elem = document.documentElement
  if (elem.requestFullscreen) {
    elem.requestFullscreen()
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen()
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen()
  }
}

const onOtpInput = (index) => {
  otpDigits.value[index] = otpDigits.value[index].replace(/[^0-9]/g, '')
  
  if (otpDigits.value[index].length === 1 && index < 3) {
    document.querySelectorAll('input')[index + 1]?.focus()
  }
  
  if (otpDigits.value.every(digit => digit !== '')) {
    setTimeout(() => {
      onSubmit({ login_code: otpDigits.value.join('') })
    }, 300)
  }
}

const onOtpKeydown = (event, index) => {
  if (event.key === 'Backspace' && index > 0 && otpDigits.value[index] === '') {
    document.querySelectorAll('input')[index - 1].focus()
  }
}

const appendDigit = (digit) => {
  const emptyIndex = otpDigits.value.findIndex(d => d === '')
  if (emptyIndex !== -1) {
    otpDigits.value[emptyIndex] = digit.toString()
    if (emptyIndex < 3) {
      document.querySelectorAll('input')[emptyIndex + 1]?.focus()
    }
    if (otpDigits.value.every(digit => digit !== '')) {
      setTimeout(() => {
        onSubmit({ login_code: otpDigits.value.join('') })
      }, 300)
    }
  }
}

const clearLastDigit = () => {
  const lastFilledIndex = otpDigits.value.map(d => d !== '').lastIndexOf(true)
  if (lastFilledIndex !== -1) {
    otpDigits.value[lastFilledIndex] = ''
    document.querySelectorAll('input')[lastFilledIndex]?.focus()
  }
}

const clearAllDigits = () => {
  otpDigits.value = Array(4).fill('')
  document.querySelectorAll('input')[0]?.focus()
}

const handlePaste = (event) => {
  event.preventDefault()
  const pastedText = event.clipboardData.getData('text')
  const currentIndex = parseInt(event.target.getAttribute('data-index'))
  const number = pastedText.replace(/[^0-9]/g, '').charAt(0)
  
  if (number) {
    otpDigits.value[currentIndex] = number
    if (currentIndex < 3) {
      document.querySelectorAll('input')[currentIndex + 1]?.focus()
    }
    
    if (otpDigits.value.every(digit => digit !== '')) {
      setTimeout(() => {
        onSubmit({ login_code: otpDigits.value.join('') })
      }, 300)
    }
  }
}
</script>
