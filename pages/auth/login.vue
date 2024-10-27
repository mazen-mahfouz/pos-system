<template>
  <div class="w-full max-w-sm mx-auto space-y-8">
    <div class="space-y-8">
      <!-- Toggle Between Email and OTP -->
      <div class="flex justify-center">
        <div class="w-full rounded-[50px] shadow-sm" role="group">
          <button
            v-for="method in ['email', 'otp']"
            :key="method"
            @click="loginMethod = method"
            :class="[ 
              'w-[50%] px-6 py-2 text-sm font-medium transition-colors duration-300',
              loginMethod === method
                ? 'bg-[#2b365a] text-white'
                : 'bg-white text-gray-700 hover:bg-indigo-50',
              method === 'email' ? 'rounded-l-xl' : 'rounded-r-lg',
              'border border-gray-300 focus:z-10 focus:ring-2 focus:ring-indigo-500'
            ]"
          >
            {{ method === 'email' ? 'Email Login' : 'OTP Login' }}
          </button>
        </div>
      </div>

      <!-- Form Section -->
      <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors }">
        <div v-if="loginMethod === 'email'" class="space-y-6">
          <!-- Email Input -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="material-symbols:person-2" class="text-gray-400" />
              </div>
              <Field
                name="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                :class="{ 'border-red-500': errors.email }"
                placeholder="Enter your email"
              />
            </div>
            <ErrorMessage name="email" class="text-red-500 text-xs mt-1" />
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="solar:lock-password-bold" class="text-gray-400" />
              </div>
              <Field
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                :class="{ 'border-red-500': errors.password }"
                placeholder="Enter your password"
              />
            </div>
            <ErrorMessage name="password" class="text-red-500 text-xs mt-1" />
          </div>
        </div>

        <!-- OTP Input -->
        <div v-else class="space-y-4">
          <div class="flex justify-center gap-6">
            <input
              v-for="(digit, index) in 4"
              :key="index"
              v-model="otpDigits[index]"
              type="text"
              maxlength="1"
              class="w-[60px] h-[60px] text-center text-[20px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              @input="onOtpInput(index)"
              @keydown="onOtpKeydown($event, index)"
            />
          </div>
        </div>

        <!-- Submit Button -->
        <div class="mt-6">
          <button
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-[14px] font-medium text-white bg-[#2b365a] hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {{ loginMethod === 'email' ? 'Sign in' : 'Sign in' }}
          </button>
        </div>
      </Form>
    </div>
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
    const userData = useCookie("PosUserData", {
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    const userToken = useCookie("PosUserToken", {
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    userData.value = response.user;
    userToken.value = response.access_token;

    AuthStore.setToken(`Bearer ${response.access_token}`);
    AuthStore.setUser(response.user);
    push.success(response.message);
    if(response.user?.roles[0].name === 'cashier') {
      router.push('/cashier');
    } else if(response.user?.roles[0]?.name === 'Admin') {
      router.push('/admin');
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

const onOtpInput = (index) => {
  if (otpDigits.value[index].length === 1 && index < 5) {
    document.querySelectorAll('input')[index + 1].focus()
  }
  if (otpDigits.value.every(digit => digit !== '')) {
    onSubmit()
  }
}

const onOtpKeydown = (event, index) => {
  if (event.key === 'Backspace' && index > 0 && otpDigits.value[index] === '') {
    document.querySelectorAll('input')[index - 1].focus()
  }
}
</script>
