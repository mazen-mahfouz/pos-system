<template>
  <div class="fixed top-0 right-0 h-screen w-[300px] xl:w-[400px] 2xl:w-[500px] bg-white shadow-lg flex flex-col transition-transform duration-300 ease-in-out transform"
       :class="{ 'translate-x-0': OrderStore.$state.openOrder, 'translate-x-full': !OrderStore.$state.openOrder }">
    
    <div class="bg-gradient-to-r from-[#2b3c5e] to-[#1a2744] p-3">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <div class="bg-white/10 p-1.5 rounded-lg">
            <Icon name="mdi:receipt" class="text-white xl:text-2xl" size="18" />
          </div>
          <h2 class="text-white text-sm xl:text-xl font-semibold">Order Details</h2>
        </div>
        <span class="bg-white/20 px-2 py-1 rounded-full text-xs xl:text-base text-white">
          #{{ OrderStore.currentOrder.code || 'New' }}
        </span>
      </div>
    </div>

    <div class="p-3 bg-gray-50/50">
      <div class="bg-white rounded-lg p-2 shadow-sm space-y-2">
        <div class="flex items-center space-x-2 bg-gray-50/50 rounded-lg p-1.5">
          <Icon name="mdi:account" size="16" class="text-gray-500 xl:text-xl" />
          <input
            v-model="OrderStore.currentOrder.guest"
            type="text"
            placeholder="Guest Name"
            class="w-full bg-transparent text-xs xl:text-sm focus:outline-none"
          >
        </div>
        
        <div class="flex space-x-1">
          <div @click="editOrderType" 
               :class="{ 'opacity-50 cursor-not-allowed': isButtonDisabled }"
               class="flex-1 bg-gray-50/50 rounded-lg p-1.5 cursor-pointer hover:bg-gray-100 transition-colors">
            <div class="flex items-center space-x-1">
              <Icon :name="getOrderTypeIcon(OrderStore.currentOrder.type)" size="16" class="text-gray-500" />
              <span class="text-[10px] lg:text-sm text-gray-600">{{ OrderStore.currentOrder.type || 'Type' }}</span>
            </div>
          </div>
          <div @click="emit('edit-table')" v-if="isDineIn" class="flex-1 bg-gray-50/50 rounded-lg p-1.5 cursor-pointer hover:bg-gray-100 transition-colors">
            <div class="flex items-center space-x-1">
              <Icon name="ic:baseline-table-restaurant" size="16" class="text-gray-500" />
              <span class="text-[10px] lg:text-sm text-gray-600">Table {{ OrderStore.currentOrder.table_id || 'any' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-grow overflow-y-auto px-3 py-2">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xs xl:text-sm font-medium text-gray-500">ORDER ITEMS</h3>
        <span class="text-xs xl:text-sm bg-[#2b3c5e]/10 text-[#2b3c5e] px-2 py-0.5 rounded-full font-medium">
          {{ OrderStore.currentOrder?.items?.length || 0 }} items
        </span>
      </div>

      <TransitionGroup name="list" tag="ul" class="space-y-2">
        <li v-for="item in OrderStore.currentOrder?.items" 
            :key="item.product_id" 
            @click="handleItemClick(item)"
            class="group relative bg-white rounded-lg p-2.5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100/50">
          <div class="flex items-center space-x-2">
            <div class="relative w-12 h-12 xl:w-14 xl:h-14 flex-shrink-0">
              <NuxtImg
                :src="item.product?.image || item.image || '/img/notfound.png'"
                :alt="item?.name"
                class="w-full h-full object-cover rounded-lg shadow-sm border border-gray-100"
              />
              <div class="absolute -top-1.5 -right-1.5 bg-[#2b3c5e] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium shadow-sm">
                {{ item.quantity }}
              </div>
            </div>
            
            <div class="flex-grow min-w-0">
              <div class="flex items-start justify-between">
                <div class="min-w-0">
                  <p class="text-sm font-medium text-gray-800 truncate pr-2">
                    {{ item.product?.name || item?.name }}
                  </p>
                  <div class="flex items-center space-x-2 mt-0.5">
                    <span class="text-xs text-gray-500">£{{ formatPrice(item.price) }}</span>
                    
                    <div class="flex items-center space-x-1">
                      <div v-if="item.discount" 
                           @click.stop="openDiscountModal(item)"
                           class="flex items-center space-x-0.5 px-1.5 py-0.5 bg-green-50 text-green-600 rounded-full text-[10px] hover:bg-green-100 transition-colors">
                        <Icon name="mdi:tag" size="10" />
                        <span>{{ item.discount_type === 'percentage' ? `${item.discount}%` : `£${item.discount}` }}</span>
                      </div>
                      
                      <div v-if="item.note || item.notes" 
                           @click.stop="openNoteModal(item)"
                           class="flex items-center space-x-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] hover:bg-blue-100 transition-colors">
                        <Icon name="mdi:note" size="10" />
                        <span class="truncate max-w-[50px]">{{ item.note || item.notes }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex items-center">
                  <button @click.stop="handleIncreaseQuantity(item)" 
                          :disabled="isButtonDisabled"
                          class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-50">
                    <Icon name="mdi:plus" size="16" />
                  </button>
                </div>
              </div>
            </div>

            <Transition name="fade">
              <div v-if="selectedItem?.product_id === item.product_id"
                   class="fixed z-50 left-[10px] translate-y-[-70px] bg-white rounded-xl shadow-lg border border-gray-100 "
                   :style="getDropdownPosition(item)">
                <!-- Arrow pointing down -->
                <div class="absolute bottom-0 left-6 transform translate-y-full">
                  <svg width="16" height="8" viewBox="0 0 16 8">
                    <path d="M8 8L0 0h16L8 8z" fill="white"/>
                    <path d="M8 8L0 0h16L8 8z" fill="none" stroke="#e5e7eb"/>
                  </svg>
                </div>
                
                <div class="flex items-center divide-x divide-gray-100">
                  <!-- Discount Button -->
                  <button @click.stop="openDiscountModal(item)"
                          class="flex flex-col items-center py-2.5 px-4 hover:bg-gray-50 transition-colors min-w-[100px]">
                    <div class="mb-1">
                      <Icon name="mdi:tag" size="20" class="text-gray-900" />
                    </div>
                    <span class="text-[12px] font-medium text-gray-900">
                      {{ item.discount ? 'Edit Discount' : 'Discount' }}
                    </span>
                  </button>
                  
                  <!-- Note Button -->
                  <button @click.stop="openNoteModal(item)"
                          class="flex flex-col items-center py-2.5 px-4 hover:bg-gray-50 transition-colors min-w-[100px]">
                    <div class="mb-1">
                      <Icon name="mdi:note" size="20" class="text-gray-900" />
                    </div>
                    <span class="text-[12px] font-medium text-gray-900">
                      {{ item.notes ? 'Edit Note' : 'Note' }}
                    </span>
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </li>
      </TransitionGroup>

      <div v-if="!OrderStore.currentOrder?.items?.length" 
           class="flex flex-col items-center justify-center py-6 text-center">
        <Icon name="mdi:cart-outline" size="40" class="text-gray-300 mb-2" />
        <p class="text-gray-500 text-xs">No items in order yet</p>
      </div>
    </div>

    <div class="bg-gray-50/50 p-3 space-y-2">
      <div class="bg-white rounded-lg p-2 shadow-sm space-y-2">
        <div class="flex justify-between items-center text-xs xl:text-base">
          <div class="flex items-center space-x-1 text-gray-600">
            <Icon name="mdi:cart-outline" size="12" />
            <span>Subtotal</span>
          </div>
          <span class="font-medium">£{{ formatPrice(OrderStore.currentOrder.sub_total || 0) }}</span>
        </div>
        
        <div class="flex justify-between items-center text-xs xl:text-base">
          <div class="flex items-center space-x-1 text-gray-600">
            <Icon name="mdi:percent" size="12" />
            <span>Tax</span>
          </div>
          <span class="font-medium">£{{ formatPrice(OrderStore.currentOrder.tax || 0) }}</span>
        </div>
        
        <div class="flex justify-between items-center text-xs xl:text-base">
          <div class="flex items-center space-x-1 text-gray-600">
            <Icon name="mdi:room-service-outline" size="12" />
            <span>Service</span>
          </div>
          <span class="font-medium">£{{ formatPrice(OrderStore.currentOrder.service || 0) }}</span>
        </div>
        
        <div class="flex justify-between items-center text-xs xl:text-base">
          <div class="flex items-center space-x-1 text-green-600 cursor-pointer"
               @click="handleDiscountClick">
            <Icon name="mdi:tag-outline" size="12" />
            <span>Discount</span>
            <Icon v-if="OrderStore.currentOrder.discount > 0" 
                  name="mdi:pencil" 
                  size="12" 
                  class="ml-1" />
          </div>
          <div class="flex items-center">
            <span class="font-medium text-green-600">
              -£{{ OrderStore.currentOrder.discount > 0 ? formatPrice(OrderStore.currentOrder.discount) : '0.00' }}
            </span>
            <Icon v-if="OrderStore.currentOrder.discount > 0"
                  @click="handleRemoveDiscount"
                  name="mdi:close"
                  size="12"
                  class="ml-2 cursor-pointer text-red-500 hover:text-red-600" />
          </div>
        </div>
      </div>

      <button @click="checkout" 
              class="w-full bg-gradient-to-r from-[#2b3c5e] to-[#1a2744] text-white rounded-lg p-2 hover:shadow-lg transition-all duration-300">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <Icon name="mdi:cash-register" size="20" class="xl:text-2xl" />
            <span class="text-xs xl:text-base font-medium">Total</span>
          </div>
          <span class="font-bold text-xs xl:text-base">£{{ formatPrice(OrderStore.currentOrder.total_amount || 0) }}</span>
        </div>
      </button>
    </div>

    <div class="p-3 pt-2 flex items-center gap-2 bg-white">
      <button @click="OrderStore.currentOrder.id ?       OrderStore.closeOrder() : placeOrder()" 
              class="flex-1 bg-[#2b3c5e] text-white py-1.5 lg:py-2 px-2 lg:px-3 rounded-lg hover:bg-[#22407c] active:scale-95 transition-all duration-200 text-xs lg:text-sm font-medium flex items-center justify-center space-x-1">
        <Icon :name="OrderStore.currentOrder.id ? 'mdi:pencil' : 'mdi:check'" size="16" />
        <span>{{ OrderStore.currentOrder.id ? 'Update' : 'Place' }}</span>
      </button>
      <button @click="handleCancelOrder" 
              class="flex-1 bg-red-50 text-red-600 py-1.5 lg:py-2 px-2 lg:px-3 rounded-lg hover:bg-red-100 active:scale-95 transition-all duration-200 text-xs lg:text-sm font-medium flex items-center justify-center space-x-1">
        <Icon name="mdi:close" size="12" />
        <span>Cancel</span>
      </button>
    </div>

    <CashierPaymentModal
      v-model="showPaymentModal"
      :total="OrderStore.currentOrder.total_amount || 0"
      :orderData="OrderStore.currentOrder"
      @payment-complete="processPayment"
    />

    <CashierPermissionModal
      v-model="showPermissionModal"
      :action="permissionAction"
      @confirm="handlePermissionConfirm"
    />

    <ReceiptTemplate 
      ref="receiptRef"
      :order="OrderStore.currentOrder"
    />

    <CashierDiscountModal
      v-model="showDiscountModal"
    />

    <CashierSplitOrderModal
      v-model="showSplitModal"
      :order="OrderStore.currentOrder"
      @split-complete="handleSplitComplete"
    />

    <CashierCancelOrderModal
      v-model="showCancelModal"
    />

    <ItemDiscountModal
      v-model="showItemDiscountModal"
      :item="selectedItem"
      @update="handleDiscountUpdate"
    />

    <ItemNoteModal
      v-if="selectedItem && showNoteModal"
      v-model="showNoteModal"
      :item="selectedItem"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useOrderStore } from '~/stores/orderStore';
import ReceiptTemplate from './ReceiptTemplate.vue';
import CashierDiscountModal from '~/components/Cashier/DiscountModal.vue';
import CashierSplitOrderModal from './SplitOrderModal.vue';
import CashierCancelOrderModal from './CancelOrderModal.vue';
import ItemDiscountModal from './ItemDiscountModal.vue';
import ItemNoteModal from './ItemNoteModal.vue';

const OrderStore = useOrderStore();
const receiptRef = ref(null);

const showPaymentModal = ref(false);
const showPermissionModal = ref(false);
const permissionAction = ref('');
const selectedItem = ref(null);
const pendingAction = ref(null);

const isButtonDisabled = computed(() => OrderStore.isButtonDisabled);

const showDiscountModal = ref(false);

const showSplitModal = ref(false);

const showCancelModal = ref(false);

const showItemDiscountModal = ref(false);

const showNoteModal = ref(false);

const handlePermissionConfirm = async (verified) => {
  if (!verified) return;

  switch (permissionAction.value) {
    case 'remove':
      if (selectedItem.value) {
        OrderStore.removeItem(selectedItem.value.product_id);
        selectedItem.value = null;
      }
      break;
    case 'decrease':
      if (selectedItem.value) {
        OrderStore.decreaseQuantity(selectedItem.value.product_id);
        selectedItem.value = null;
      }
      break;
    case 'edit-type':
      emit('edit-type');
      break;
    case 'create discount':
    case 'edit discount':
      showDiscountModal.value = true;
      break;
    case 'cancel order':
      showCancelModal.value = true;
      break;
    case 'order item discount':
      showItemDiscountModal.value = true;
      break;
  }
  
  showPermissionModal.value = false;
};

const confirmRemoveItem = (item) => {
  selectedItem.value = null;
  permissionAction.value = 'remove';
  showPermissionModal.value = true;
};

const handleDecreaseQuantity = (item) => {
  if (isButtonDisabled.value) return;
  
  isButtonDisabled.value = true;
  
  if (item.quantity === 1) {
    selectedItem.value = item;
    permissionAction.value = 'edit order';
    pendingAction.value = 'decrease';
    showPermissionModal.value = true;
  } else {
    OrderStore.decreaseQuantity(item.product_id);
  }
  
  setTimeout(() => {
    isButtonDisabled.value = false;
  }, 500); // 500ms cooldown
};

const handleIncreaseQuantity = async (item) => {
  if (isButtonDisabled.value) return;
  
  try {
    isButtonDisabled.value = true;
    await OrderStore.increaseQuantity(item.id);
  } catch (error) {
    console.error('Error increasing quantity:', error);
    push.error('Failed to increase quantity');
  } finally {
    setTimeout(() => {
      isButtonDisabled.value = false;
    }, 500);
  }
};

const checkout = () => {
  if (!OrderStore.currentOrder || !OrderStore.currentOrder.items ) {
    push.error('Cannot proceed with payment. No order exists.');
    return;
  }
  
  if (OrderStore.currentOrder?.items?.length === 0) {
    push.error('Cannot proceed with payment. Please add items to the order first.');
    return;
  }
  
  showPaymentModal.value = true;
};

const processPayment = async (paymentDetails) => {
  let orderId = OrderStore.currentOrder.id;

  if (!orderId) {
    useApi('orders', 'POST', {
      type: 'object',
      data: {
        guest: OrderStore.currentOrder.guest,
        type: OrderStore.currentOrder.type,
        table_id: OrderStore.currentOrder.table_id,
        items: OrderStore.currentOrder.items,
        shift_id: OrderStore.currentOrder.shift_id,
      },
    })
    .then(placeOrderResponse => {
      orderId = placeOrderResponse.order.id;
      return useApi('payment', 'POST', {
        type: 'object',
        data: {
          order_id: orderId,
          amount: OrderStore.currentOrder.total_amount,
          payment_method_id: paymentDetails.method,
          amount_received: paymentDetails.amountReceived,
          change_amount: paymentDetails.change
        },
      });
    })
    .then(async () => {
      showPaymentModal.value = false;
      await receiptRef.value?.printReceipt();
      OrderStore.closeOrder();
      push.success('The payment has been processed successfully.');
    })
    .catch(error => {
      console.error('Payment processing error:', error);
      push.error('Failed to process payment. Please try again.');
    });
  } else {
    useApi('payment', 'POST', {
      type: 'object',
      data: {
        order_id: orderId,
        amount: OrderStore.currentOrder.total_amount,
        payment_method_id: paymentDetails.method,
        amount_received: paymentDetails.amountReceived,
        change_amount: paymentDetails.change
      },
    })
    .then(async () => {
      showPaymentModal.value = false;
      await receiptRef.value?.printReceipt();
      OrderStore.closeOrder();
      push.success('The payment has been processed successfully.');
    })
    .catch(error => {
      console.error('Payment processing error:', error);
      push.error('Failed to process payment. Please try again.');
    });
  }
};

const formatPrice = (price) => {
  return typeof price === 'number' ? price.toFixed(2) : parseFloat(price).toFixed(2);
};

const placeOrder = async () => {
  if (OrderStore.currentOrder?.items?.length === 0) {
    push.error('Add items');
    return;
  }

  const orderData = {
    guest: OrderStore.currentOrder.guest,
    type: OrderStore.currentOrder.type,
    table_id: OrderStore.currentOrder.table_id,
    items: OrderStore.currentOrder.items.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity
    })),
    shift_id: OrderStore.currentOrder.shift_id,
  };

  if (OrderStore.currentOrder.discount && OrderStore.currentOrder.discount.type && OrderStore.currentOrder.discount.amount > 0) {
    orderData.discount = {
      type: OrderStore.currentOrder.discount.type,
      amount: OrderStore.currentOrder.discount.amount
    };
  }

  useApi('orders', 'POST', {
    type: 'object',
    data: orderData,
  })
    .then(response => {
      OrderStore.updateOrderFromResponse(response.order);
      OrderStore.closeOrder();
    })
    .catch(error => {
      console.error('Error placing order:', error);
    });
};

