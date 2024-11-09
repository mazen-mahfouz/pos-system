<template>
  <Teleport to="body">
    <ShiftReceiptTemplate
      ref="receiptTemplateRef"
      :shift="shiftDetails?.shift"
    />

    <Transition name="fade">
      <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-30 p-4"
           @click="handleClose">
        <div class="bg-white py-3 px-2 rounded-xl w-full md:w-[95%] lg:w-[85%] xl:max-w-[50%] h-[90vh] md:h-[85vh] flex flex-col shadow-xl"
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
            <!-- Loading State -->
            <div v-if="isLoading" class="flex justify-center items-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2b3c5e]"></div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="text-center text-red-500 py-8">
              {{ error }}
            </div>

            <!-- Content -->
            <template v-else-if="shiftDetails">
              <!-- Shift Timing Cards -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mb-4">
                <div class="relative p-4 border-2 rounded-xl bg-[#f8faff] border-[#2b3c5e]">
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

                <div class="relative p-4 border-2 rounded-xl bg-[#f8faff] border-[#2b3c5e]">
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

              <!-- Payment Methods -->
              <div class="bg-gray-50 p-3 md:p-4 rounded-xl mb-3 md:mb-4">
                <div class="flex items-center gap-2 mb-3">
                  <div class="bg-[#2b3c5e] p-1.5 rounded-lg">
                    <Icon name="mdi:wallet" size="18" class="text-white" />
                  </div>
                  <h3 class="text-base font-bold text-gray-800">Payment Methods</h3>
                </div>

                <div class="grid gap-2">
                  <div v-for="payment in shiftDetails.shift.payment_totals" 
                       :key="payment.method" 
                       class="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <div class="flex items-center gap-2">
                      <Icon 
                        :name="payment.method === 'Cash' ? 'mdi:cash' : 'mdi:credit-card'" 
                        size="16" 
                        class="text-[#2b3c5e]" 
                      />
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
import ShiftReceiptTemplate from './ShiftReceiptTemplate.vue'
import { useAuthStore } from "~/stores/auth";

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

const isLoading = computed(() => loading.value)

const fetchShiftDetails = async () => {
  if (!useCookie('PosUserData').value?.shift) {
    error.value = 'No active shift found'
    return
  }

  loading.value = true
  error.value = null
  
  try {
    const response = await useApi(`shift/${useCookie('PosUserData').value.shift}/details`, 'GET')
    if (!response) throw new Error('No data received')
    shiftDetails.value = response
  } catch (err) {
    error.value = err.message || 'Failed to load shift details'
    console.error('Error fetching shift details:', err)
    push.error(error.value)
  } finally {
    loading.value = false
  }
}

const printShiftDetails = () => {
  if (!shiftDetails.value?.shift) {
    push.error('No shift data available to print')
    return
  }
  receiptTemplateRef.value?.print()
}

const closeShift = async () => {
  loading.value = true
  try {
    const shiftId = useCookie('PosUserData').value?.shift
    if (!shiftId) throw new Error('No active shift found')
    
    await useApi(`shift/${shiftId}/close`, 'POST')
    push.success('Shift closed successfully')
    emit('close')
    AuthStore.logout()
    router.push('/auth/login')
  } catch (err) {
    const errorMessage = err.message || 'Failed to close shift'
    push.error(errorMessage)
    console.error('Error closing shift:', err)
  } finally {
    loading.value = false
  }
}

// Fetch data when modal opens
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    fetchShiftDetails();
  } else {
    // إعادة تعيين البيانات عند إغلاق Modal
    shiftDetails.value = null;
    error.value = null;
  }
}, { immediate: true }); // إضافة immediate: true للتنفيذ الفوري

onMounted(() => {
  if (props.modelValue) {
    fetchShiftDetails();
  }
});

onMounted(() => {
  console.log(AuthStore.user)
})

// إضافة دالة handleClose
const handleClose = () => {
  // تنظيف البيانات
  shiftDetails.value = null;
  error.value = null;
  
  // إغلاق Modal
  emit('update:modelValue', false);
  emit('close');
};
</script>