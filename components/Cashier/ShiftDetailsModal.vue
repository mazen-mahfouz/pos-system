<template>
  <Teleport to="body">
    <ShiftReceiptTemplate
      ref="receiptTemplateRef"
      :shift="shiftDetails?.shift"
    />

    <Transition name="fade">
      <div class="fixed inset-0 bg-gray-900/60  flex items-center justify-center z-30 p-4"
           @click="handleClose">
        <div class="bg-white py-3 px-2 rounded-xl w-full max-w-[550px] md:w-[95%] lg:w-[60%] xl:max-w-[550px] md:max-h-[90vh] flex flex-col shadow-xl"
             @click.stop>
          <!-- Modal Header -->
          <div class="px-4 py-2 md:py-3 flex justify-between items-center border-b sticky top-0 bg-white z-10">
            <h2 class="text-[15px] md:text-lg font-bold text-gray-800">Shift Details</h2>
            <button @click="handleClose" class="text-gray-400 hover:text-gray-600 transition-colors">
              <Icon name="mdi:close" size="20" />
            </button>
          </div>

          <!-- Modal Content -->
          <div class="flex-1 overflow-y-auto px-2 md:px-4 py-3">
            <!-- Loading State with Enhanced Content Loader -->
            <div v-if="isLoading" class="space-y-2">
              <!-- Timing Cards Skeleton -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2">
                <div v-for="n in 2" :key="n" class="relative p-2 border rounded-lg bg-[#f8faff] border-[#2b3c5e]/10">
                  <ContentLoader 
                    viewBox="0 0 180 80"
                    :speed="2"
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                    class="w-full h-full"
                  >
                    <!-- Icon Circle (smaller) -->
                    <circle cx="60" cy="20" r="12" />
                    <!-- Title (smaller) -->
                    <rect x="35" y="40" rx="2" ry="2" width="50" height="8" />
                    <!-- Time (smaller) -->
                    <rect x="25" y="55" rx="2" ry="2" width="70" height="6" />
                  </ContentLoader>
                </div>
              </div>

              <!-- Sales Summary Skeleton -->
              <div class="bg-gray-50 p-2 rounded-lg mb-2">
                <!-- Header -->
                <ContentLoader 
                  viewBox="0 0 180 20"
                  :speed="2"
                  backgroundColor="#f3f3f3"
                  foregroundColor="#ecebeb"
                  class="w-full mb-1.5"
                >
                  <!-- Icon (smaller) -->
                  <rect x="0" y="0" rx="2" ry="2" width="16" height="16" />
                  <!-- Title (smaller) -->
                  <rect x="22" y="4" rx="2" ry="2" width="60" height="8" />
                </ContentLoader>

                <!-- Summary Items -->
                <div class="space-y-1">
                  <div v-for="n in 2" :key="n" class="bg-white p-1.5 rounded-md">
                    <ContentLoader 
                      viewBox="0 0 180 24"
                      :speed="2"
                      backgroundColor="#f3f3f3"
                      foregroundColor="#ecebeb"
                      class="w-full"
                    >
                      <!-- Left side (icon + text) -->
                      <circle cx="10" cy="12" r="5" />
                      <rect x="20" y="9" rx="2" ry="2" width="60" height="6" />
                      <!-- Right side (amount) -->
                      <rect x="120" y="9" rx="2" ry="2" width="45" height="6" />
                    </ContentLoader>
                  </div>
                </div>
              </div>

              <!-- Payment Methods Skeleton -->
              <div class="bg-gray-50 p-2 rounded-lg mb-2">
                <!-- Header -->
                <ContentLoader 
                  viewBox="0 0 180 20"
                  :speed="2"
                  backgroundColor="#f3f3f3"
                  foregroundColor="#ecebeb"
                  class="w-full mb-1.5"
                >
                  <!-- Icon (smaller) -->
                  <rect x="0" y="0" rx="2" ry="2" width="16" height="16" />
                  <!-- Title (smaller) -->
                  <rect x="22" y="4" rx="2" ry="2" width="70" height="8" />
                </ContentLoader>

                <!-- Payment Items -->
                <div class="space-y-1">
                  <div v-for="n in 2" :key="n" class="bg-white p-1.5 rounded-md">
                    <ContentLoader 
                      viewBox="0 0 180 24"
                      :speed="2"
                      backgroundColor="#f3f3f3"
                      foregroundColor="#ecebeb"
                      class="w-full"
                    >
                      <!-- Left side (icon + text) -->
                      <circle cx="10" cy="12" r="5" />
                      <rect x="20" y="9" rx="2" ry="2" width="50" height="6" />
                      <!-- Right side (amount) -->
                      <rect x="120" y="9" rx="2" ry="2" width="45" height="6" />
                    </ContentLoader>
                  </div>
                </div>
              </div>

              <!-- Action Buttons Skeleton -->
              <div class="flex flex-col sm:flex-row gap-1">
                <ContentLoader 
                  v-for="n in 3"
                  :key="n"
                  viewBox="0 0 60 24"
                  :speed="2"
                  backgroundColor="#f3f3f3"
                  foregroundColor="#ecebeb"
                  class="w-full sm:flex-1"
                >
                  <rect x="0" y="0" rx="4" ry="4" width="60" height="24" />
                </ContentLoader>
              </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="text-center text-red-500 py-8">
              {{ error }}
            </div>

            <!-- Content -->
            <template v-else-if="shiftDetails">
              <!-- User Information Card -->
              <div class="bg-gray-50 p-3 md:p-4 rounded-xl mb-3 md:mb-4">
                <div class="flex items-center gap-2 mb-3">
                  <div class="bg-[#2b3c5e] p-1.5 rounded-lg">
                    <Icon name="mdi:account" size="18" class="text-white" />
                  </div>
                  <h3 class="text-base font-bold text-gray-800">Cashier Information</h3>
                </div>
                
                <div class="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                  <div class="flex items-center gap-2">
                    <Icon name="mdi:account-circle" size="16" class="text-[#2b3c5e]" />
                    <span class="text-sm text-gray-600">User</span>
                  </div>
                  <span class="text-base font-bold text-[#2b3c5e]">
                    {{ shiftDetails.shift.user }}
                  </span>
                </div>
              </div>

              <!-- Shift Timing Cards -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mb-4">
                <div class="relative p-4 border-2 rounded-xl bg-[#f8faff] border-[#3947622c]">
                  <div class="flex flex-col items-center space-y-2">
                    <div class="bg-white p-3 rounded-lg shadow-sm">
                      <Icon name="mdi:clock-start" size="28" class="text-[#2b3c5e]" />
                    </div>
                    <span class="font-semibold text-[13px] text-gray-700">Start Time</span>
                    <p class="text-xs text-[#2b3c5e] font-medium">
                      {{ formatDateTime(shiftDetails.shift.start_time) }}
                    </p>
                  </div>
                </div>

                <div class="relative p-4 border-2 rounded-xl bg-[#f8faff] border-[#3947622c]">
                  <div class="flex flex-col items-center space-y-2">
                    <div class="bg-white p-3 rounded-lg shadow-sm">
                      <Icon name="mdi:clock-end" size="28" class="text-[#2b3c5e]" />
                    </div>
                    <span class="font-semibold text-[13px] text-gray-700">End Time</span>
                    <p class="text-xs text-[#2b3c5e] font-medium">
                      {{ formatDateTime(shiftDetails.shift.end_time) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Sales Summary -->
              <div class="bg-gray-50 p-3 md:p-4 rounded-xl mb-3 md:mb-4">
                <div class="flex items-center gap-2 mb-3">
                  <div class="bg-[#2b3c5e] p-1.5 rounded-lg">
                    <Icon name="mdi:chart-box" size="18" class="text-white" />
                  </div>
                  <h3 class="text-base font-bold text-gray-800">Sales Summary</h3>
                </div>

                <div class="space-y-1.5 md:space-y-2">
                  <div class="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <div class="flex items-center gap-2">
                      <Icon name="mdi:cash-multiple" size="16" class="text-[#2b3c5e]" />
                      <span class="text-sm text-gray-600">Total Sales</span>
                    </div>
                    <span class="text-base font-bold text-[#2b3c5e]">
                      £{{ formatPrice(shiftDetails.shift.total_sales) }}
                    </span>
                  </div>

                  <div class="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <div class="flex items-center gap-2">
                      <Icon name="mdi:percent" size="16" class="text-[#2b3c5e]" />
                      <span class="text-sm text-gray-600">Tax</span>
                    </div>
                    <span class="text-base font-bold text-[#2b3c5e]">
                      £{{ formatPrice(shiftDetails.shift.total_tax) }}
                    </span>
                  </div>

                  <div class="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <div class="flex items-center gap-2">
                      <Icon name="mdi:room-service" size="16" class="text-[#2b3c5e]" />
                      <span class="text-sm text-gray-600">Service Charges</span>
                    </div>
                    <span class="text-base font-bold text-[#2b3c5e]">
                      £{{ formatPrice(shiftDetails.shift.total_services) }}
                    </span>
                  </div>

                  <div class="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <div class="flex items-center gap-2">
                      <Icon name="mdi:tag-multiple" size="16" class="text-red-500" />
                      <span class="text-sm text-gray-600">Discounts</span>
                    </div>
                    <span class="text-base font-bold text-red-500">
                      -£{{ formatPrice(shiftDetails.shift.total_discounts) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Orders Summary -->
              <div class="bg-gray-50 p-3 md:p-4 rounded-xl mb-3 md:mb-4">
                <div class="flex items-center gap-2 mb-3">
                  <div class="bg-[#2b3c5e] p-1.5 rounded-lg">
                    <Icon name="mdi:clipboard-text" size="18" class="text-white" />
                  </div>
                  <h3 class="text-base font-bold text-gray-800">Orders Summary</h3>
                </div>

                <div class="space-y-1.5 md:space-y-2">
                  <div class="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <div class="flex items-center gap-2">
                      <Icon name="mdi:check-circle" size="16" class="text-green-600" />
                      <span class="text-sm text-gray-600">Completed Orders</span>
                    </div>
                    <span class="text-base font-bold text-[#2b3c5e]">
                      {{ shiftDetails.shift.total_completed_orders }}
                    </span>
                  </div>

                  <div class="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <div class="flex items-center gap-2">
                      <Icon name="mdi:package-variant" size="16" class="text-[#2b3c5e]" />
                      <span class="text-sm text-gray-600">Items Sold</span>
                    </div>
                    <span class="text-base font-bold text-[#2b3c5e]">
                      {{ shiftDetails.shift.total_items_sold }}
                    </span>
                  </div>

                  <div class="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <div class="flex items-center gap-2">
                      <Icon name="mdi:cancel" size="16" class="text-red-500" />
                      <span class="text-sm text-gray-600">Canceled Orders</span>
                    </div>
                    <span class="text-base font-bold text-red-500">
                      {{ shiftDetails.shift.total_canceled_orders }}
                    </span>
                  </div>

                  <div class="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <div class="flex items-center gap-2">
                      <Icon name="mdi:currency-usd-off" size="16" class="text-red-500" />
                      <span class="text-sm text-gray-600">Canceled Value</span>
                    </div>
                    <span class="text-base font-bold text-red-500">
                      £{{ formatPrice(shiftDetails.shift.total_canceled_value) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Payment Methods -->
              <div class="bg-gray-50 p-3 md:p-4 rounded-xl mb-3 md:mb-4">
                <div class="flex items-center gap-2 mb-3">
                  <div class="bg-[#2b3c5e] p-1.5 rounded-lg">
                    <Icon name="mdi:wallet" size="18" class="text-white" />
                  </div>
                  <h3 class="text-base font-bold text-gray-800">Payment Methods</h3>
                </div>

                <div class="grid gap-2">
                  <!-- Display payment methods dynamically from data -->
                  <div v-for="payment in shiftDetails.shift.payment_totals" :key="payment.method" 
                       class="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <div class="flex items-center gap-2">
                      <Icon :name="getPaymentIcon(payment.method)" size="16" class="text-[#2b3c5e]" />
                      <span class="text-sm text-gray-600">{{ payment.method }}</span>
                    </div>
                    <span class="text-base font-bold text-[#2b3c5e]">
                      £{{ formatPrice(payment.total_amount) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  @click="printShiftDetails"
                  class="w-full sm:flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Icon name="mdi:printer" size="16" />
                  <span>Print Report</span>
                </button>
                
                <button
                  @click="closeShift"
                  class="w-full sm:flex-1 px-4 py-2.5 bg-[#2b3c5e] text-white rounded-lg hover:bg-[#22407c] transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Icon name="mdi:cash-register" size="16" />
                  <span>Close Shift</span>
                </button>

                <button
                  @click="handleClose"
                  class="w-full sm:flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { ContentLoader } from 'vue-content-loader'
import ShiftReceiptTemplate from './ShiftReceiptTemplate.vue'
import { useAuthStore } from "~/stores/auth";
import HandleReqErrors from "~/helpers/HandleReqErrors.js"

const AuthStore = useAuthStore()
const loading = ref(false)
const error = ref(null)
const shiftDetails = ref(null)
const receiptTemplateRef = ref(null)
const router = useRouter();

const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue', 'close']);

const formatPrice = (price) => {
  return Number(price).toFixed(2)
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

// Debounce function
const debounce = (fn, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      fn(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Optimized fetch function with caching
const cache = new Map()
const fetchShiftDetails = async () => {
  const shiftId = useCookie('PosUserData').value?.shift
  
  if (!shiftId) {
    error.value = 'No active shift found'
    return
  }

  // Check cache first
  const cacheKey = `shift_${shiftId}`
  if (cache.has(cacheKey)) {
    shiftDetails.value = cache.get(cacheKey)
    return
  }

  loading.value = true
  error.value = null
  
  try {
    const response = await useApi(`shift/${shiftId}/details`, 'GET')
    if (!response) throw new Error('No data received')
    
    // Update UI in next frame
    requestAnimationFrame(() => {
      shiftDetails.value = response
      // Cache the result
      cache.set(cacheKey, response)
    })
  } catch (err) {
    error.value = err.message || 'Failed to load shift details'
    console.error('Error fetching shift details:', err)
    push.error(error.value)
  } finally {
    loading.value = false
  }
}

// Debounced print function
const printShiftDetails = debounce(() => {
  if (!shiftDetails.value?.shift) {
    push.error('No shift data available to print')
    return
  }
  receiptTemplateRef.value?.print()
}, 300)

// Optimized close shift function
const closeShift = async () => {
  loading.value = true
  const shiftId = useCookie('PosUserData').value?.shift
  
  try {
    if (!shiftId) throw new Error('No active shift found')
    
    await useApi(`shift/${shiftId}/close`, 'POST')
    
    // Clear cache when closing shift
    cache.clear()
    
    push.success('Shift closed successfully')
    emit('close')
    AuthStore.logout()
    router.push('/auth/login')
  } catch (err) {
    push.error(err.data?.message || 'Failed to close shift')
  } finally {
    loading.value = false
  }
}

// Watch for modal changes with improved performance
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    requestAnimationFrame(() => {
      fetchShiftDetails()
    })
  } else {
    shiftDetails.value = null
    error.value = null
  }
}, { immediate: true })

// Optimized close handler
const handleClose = debounce(() => {
  shiftDetails.value = null
  error.value = null
  emit('update:modelValue', false)
  emit('close')
}, 200)

// Computed property for loading state
const isLoading = computed(() => loading.value)

// Function to determine payment icon based on method
const getPaymentIcon = (method) => {
  const methodIcons = {
    'Cash': 'mdi:cash',
    'Card': 'mdi:credit-card',
    'Visa': 'mdi:credit-card',
    'MasterCard': 'mdi:credit-card',
    'AmEx': 'mdi:credit-card',
    'PayPal': 'mdi:paypal',
    'Other': 'mdi:wallet'
  }
  
  return methodIcons[method] || 'mdi:wallet'
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Optimize animations */
.modal-content {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>