const updateOrder = async () => {
  if (OrderStore.currentOrder?.items?.length === 0) {
    return;
  }

  const orderData = {
    guest: OrderStore.currentOrder.guest,
    type: OrderStore.currentOrder.type,
    table_id: OrderStore.currentOrder.table_id,
    items: OrderStore.currentOrder.items.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity
    })),
    shift_id: OrderStore.currentOrder.shift_id,
  };

  if (OrderStore.currentOrder.discount && OrderStore.currentOrder.discount.type && OrderStore.currentOrder.discount.amount > 0) {
    orderData.discount = {
      type: OrderStore.currentOrder.discount.type,
      amount: OrderStore.currentOrder.discount.amount
    };
  }

  useApi(`orders/${OrderStore.currentOrder.id}`, 'PUT', {
    type: 'object',
    data: orderData,
  })
    .then(response => {
      OrderStore.editOrder(OrderStore.currentOrder.id, { ...OrderStore.currentOrder });
      OrderStore.closeOrder();
    })
    .catch(error => {
      console.error('Error updating order:', error);
    });
};

const isDineIn = computed(() => {
  return OrderStore.currentOrder.type && OrderStore.currentOrder.type.toLowerCase() === 'dine-in';
});

const getOrderTypeIcon = (type) => {
  if (type && type.toLowerCase() === 'dine-in') {
    return 'mdi:silverware-fork-knife';
  }
  return 'mdi:food-takeout-box';
};

