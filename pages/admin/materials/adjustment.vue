<template>
  <div class="mx-auto px-6">
    <h1 class="text-3xl font-bold mb-8 text-start text-gray-800">Material Adjustment</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- Search and Actions Bar -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center space-x-4">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass-20-solid"
            placeholder="Search materials..."
            class="w-64"
          />
        </div>
        <div class="flex items-center space-x-2">
          <UButton
            color="green"
            variant="soft"
            icon="i-heroicons-plus"
            @click="addAdjustmentRow"
          >
            Add Row
          </UButton>
          <UButton
            color="blue"
            variant="soft"
            icon="i-heroicons-check"
            :loading="isSubmitting"
            :disabled="!adjustments.length"
            @click="submitAdjustments"
          >
            Submit Adjustments
          </UButton>
        </div>
      </div>

      <!-- Reason Field -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Reason</label>
        <UInput
          v-model="reason"
          placeholder="Enter reason for adjustments"
          class="w-full"
        />
      </div>

      <!-- Adjustments Form -->
      <div class="space-y-4">
        <div v-for="(adjustment, index) in adjustments" :key="index" 
          class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <!-- Material Selection -->
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Material</label>
            <USelect
              v-model="adjustment.material_id"
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
              v-model="adjustment.quantity"
              type="number"
              placeholder="Quantity"
            />
          </div>

          <!-- Unit Cost -->
          <div class="w-32">
            <label class="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
            <UInput
              v-model="adjustment.unit_cost"
              type="number"
              step="0.01"
              placeholder="Unit cost"
            />
          </div>

          <!-- Adjustment Type -->
          <div class="w-32">
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <USelect
              v-model="adjustment.adjustment_type"
              :options="[
                { label: 'Add', value: 'add' },
                { label: 'Remove', value: 'remove' }
              ]"
              option-attribute="label"
              value-attribute="value"
              placeholder="Type"
            />
          </div>

          <!-- Remove Button -->
          <div class="flex items-end">
            <UButton
              color="red"
              variant="soft"
              icon="i-heroicons-trash"
              @click="removeAdjustmentRow(index)"
            />
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!adjustments.length" class="text-center py-12 bg-gray-50 rounded-lg">
          <Icon name="mdi:clipboard-edit" class="text-gray-400 text-4xl mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No Adjustments Added</h3>
          <p class="text-sm text-gray-500 mb-4">
            Click the "Add Row" button above to start adding material adjustments.
          </p>
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
pageTitle.value = "/ Materials / Adjustment";

// State
const materials = ref([]);
const searchQuery = ref('');
const adjustments = ref([]);
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

const addAdjustmentRow = () => {
  adjustments.value.push({
    material_id: null,
    quantity: null,
    type: 'adjustment',
    unit_cost: null,
    adjustment_type: 'add'
  });
};

const removeAdjustmentRow = (index) => {
  adjustments.value.splice(index, 1);
};

const submitAdjustments = async () => {
  // Validate adjustments
  const invalidAdjustments = adjustments.value.filter(adj => 
    !adj.material_id || !adj.quantity || !adj.adjustment_type
  );

  if (invalidAdjustments.length) {
    push.error('Please fill in all required fields for each adjustment');
    return;
  }

  if (!reason.value) {
    push.error('Please enter a reason for the adjustments');
    return;
  }

  isSubmitting.value = true;
  try {
    await useApi('inventory/adjust', 'POST', {
      type: 'object',
      data: {
        materials: adjustments.value,
        reason: reason.value
      }
    });
    
    push.success('Adjustments submitted successfully');
    adjustments.value = []; // Clear form
    reason.value = ''; // Clear reason
  } catch (err) {
    HandleReqErrors(err);
  } finally {
    isSubmitting.value = false;
  }
};

// Filtered materials based on search
const filteredMaterials = computed(() => {
  if (!searchQuery.value) return materials.value;
  
  const query = searchQuery.value.toLowerCase();
  return materials.value.filter(material => 
    material.name.toLowerCase().includes(query)
  );
});

onMounted(() => {
  fetchMaterials();
});
</script> 