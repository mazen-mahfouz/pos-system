<template>
  <div class="w-full rounded-lg flex justify-between p-2 lg:p-3 xl:p-4">
    <div class="flex items-center justify-between gap-[10px] lg:gap-[15px] xl:gap-[20px]">
      <UDropdown :items="items" :ui="{ item: { disabled: 'cursor-text select-text' } }" :popper="{ placement: 'bottom-start' }">
        <img src="/assets/img/avatar.png" class="w-[32px] h-[32px] lg:w-[40px] lg:h-[40px] xl:w-[48px] xl:h-[48px] mx-[10px] rounded-full" />

        <template #account="{ item }">
          <div class="text-left">
            <h1 class="text-[#262626] text-[14px] lg:text-[16px] xl:text-[18px] font-medium">{{ AuthStore?.user?.first_name }} {{ AuthStore?.user?.last_name }}</h1>
            <p class="truncate font-medium text-[11px] lg:text-[13px] xl:text-[14px] text-gray-900 dark:text-white">
              {{ AuthStore?.user?.roles?.[0]?.name }}            
            </p>
          </div>
        </template>

        <template #item="{ item }">
          <NuxtLink @click="logout(), AuthStore.logout()" class="w-full flex items-center justify-between">
              <span class="text-[#ff0a0a] text-[13px] font-[400]">{{ item.label }}</span>
              <UIcon :name="item.icon" class="flex-shrink-0 h-4 w-4 ms-auto text-[#ff1f1f] text-[22px]" />
          </NuxtLink>
        </template>
      </UDropdown>
      <div class="flex items-center gap-[5px] lg:gap-[8px] xl:gap-[10px]" v-if="!OrderStore.$state.openOrder">
        <div class="bg-[#ffffff] shadow-md p-[5px_8px] lg:p-[6px_10px] xl:p-[8px_12px] pr-[18px] flex justify-between items-center rounded-full gap-[10px]">
          <div class="bg-[#f5f9ff] p-[4px] lg:p-[5px] xl:p-[6px] flex justify-center items-center rounded-full">
            <Icon name="material-symbols:calendar-month-outline-rounded" class="text-[#6b9bfa] text-[15px] lg:text-[17px] xl:text-[19px]" />
          </div>
          <h1 class="text-[#040404] text-[9px] lg:text-[11px] xl:text-[13px] font-[500]">{{ formattedDate }}</h1>
        </div>
        <span class="text-[10px] text-[#6d6d6d]">-</span>
        <div class="bg-[#ffffff] shadow-md p-[5px_8px] lg:p-[6px_10px] xl:p-[8px_12px] pr-[18px] flex justify-between items-center rounded-full gap-[10px]">
          <div class="bg-[#f5f9ff] p-[4px] lg:p-[5px] xl:p-[6px] flex justify-center items-center rounded-full">
            <Icon name="bi:clock" class="text-[#6b9bfa] text-[11px] lg:text-[13px] xl:text-[15px]" />
          </div>
          <h1 class="text-[#040404] text-[9px] lg:text-[11px] xl:text-[13px] font-[500]">{{ formattedTime }}</h1>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-[10px] lg:gap-[15px] xl:gap-[20px]">
      <!-- Print Button -->
      <div @click="handlePrintClick" 
           class="bg-[#ffffff] shadow-md p-[4px_10px] lg:p-[6px_12px] xl:p-[8px_14px] cursor-pointer transition duration-200 ease-in rounded-full"
           :class="canPrintOrder ? 'hover:bg-[#f2f2f2] text-[#1e8370]' : 'opacity-50 cursor-not-allowed text-gray-400'">
        <div class="flex items-center justify-between gap-[10px]">
          <div class="bg-[#f5f9ff] p-[3px] lg:p-[4px] xl:p-[5px] flex justify-center items-center rounded-full">
            <Icon name="mdi:printer" class="text-[15px] lg:text-[17px] xl:text-[19px]" />
          </div>
          <h1 class="text-[10px] lg:text-[12px] xl:text-[14px] font-[600]">Print</h1>
        </div>
      </div>

      <!-- Discount Button (existing) -->
      <div @click="handleDiscountClick" 
           class="bg-[#ffffff] shadow-md p-[4px_10px] lg:p-[6px_12px] xl:p-[8px_14px] cursor-pointer transition duration-200 ease-in rounded-full"
           :class="canApplyDiscount ? 'hover:bg-[#f2f2f2] text-[#1e8370]' : 'opacity-50 cursor-not-allowed text-gray-400'">
        <div class="flex items-center justify-between gap-[10px]">
          <div class="bg-[#f5f9ff] p-[3px] lg:p-[4px] xl:p-[5px] flex justify-center items-center rounded-full">
            <Icon name="mdi:tag-outline" class="text-[15px] lg:text-[17px] xl:text-[19px]" />
          </div>
          <h1 class="text-[10px] lg:text-[12px] xl:text-[14px] font-[600]">Discount</h1>
        </div>
      </div>

      <!-- Shift Details Button -->
      <div @click="openShiftModal" 
           class="bg-[#ffffff] shadow-md p-[4px_10px] lg:p-[6px_12px] xl:p-[8px_14px] cursor-pointer transition duration-200 ease-in hover:bg-[#f2f2f2] rounded-full">
        <div class="flex items-center justify-between gap-[10px]">
          <div class="bg-[#f5f9ff] p-[3px] lg:p-[4px] xl:p-[5px] flex justify-center items-center rounded-full">
            <Icon name="mdi:cash-register" class="text-[#1e8370] text-[15px] lg:text-[17px] xl:text-[19px]" />
          </div>
          <h1 class="text-[10px] lg:text-[12px] xl:text-[14px] font-[600]">Shift</h1>
        </div>
      </div>

      <div @click="openOrdersModal" class="bg-[#ffffff] shadow-md p-[4px_10px] lg:p-[6px_12px] xl:p-[8px_14px] cursor-pointer transition duration-200 ease-in hover:bg-[#f2f2f2] flex justify-between items-center rounded-full gap-[10px]">
        <div class="flex items-center justify-between gap-[10px]" >
          <div class="bg-[#f5f9ff] p-[3px] lg:p-[4px] xl:p-[5px] flex justify-center items-center rounded-full">
            <Icon name="line-md:list" class="text-[#1e8370] text-[15px] lg:text-[17px] xl:text-[19px]" />
          </div>
          <h1 class="text-[#040404] text-[10px] lg:text-[12px] xl:text-[14px] font-[600]">Orders</h1>
        </div>
      </div>
      <div @click="openNewOrder" v-if="!OrderStore.$state.openOrder" class="bg-[#1ca84f] shadow-md p-[4px_10px] lg:p-[6px_12px] xl:p-[8px_14px] cursor-pointer transition duration-200 ease-in hover:bg-[#299751] flex justify-between items-center rounded-full gap-[10px]">
        <div class="flex items-center justify-between gap-[10px]" >
        <div class="bg-[#f1f6ff] p-[3px] lg:p-[4px] xl:p-[5px] flex justify-center items-center rounded-full">
          <Icon name="i-heroicons-plus" class="text-[#125b2d] text-[13px] lg:text-[15px] xl:text-[17px]" />
        </div>          
        <h1 class="text-[#fff] text-[10px] lg:text-[12px] xl:text-[14px] font-[600]">New order</h1>
        </div>
      </div>
    </div>
  </div>

  <!-- Add new Discount Modal -->
  <Teleport to="body">
    <UModal 
      v-model="showDiscountModal"
      :ui="{ 
        width: 'sm:max-w-[600px]',
        overlay: { background: 'bg-gray-900/60 backdrop-blur-sm' },
        height: 'auto',
        padding: 'p-0',
        background: 'bg-white dark:bg-gray-900',
        rounded: 'rounded-xl'
      }"
    >
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-800">Apply Discount</h2>
          <button @click="closeDiscountModal" class="text-gray-400 hover:text-gray-600 transition-colors">
            <Icon name="mdi:close" size="24" />
          </button>
        </div>

        <!-- Discount Types -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div
            v-for="type in discountTypes"
            :key="type.value"
            @click="discountType = type.value"
            class="relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02]"
          >
            <div class="flex flex-col items-center space-y-3">
              <div class="bg-white p-3 rounded-lg shadow-sm">
                <Icon 
                  :name="type.icon" 
                  size="32" 
                  :class="discountType === type.value ? 'text-[#2b3c5e]' : 'text-gray-600'" 
                />
              </div>
              <span class="font-semibold text-[15px] text-gray-700">{{ type.label }}</span>
              <p class="text-[12px] text-gray-500 text-center">{{ type.description }}</p>
            </div>
            <div v-if="discountType === type.value" class="absolute top-3 right-3">
              <Icon name="mdi:check-circle" class="text-[#2b3c5e]" size="20" />
            </div>
          </div>
        </div>

        <!-- Amount Input or Saved Discounts Select -->
        <div class="bg-gray-50 p-5 rounded-xl mb-6">
          <div v-if="discountType !== 'saved'" class="relative">
            <label class="text-[14px] text-gray-600 mb-2 block">
              {{ discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount' }}
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[15px]">
                {{ discountType === 'percentage' ? '%' : '£' }}
              </span>
              <input
                v-model="discountAmount"
                type="number"
                class="w-full p-3 pl-8 text-[15px] border-2 rounded-lg focus:ring-2 focus:ring-[#2b3c5e] focus:border-[#2b3c5e] transition-all duration-200"
                :placeholder="discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'"
              />
            </div>
          </div>

          <div v-else class="relative">
            <label class="text-[14px] text-gray-600 mb-2 block">Select Saved Discount</label>
            <select
              v-model="selectedSavedDiscount"
              class="w-full p-3 text-[15px] border-2 rounded-lg focus:ring-2 focus:ring-[#2b3c5e] focus:border-[#2b3c5e] transition-all duration-200"
            >
              <option value="">Select a discount</option>
              <option v-for="discount in savedDiscounts" :key="discount.id" :value="discount.id">
                {{ discount.name }} - {{ discount.value }}{{ discount.type === 'percentage' ? '%' : '£' }}
              </option>
            </select>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-4">
          <button
            @click="closeDiscountModal"
            class="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center space-x-2 text-[14px] font-medium"
          >
            <Icon name="mdi:close" size="20" />
            <span>Cancel</span>
          </button>
          
          <button
            @click="applyDiscount"
            class="flex-1 px-6 py-3 bg-[#2b3c5e] text-white rounded-lg hover:bg-[#22407c] transition-all duration-200 flex items-center justify-center space-x-2 text-[14px] font-medium"
          >
            <Icon name="mdi:check" size="20" />
            <span>Apply Discount</span>
          </button>
        </div>
      </div>
    </UModal>
  </Teleport>

  <!-- Hidden Receipt Template -->
  <CashierReceiptTemplate
    ref="receiptTemplateRef"
    :order="OrderStore.currentOrder"
  />

  <!-- Add shift modal -->
  <CashierShiftDetailsModal 
    v-if="showShiftModal"
    @close="showShiftModal = false"
  />

  <!-- Hidden Shift Receipt Template -->
  <CashierShiftReceiptTemplate
    ref="shiftReceiptTemplateRef"
    :shift="shiftDetails"
  />
  <CashierPermissionModal
  v-model="showPermissionModal"
  :action="permissionAction"
  @confirm="handlePermissionConfirm"
/>
</template>

<script setup>
import HandleReqErrors from "~/helpers/HandleReqErrors.js";
import { useOrderStore } from '~/stores/orderStore';
import { inject, ref, onMounted, computed, watch, h } from 'vue';
import { useAuthStore } from "~/stores/auth";
import CashierPermissionModal from '~/components/Cashier/PermissionModal.vue'

const emit = defineEmits(['open-discount-modal']);

const OrderStore = useOrderStore();
const openNewOrderModal = inject('openNewOrderModal');
const openOrdersModal = inject('openOrdersModal');
const AuthStore = useAuthStore()

const showDiscountModal = ref(false);
const discountType = ref('cash');
const discountAmount = ref('');

const openNewOrder = () => {
  console.log(OrderStore.$state.openOrder)
  if(OrderStore.$state.openOrder){
    push.error('There is an open order now.');
  }else{
    openNewOrderModal();
  }
};

const openOrders = () => {
  console.log(OrderStore.$state.openOrder)
  if(OrderStore.$state.openOrder){
    push.error('There is an open order now.');
  }else{
    openOrdersModal();
  }
};

const items = [
  [{
      label: 'ben@example.com',
      slot: 'account',
      disabled: true
  }],
  [{
      label: 'Logout',
      icon: 'mdi:location-exit',
      link: '/auth/login'
  }]
]
const open = ref(false)

const pageTitle = useState("pageTitle");
const openSidebar = useState("openSidebar");
openSidebar.value = false;
const router = useRouter();


const formattedDate = ref('');
const formattedTime = ref('');

const logout = () => {
  useApi(`logout`, "POST")
    .then(response => {
      push.success(response.message)
      router.push('/auth/login')
    })
    .catch(error => {
      HandleReqErrors(error);
    });
};

// Format date and time
const formatDate = () => {
  const today = new Date();
  const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  formattedDate.value = today.toLocaleDateString('en-GB', dateOptions).replace(',', '');

  const hours = today.getHours();
  const minutes = today.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';

  // Format time in hh:mm format with AM/PM
  const formattedHours = hours % 12 || 12; // Converts 0 to 12 for 12 AM/PM
  formattedTime.value = `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const toggleSidebar = () => {
  openSidebar.value = !openSidebar.value;
};

onMounted(() => {
  formatDate();
  console.log(useCookie('PosUserData'))
});

const canApplyDiscount = computed(() => {
  return OrderStore.$state.openOrder && 
         OrderStore.currentOrder.items.length > 0;
});

const handlePermissionConfirm = (verified) => {
  if (!verified) return;
  
  if (permissionAction.value.includes('discount')) {
    showDiscountModal.value = true;
  }
  showPermissionModal.value = false;
};

const handleDiscountClick = () => {
  if (!canApplyDiscount.value) {
    push.error('Please add items to the order first');
    return;
  }
  
  showPermissionModal.value = true;
  permissionAction.value = OrderStore.currentOrder.discount > 0 ? 'edit discount' : 'create discount';
};

const closeDiscountModal = () => {
  showDiscountModal.value = false;
  discountType.value = 'cash';
  discountAmount.value = '';
};

const discountTypes = [
  { 
    value: 'cash', 
    label: 'Cash Discount',
    icon: 'mdi:cash',
    description: 'Apply fixed amount discount'
  },
  { 
    value: 'percentage', 
    label: 'Percentage Off',
    icon: 'mdi:percent',
    description: 'Apply percentage based discount'
  },
  { 
    value: 'saved', 
    label: 'Saved Discount',
    icon: 'mdi:tag-outline',
    description: 'Use a pre-saved discount'
  }
];

const applyDiscount = async () => {
  if (!discountAmount.value || discountAmount.value <= 0) {
    push.error('Please enter a valid amount');
    return;
  }

  if (discountType.value === 'percentage' && discountAmount.value > 100) {
    push.error('Percentage cannot exceed 100%');
    return;
  }

  try {
    // First, apply the discount
    const discountResponse = await useApi(`orders/${OrderStore.currentOrder.id}/discount`, 'POST', {
      type: 'object',
      data: {
        type: discountType.value,
        amount: parseFloat(discountAmount.value)
      }
    });

    // Then, fetch the updated order data
    const orderResponse = await useApi(`orders/${OrderStore.currentOrder.id}`, 'GET');
    
    // Update the order with the latest data
    OrderStore.updateOrderFromResponse(orderResponse.order);
    push.success('Discount applied successfully');
    closeDiscountModal();
  } catch (error) {
    console.error('Error applying discount:', error);
    push.error('Failed to apply discount');
  }
};

// Watch for changes in discount type to reset amount
watch(discountType, () => {
  discountAmount.value = '';
});

// Add computed property for print button
const canPrintOrder = computed(() => {
  return OrderStore.$state.openOrder && 
         OrderStore.currentOrder.items.length > 0;
});

const receiptTemplateRef = ref(null);

// Add print handler method
const handlePrintClick = () => {
  if (!canPrintOrder.value) {
    push.error('Please add items to the order first');
    return;
  }
  
  receiptTemplateRef.value?.printReceipt();
};

const showShiftModal = ref(false);
const shiftDetails = ref(null);

const openShiftModal = () => {
  showShiftModal.value = true;
};

const shiftReceiptTemplateRef = ref(null);

const printShiftDetails = () => {
  shiftReceiptTemplateRef.value?.print();
};

const fetchShiftDetails = async () => {
  try {
    const response = await useApi(`shift/${useCookie('PosUserData').value.shift}/details`, 'GET');
    shiftDetails.value = response;
  } catch (error) {
    console.error('Error fetching shift details:', error);
    push.error('Failed to load shift details');
  }
};

watch(showShiftModal, (newValue) => {
  if (newValue) {
    fetchShiftDetails()
  }
})

// Add formatDateTime and formatPrice functions
const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

const formatPrice = (price) => {
  if (!price) return '0.00';
  return Number(price).toFixed(2);
};

const selectedSavedDiscount = ref('');
const savedDiscounts = ref([
  { id: 1, name: 'Summer Sale', value: 10, type: 'percentage' },
  { id: 2, name: 'VIP Discount', value: 5, type: 'cash' },
  // Add more saved discounts as needed
]);

// Add permission modal handling
const showPermissionModal = ref(false);
const permissionAction = ref('');

</script>

<style lang="scss" scoped>
// ... existing styles ...

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>