const emit = defineEmits(['edit-type', 'edit-table']);

const editOrderType = () => {
  if (isButtonDisabled.value) return;
  
  isButtonDisabled.value = true;
  emit('edit-type');
  
  setTimeout(() => {
    isButtonDisabled.value = false;
  }, 500); // 500ms cooldown
};

const handleDiscountClick = () => {
  showPermissionModal.value = true;
  permissionAction.value = OrderStore.currentOrder.discount > 0 ? 'edit discount' : 'create discount';
  pendingAction.value = OrderStore.currentOrder.discount > 0 ? 'edit discount' : 'create discount';
};

const handleRemoveDiscount = async () => {
  try {
    const orderResponse = await useApi(`orders/${OrderStore.currentOrder.id}/discount`, 'GET');
    OrderStore.updateOrderFromResponse(orderResponse.order);
    push.success('Discount removed successfully');
  } catch (error) {
    console.error('Error removing discount:', error);
    push.error('Failed to remove discount');
  }
};

const handleSplitOrder = () => {
  if (!OrderStore.currentOrder?.items?.length) {
    push.error('No items to split');
    return;
  }
  showSplitModal.value = true;
};

const handleSplitComplete = async ({ splitItems }) => {
  try {
    // إنشاء طلب جديد للعناصر المقسمة
    const newOrderResponse = await useApi('orders', 'POST', {
      type: 'object',
      data: {
        guest: `${OrderStore.currentOrder.guest || 'Guest'} (Split)`,
        type: OrderStore.currentOrder.type,
        table_id: OrderStore.currentOrder.table_id,
        items: splitItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        shift_id: OrderStore.currentOrder.shift_id,
      },
    });

    // تحديث الطلب الأصلي
    await useApi(`orders/${OrderStore.currentOrder.id}`, 'PUT', {
      type: 'object',
      data: {
        guest: OrderStore.currentOrder.guest,
        type: OrderStore.currentOrder.type,
        table_id: OrderStore.currentOrder.table_id,
        items: originalItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        shift_id: OrderStore.currentOrder.shift_id,
      },
    });

    push.success('Order split successfully');
    OrderStore.closeOrder();
  } catch (error) {
    console.error('Error splitting order:', error);
    push.error('Failed to split order');
  }
};

