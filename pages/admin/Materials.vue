<template>
  <div class="mx-auto px-6">
    <h1 class="text-3xl font-bold mb-8 text-start text-gray-800">Manage Materials</h1>
    
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
            icon="i-heroicons-document-arrow-down"
            @click="exportToExcel"
          >
            Export to Excel
          </UButton>
          <UButton
            color="red"
            variant="soft"
            icon="i-heroicons-document-arrow-down"
            @click="exportToPDF"
          >
            Export to PDF
          </UButton>
          <UButton
            color="pink"
            variant="soft"
            icon="i-heroicons-plus"
            @click="openAddModal"
          >
            Add Material
          </UButton>
        </div>
      </div>

      <!-- Loading and Error States -->
      <div v-if="isLoading" class="text-center py-4">
        <USpinner />
      </div>

      <div v-else-if="error" class="text-red-500 text-center py-4">
        {{ error }}
      </div>

      <!-- Materials Table -->
      <UTable
        v-else
        :columns="columns"
        :rows="filteredMaterials"
        :sort="{ column: 'name', direction: 'asc' }"
      >
        <template #purchase_price-data="{ row }">
          ${{ row.purchase_price }}
        </template>
        <template #quantity-data="{ row }">
          {{ row.quantity }} {{ row.unit }}
        </template>
        <template #action-data="{ row }">
          <UButton
            color="blue"
            variant="soft"
            class="mr-2"
            @click="openEditModal(row)"
          >
            Edit
          </UButton>
          <UButton
            color="red"
            variant="soft"
            @click="deleteMaterial(row)"
          >
            Delete
          </UButton>
        </template>
      </UTable>
    </div>

    <!-- Add/Edit Modal -->
    <UModal v-model="isAddEditModalOpen" :prevent-close="true">
      <UCard class="w-full max-w-2xl">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-semibold text-gray-800">
              {{ isEditing ? 'Edit Material' : 'Add New Material' }}
            </h3>
            <UButton 
              color="gray" 
              variant="ghost" 
              icon="i-heroicons-x-mark" 
              @click="closeAddEditModal" 
            />
          </div>
        </template>
        
        <Form 
          @submit="submitMaterial" 
          :validation-schema="materialSchema" 
          :initial-values="selectedMaterial"
        >
          <div class="space-y-6">
            <!-- Name -->
            <div>
              <label class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
                <span class="text-[14px]">Name</span>
                <div class="flex items-center w-full">
                  <Icon name="mdi:package-variant" class="text-pink-500 text-[22px]" />
                  <Field
                    name="name"
                    type="text"
                    required
                    class="block w-full px-3 py-4 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input"
                    placeholder="Enter material name"
                  />
                </div>
              </label>
              <ErrorMessage name="name" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Quantity -->
            <div>
              <label class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
                <span class="text-[14px]">Quantity</span>
                <div class="flex items-center w-full">
                  <Icon name="mdi:scale" class="text-pink-500 text-[22px]" />
                  <Field
                    name="quantity"
                    type="number"
                    required
                    class="block w-full px-3 py-4 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input"
                    placeholder="Enter quantity"
                  />
                </div>
              </label>
              <ErrorMessage name="quantity" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Unit -->
            <div>
              <label class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
                <span class="text-[14px]">Unit</span>
                <div class="flex items-center w-full">
                  <Icon name="mdi:ruler" class="text-pink-500 text-[22px]" />
                  <Field
                    name="unit"
                    type="text"
                    required
                    class="block w-full px-3 py-4 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input"
                    placeholder="Enter unit (e.g., kg, g, l)"
                  />
                </div>
              </label>
              <ErrorMessage name="unit" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Purchase Price -->
            <div>
              <label class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
                <span class="text-[14px]">Purchase Price</span>
                <div class="flex items-center w-full">
                  <Icon name="mdi:currency-usd" class="text-pink-500 text-[22px]" />
                  <Field
                    name="purchase_price"
                    type="number"
                    step="0.01"
                    required
                    class="block w-full px-3 py-4 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input"
                    placeholder="Enter purchase price"
                  />
                </div>
              </label>
              <ErrorMessage name="purchase_price" class="text-red-500 text-xs mt-1" />
            </div>

            <div class="flex justify-end">
              <UButton type="submit" color="pink" class="px-6 py-3">
                {{ isEditing ? 'Update' : 'Add' }} Material
              </UButton>
            </div>
          </div>
        </Form>
      </UCard>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="isDeleteModalOpen">
      <UCard class="w-full">
        <div class="text-center">
          <Icon name="mdi:alert-circle" class="text-red-500 text-5xl mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Confirm Deletion</h3>
          <p class="text-sm text-gray-500 mb-6">
            Are you sure you want to delete this material? This action cannot be undone.
          </p>
          <div class="flex justify-center space-x-4">
            <UButton
              color="gray"
              variant="soft"
              @click="isDeleteModalOpen = false"
            >
              Cancel
            </UButton>
            <UButton
              color="red"
              variant="soft"
              @click="confirmDelete"
            >
              Delete
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Form, Field, ErrorMessage } from 'vee-validate';
import { object, string, number } from 'yup';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import HandleReqErrors from "~/helpers/HandleReqErrors.js";

