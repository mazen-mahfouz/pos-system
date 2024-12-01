<template>
  <div class="mx-auto px-6">
    <h1 class="text-3xl font-bold mb-8 text-start text-gray-800">Manage Categories</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- Search and Actions Bar -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center space-x-4">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass-20-solid"
            placeholder="Search categories..."
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
            Add Category
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

      <!-- Categories Table -->
      <UTable
        v-else
        :columns="columns"
        :rows="filteredCategories"
        :sort="{ column: 'name', direction: 'asc' }"
      >
        <template #icon-data="{ row }">
          <div class="flex items-center">
            <Icon :name="row.icon || 'mdi:folder'" :class="row.color ? `text-${row.color}-500` : 'text-gray-500'" class="text-xl" />
          </div>
        </template>
        <template #color-data="{ row }">
          <div v-if="row.color" class="flex items-center">
            <div :class="`w-4 h-4 rounded-full bg-${row.color}-500 mr-2`"></div>
            {{ row.color }}
          </div>
          <span v-else>-</span>
        </template>
        <template #products_count-data="{ row }">
          <UBadge :color="row.products_count > 0 ? 'green' : 'gray'">
            {{ row.products_count }}
          </UBadge>
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
            @click="deleteCategory(row)"
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
              {{ isEditing ? 'Edit Category' : 'Add New Category' }}
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
          @submit="submitCategory" 
          :validation-schema="categorySchema" 
          :initial-values="selectedCategory"
        >
          <div class="space-y-6">
            <!-- Name -->
            <div>
              <label class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
                <span class="text-[14px]">Name</span>
                <div class="flex items-center w-full">
                  <Icon name="mdi:folder" class="text-pink-500 text-[22px]" />
                  <Field
                    name="name"
                    type="text"
                    required
                    class="block w-full px-3 py-7 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input"
                    placeholder="Enter category name"
                  />
                </div>
              </label>
              <ErrorMessage name="name" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Icon -->
            <div>
              <label class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
                <span class="text-[14px]">Icon (FontAwesome class)</span>
                <div class="flex items-center w-full">
                  <Icon name="mdi:image" class="text-pink-500 text-[22px]" />
                  <Field
                    name="icon"
                    type="text"
                    class="block w-full px-3 py-7 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input"
                    placeholder="e.g., fa-dish"
                  />
                </div>
              </label>
              <ErrorMessage name="icon" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Color -->
            <div>
              <label class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col">
                <span class="text-[14px]">Color</span>
                <div class="flex items-center w-full">
                  <Field name="color" v-slot="{ field }">
                    <select 
                      v-bind="field"
                      class="block w-full px-3 py-2 rounded-md text-[14px] border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                    >
                      <option value="">Select a color</option>
                      <option value="red">Red</option>
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="yellow">Yellow</option>
                      <option value="purple">Purple</option>
                      <option value="pink">Pink</option>
                    </select>
                  </Field>
                </div>
              </label>
              <ErrorMessage name="color" class="text-red-500 text-xs mt-1" />
            </div>

            <div class="flex justify-end">
              <UButton type="submit" color="pink" class="px-6 py-3">
                {{ isEditing ? 'Update' : 'Add' }} Category
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
            Are you sure you want to delete this category? This action cannot be undone.
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
import { object, string } from 'yup';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import HandleReqErrors from "~/helpers/HandleReqErrors.js";

definePageMeta({
  layout: 'admin',
});

const pageTitle = useState("pageTitle");
pageTitle.value = "/ Categories";

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'icon', label: 'Icon' },
  { key: 'color', label: 'Color' },
  { key: 'products_count', label: 'Products' },
  { key: 'action', label: 'Actions' },
];

// State management
const categories = ref([]);
const searchQuery = ref('');
const isLoading = ref(false);
const error = ref(null);
const isAddEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const selectedCategory = ref(null);
const categoryToDelete = ref(null);
const isEditing = ref(false);

// Validation schema
const categorySchema = object().shape({
  name: string().required('Name is required'),
  icon: string().nullable(),
  color: string().nullable(),
});

// Computed properties
const filteredCategories = computed(() => {
  return categories.value.filter(category => {
    return category.name.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

// API calls
const fetchCategories = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await useApi('categories', 'GET');
    categories.value = response.categories;
  } catch (err) {
    error.value = 'Failed to fetch categories';
    HandleReqErrors(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchCategories();
});

// Modal handlers
const openAddModal = () => {
  isEditing.value = false;
  selectedCategory.value = {
    name: '',
    icon: '',
    color: '',
  };
  isAddEditModalOpen.value = true;
};

const openEditModal = (category) => {
  isEditing.value = true;
  selectedCategory.value = { ...category };
  isAddEditModalOpen.value = true;
};

const closeAddEditModal = () => {
  isAddEditModalOpen.value = false;
  selectedCategory.value = null;
  isEditing.value = false;
};

// Form submission
const submitCategory = async (values) => {
  try {
    const endpoint = isEditing.value ? `categories/${selectedCategory.value.id}` : 'categories';
    const method = isEditing.value ? 'POST' : 'POST';

    const response = await useApi(endpoint, method, {
      type: 'json',
      data: values
    });

    if (response) {
      await fetchCategories();
      closeAddEditModal();
      push.success(isEditing.value ? 'Category updated successfully' : 'Category added successfully');
    }
  } catch (error) {
    HandleReqErrors(error);
  }
};

// Delete handlers
const deleteCategory = (category) => {
  categoryToDelete.value = category;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  try {
    await useApi(`categories/${categoryToDelete.value.id}`, 'DELETE');
    await fetchCategories();
    push.success('Category deleted successfully');
    isDeleteModalOpen.value = false;
  } catch (error) {
    HandleReqErrors(error);
  }
};

// Export functions
const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(filteredCategories.value.map(category => ({
    Name: category.name,
    Icon: category.icon || '-',
    Color: category.color || '-',
    'Products Count': category.products_count,
  })));
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
  XLSX.writeFile(workbook, "categories_list.xlsx");
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Name', 'Icon', 'Color', 'Products Count']],
    body: filteredCategories.value.map(category => [
      category.name,
      category.icon || '-',
      category.color || '-',
      category.products_count
    ])
  });
  doc.save("categories_list.pdf");
};
</script>

<style scoped>
/* Keep the same styles as before and add any category-specific styles if needed */
</style> 