const handleCancelOrder = () => {
  if (!OrderStore.currentOrder.id) {
    OrderStore.closeOrder();
    return;
  }
  
  permissionAction.value = 'cancel order';
  showPermissionModal.value = true;
};

const openDiscountModal = (item) => {
  selectedItem.value = item;
  permissionAction.value = 'order item discount';
  showPermissionModal.value = true;
};

const openNoteModal = (item) => {
  if (!item) return;
  selectedItem.value = item;
  showNoteModal.value = true;
};

const handleDiscountUpdate = (updatedItem) => {
  useApi(`orderItem/${updatedItem.id}/discount`, 'POST', {
    type: 'object',
    data: {
      type: updatedItem.discount.type,
      amount: updatedItem.discount.amount
    }
  }).then(response => {
    OrderStore.updateItemDiscount(updatedItem.id, response.discount);
    push.success('Discount updated successfully');
  }).catch(error => {
    console.error('Error updating discount:', error);
    push.error('Failed to update discount');
  });
};

const handleNoteUpdate = (updatedItem) => {
  useApi(`orderItem/${updatedItem.id}/add_note`, 'PUT', {
    type: 'object',
    data: {
      note: updatedItem.note
    }
  }).then(response => {
    OrderStore.updateItemNote(updatedItem.id, response.note);
    push.success('Note updated successfully');
  }).catch(error => {
    console.error('Error updating note:', error);
    push.error('Failed to update note');
  });
};

// Handle item click
const handleItemClick = (item) => {
  if (selectedItem.value?.product_id === item.product_id) {
    selectedItem.value = null;
  } else {
    selectedItem.value = item;
  }
};

// Close menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!target.closest('.group')) {
      selectedItem.value = null;
    }
  });
});

const getDropdownPosition = (item) => {
  const element = document.querySelector(`[data-product-id="${item.product_id}"]`);
  if (!element) return {};

  const rect = element.getBoundingClientRect();
  const dropdownHeight = 80; // تقدير ارتفاع القائمة المنبثقة
  const arrowOffset = 8; // ارتفاع السهم

  return {
    left: `${rect.left}px`,
    top: `${rect.top - dropdownHeight - arrowOffset}px`,
    width: '180px'
  };
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Improve button interactions */
button {
  transition: all 0.2s ease;
}

button:active {
  transform: scale(0.98);
}
</style>