definePageMeta({
  layout: 'admin',
});

const pageTitle = useState("pageTitle");
pageTitle.value = "/ Materials";

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'purchase_price', label: 'Purchase Price' },
  { key: 'action', label: 'Actions' },
];

// State management
const materials = ref([]);
const searchQuery = ref('');
const isLoading = ref(false);
const error = ref(null);
const isAddEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const selectedMaterial = ref(null);
const materialToDelete = ref(null);
const isEditing = ref(false);

// Validation schema
const materialSchema = object().shape({
  name: string().required('Name is required'),
  quantity: number().required('Quantity is required').positive('Quantity must be positive'),
  unit: string().required('Unit is required'),
  purchase_price: number().required('Purchase price is required').positive('Price must be positive'),
});

// Computed properties
const filteredMaterials = computed(() => {
  return materials.value.filter(material => {
    return material.name.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

// API calls
const fetchMaterials = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await useApi('materials', 'GET');
    materials.value = response;
  } catch (err) {
    error.value = 'Failed to fetch materials';
    HandleReqErrors(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchMaterials();
});

// Modal handlers
const openAddModal = () => {
  isEditing.value = false;
  selectedMaterial.value = {
    name: '',
    quantity: '',
    unit: '',
    purchase_price: '',
  };
  isAddEditModalOpen.value = true;
};

const openEditModal = (material) => {
  isEditing.value = true;
  selectedMaterial.value = { ...material };
  isAddEditModalOpen.value = true;
};

const closeAddEditModal = () => {
  isAddEditModalOpen.value = false;
  selectedMaterial.value = null;
  isEditing.value = false;
};

// Form submission
const submitMaterial = async (values) => {
  try {
    const endpoint = isEditing.value ? `materials/${selectedMaterial.value.id}` : 'materials';
    const method = isEditing.value ? 'POST' : 'POST';

    const response = await useApi(endpoint, method, {
      type: 'json',
      data: values
    });

    if (response) {
      await fetchMaterials();
      closeAddEditModal();
      push.success(isEditing.value ? 'Material updated successfully' : 'Material added successfully');
    }
  } catch (error) {
    HandleReqErrors(error);
  }
};

// Delete handlers
const deleteMaterial = (material) => {
  materialToDelete.value = material;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  try {
    await useApi(`materials/${materialToDelete.value.id}`, 'DELETE');
    materials.value = materials.value.filter(m => m.id !== materialToDelete.value.id);
    push.success('Material deleted successfully');
    isDeleteModalOpen.value = false;
  } catch (error) {
    HandleReqErrors(error);
  }
};

// Export functions
const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(filteredMaterials.value.map(material => ({
    Name: material.name,
    Quantity: `${material.quantity} ${material.unit}`,
    'Purchase Price': `$${material.purchase_price}`,
  })));
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Materials");
  XLSX.writeFile(workbook, "materials_list.xlsx");
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Name', 'Quantity', 'Purchase Price']],
    body: filteredMaterials.value.map(material => [
      material.name,
      `${material.quantity} ${material.unit}`,
      `$${material.purchase_price}`
    ])
  });
  doc.save("materials_list.pdf");
};
</script>

<style scoped>
/* Keep the same styles as in the Users.vue file */
</style> 