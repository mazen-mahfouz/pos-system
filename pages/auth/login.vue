<template>
  <div class="w-full max-w-md mx-auto space-y-8">
    <!-- <h2 class="text-3xl font-semibold mb-12 text-gray-800 text-center">Welcome to Sugar Rush</h2> -->

    <div class="space-y-12">
      <!-- Toggle Between Email and OTP -->
      <div class="flex justify-center">
        <div class="w-full rounded-md shadow-sm" role="group">
          <button
            v-for="method in ['email', 'otp']"
            :key="method"
            @click="loginMethod = method"
            :class="[ 
              'w-[50%] px-6 py-3 text-sm font-medium transition-colors duration-300',
              loginMethod === method
                ? 'bg-pink-500 text-white'   // Custom color
                : 'bg-white text-gray-700 hover:bg-pink-100',
              method === 'email' ? 'rounded-l-lg' : 'rounded-r-lg',
              'border border-gray-300 focus:z-10 focus:ring-2 focus:ring-pink-500'
            ]"
          >
            {{ method === 'email' ? 'Email Login' : 'OTP Login' }}
          </button>
        </div>
      </div>

      <!-- Form Section -->
      <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors }">
        <div v-if="loginMethod === 'email'" class="space-y-8">
          <!-- Email Input -->
          <div>
            <label for="email" class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
             <span class="text-[14px]">Email Address</span> 
             <div class="flex items-center w-full">
              <Icon name="material-symbols:person-2" class="text-pink-500 text-[22px]" />
              <Field
                name="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full px-3 py-7 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input"
                :class="{ 'border-red-500': errors.email }"
                placeholder="Enter your email"
              />
             </div>
            </label>
            <ErrorMessage name="email" class="text-red-500 text-xs mt-1" />
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
              <span>Password</span>
            <div class="flex items-center w-full">
              <Icon name="solar:lock-password-bold" class="text-pink-500 text-[20px]" />
              <Field
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="block w-full px-3 py-7 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input"
                :class="{ 'border-red-500': errors.password }"
                placeholder="Enter your password"
              />
            </div>
          </label>
            <ErrorMessage name="password" class="text-red-500 text-xs mt-1" />
          </div>
        </div>

        <!-- OTP Input -->
        <div v-else class="space-y-4">
          <div>
            <ClientOnly>
              <OtpInput @complete="onOtpComplete" />
            </ClientOnly>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="mt-8">
          <button
            v-if="loginMethod === 'email'"
            type="submit"
            class="group relative w-full flex justify-center py-4 px-4 rounded-md text-white bg-pink-500 hover:bg-pink-600 focus:outline-none transition-colors duration-300"
          >
            Sign in
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
import OtpInput from '~/components/OtpInput.vue'
import HandleReqErrors from "~/helpers/HandleReqErrors.js";
import { useAuthStore } from "~/stores/auth";


const router = useRouter();
const AuthStore = useAuthStore();


const loginMethod = ref('otp')

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
      login_code: values
    }
  }

  if (loginMethod.value === 'email') {
    console.log('Login with email:', values.email, values.password)
  } else {
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

    // Set User Data to Local Storage
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
    console.log('Send OTP to:', values)
  }
}

const onOtpComplete = (value) => {
  console.log(value)
  onSubmit(value)
}
</script>

<style scoped>
.custom-input {
  border: 0;
  background-color: transparent;
  padding: 12px;
  outline: none;
  box-shadow: unset;
  transition: background-color 0.3s ease;
}

.custom-input:focus {
  background-color: transparent;
}
</style>
