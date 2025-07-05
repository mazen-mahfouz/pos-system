<template>
  <div class="mx-auto px-6">
    <h1 class="text-3xl font-bold mb-8 text-start text-gray-800">Material Receipt</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- Receipt Form -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800">New Receipt</h2>
          <div class="flex items-center space-x-2">
            <UButton
              color="green"
              variant="soft"
              icon="i-heroicons-plus"
              @click="addReceiptRow"
            >
              Add Row
            </UButton>
            <UButton
              color="blue"
              variant="soft"
              icon="i-heroicons-check"
              :loading="isSubmitting"
              :disabled="!receiptItems.length"
              @click="submitReceipt"
            >
              Submit Receipt
            </UButton>
          </div>
        </div>

        <!-- Reason Field -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Reason</label>
          <UInput
            v-model="reason"
            placeholder="Enter reason for receipt"
            class="w-full"
          />
        </div>

        <!-- Receipt Items -->
        <div class="space-y-4">
          <div v-for="(item, index) in receiptItems" :key="index" 
            class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <!-- Material Selection -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Material</label>
              <USelect
                v-model="item.material_id"
                :options="materials"
                option-attribute="name"
                value-attribute="id"
                searchable
                placeholder="Select material"
                class="w-full"
              />
            </div>

            <!-- Quantity -->
            <div class="w-32">
              <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <UInput
                v-model="item.quantity"
                type="number"
                placeholder="Quantity"
              />
            </div>

            <!-- Unit Cost -->
            <div class="w-32">
              <label class="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
              <UInput
                v-model="item.unit_cost"
                type="number"
                step="0.01"
                placeholder="Unit cost"
              />
            </div>

            <!-- Note -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <UInput
                v-model="item.note"
                placeholder="Add note"
              />
            </div>

            <!-- Total Cost -->
            <div class="w-32">
              <label class="block text-sm font-medium text-gray-700 mb-1">Total</label>
              <div class="h-[38px] flex items-center text-gray-700">
                ${{ calculateItemTotal(item) }}
              </div>
            </div>

            <!-- Remove Button -->
            <div class="flex items-end">
              <UButton
                color="red"
                variant="soft"
                icon="i-heroicons-trash"
                @click="removeReceiptRow(index)"
              />
            </div>
          </div>

          <!-- Receipt Summary -->
          <div v-if="receiptItems.length" class="flex justify-end p-4 bg-gray-100 rounded-lg">
            <div class="text-right">
              <div class="text-sm text-gray-600">Total Items: {{ receiptItems.length }}</div>
              <div class="text-lg font-semibold text-gray-900">Total Cost: ${{ calculateTotal }}</div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!receiptItems.length" class="text-center py-12 bg-gray-50 rounded-lg">
            <Icon name="mdi:receipt" class="text-gray-400 text-4xl mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Items Added</h3>
            <p class="text-sm text-gray-500 mb-4">
              Click the "Add Row" button above to start adding materials to the receipt.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import HandleReqErrors from "~/helpers/HandleReqErrors.js";

definePageMeta({
  layout: 'admin',
});

const pageTitle = useState("pageTitle");
pageTitle.value = "/ Materials / Receipt";

// State
const materials = ref([]);
const receiptItems = ref([]);
const isSubmitting = ref(false);
const reason = ref('');

// Methods
const fetchMaterials = async () => {
  try {
    const response = await useApi('materials', 'GET');
    materials.value = response.materials;
  } catch (err) {
    HandleReqErrors(err);
  }
};

const addReceiptRow = () => {
  receiptItems.value.push({
    material_id: null,
    quantity: null,
    type: 'receipt',
    unit_cost: null,
    adjustment_type: 'add',
    note: ''
  });
};

const removeReceiptRow = (index) => {
  receiptItems.value.splice(index, 1);
};

const calculateItemTotal = (item) => {
  if (!item.quantity || !item.unit_cost) return '0.00';
  return (item.quantity * item.unit_cost).toFixed(2);
};

const calculateTotal = computed(() => {
  return receiptItems.value.reduce((total, item) => {
    return total + (item.quantity || 0) * (item.unit_cost || 0);
  }, 0).toFixed(2);
});

const submitReceipt = async () => {
  // Validate receipt items
  const invalidItems = receiptItems.value.filter(item => 
    !item.material_id || !item.quantity || !item.unit_cost
  );

  if (invalidItems.length) {
    push.error('Please fill in all required fields for each item');
    return;
  }

  if (!reason.value) {
    push.error('Please enter a reason for the receipt');
    return;
  }

  isSubmitting.value = true;
  try {
    await useApi('inventory/receipt', 'POST', {
      type: 'object',
      data: {
        materials: receiptItems.value,
        reason: reason.value
      }
    });
    
    push.success('Receipt submitted successfully');
    receiptItems.value = []; // Clear form
    reason.value = ''; // Clear reason
  } catch (err) {
    HandleReqErrors(err);
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchMaterials();
});
</script> 