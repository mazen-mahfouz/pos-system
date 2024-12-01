<template>
  <div class="mx-auto px-6">
    <h1 class="text-3xl font-bold mb-8 text-start text-gray-800">Manage Items</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center space-x-4">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass-20-solid"
            placeholder="Search items..."
            class="w-64"
          />
          <USelect
            v-model="filterCategory"
            :options="['All', 'Coffee', 'Drinks', 'Cake', 'Molten Cake']"
            placeholder="Filter by category"
            class="w-48"
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
            Add Item
          </UButton>
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-4">
        <USpinner />
      </div>

      <div v-else-if="error" class="text-red-500 text-center py-4">
        {{ error }}
      </div>

      <UTable
        v-else
        :columns="columns"
        :rows="filteredItems"
        :sort="{ column: 'name', direction: 'asc' }"
      >
        <template #image-data="{ row }">
          <NuxtImg
            :src="row.image || '/img/notfound.png'"
            loading="eager"
            alt=""
            class="w-full h-[60px] lg:h-[70px] xl:h-[60px] xl:w-[60px] mb-[8px] rounded-[12px] !object-contain"
          />
        </template>
        <template #category-data="{ row }">
          <UBadge :color="getCategoryColor(row.category.name)">
            {{ row.category.name }}
          </UBadge>
        </template>
        <template #status-data="{ row }">
          <UBadge :color="row.status === 'true' ? 'green' : 'red'">
            {{ row.status === 'true' ? 'Active' : 'Inactive' }}
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
            color="gray"
            variant="soft"
            @click="openItemDetails(row)"
          >
            Details
          </UButton>
          <UButton
            color="red"
            variant="soft"
            @click="deleteItem(row)"
          >
            Delete
          </UButton>
        </template>
      </UTable>
    </div>

    <UModal v-model="isAddEditModalOpen" :prevent-close="true">
      <UCard class="w-full max-w-2xl">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-semibold text-gray-800">
              {{ isEditing ? 'Edit Item' : 'Add New Item' }}
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
          @submit="submitItem" 
          :validation-schema="itemSchema" 
          :initial-values="selectedItem"
          v-slot="{ errors }"
        >
          <div class="space-y-6">
            <div>
              <label for="name" class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
                <span class="text-[14px]">Item Name</span>
                <div class="flex items-center w-full">
                  <Icon name="mdi:food" class="text-pink-500 text-[22px]" />
                  <Field
                    name="name"
                    type="text"
                    required
                    class="block w-full px-3 py-7 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input"
                    :class="{ 'border-red-500': errors.name }"
                    placeholder="Enter item name"
                  />
                </div>
              </label>
              <ErrorMessage name="name" class="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <label for="category" class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
                <span class="text-[14px]">Category</span>
                <div class="flex items-center w-full">
                  <Icon name="mdi:category" class="text-pink-500 text-[22px]" />
                  <Field
                    as="select"
                    name="category_id"
                    required
                    class="block w-full px-3 py-7 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input custom-select"
                    :class="{ 'border-red-500': errors.category_id }"
                  >
                    <option value="">Select a category</option>
                    <option v-for="category in categories.categories" :key="category.id" :value="category.id">
                      {{ category.name }}
                    </option>
                  </Field>
                </div>
              </label>
              <ErrorMessage name="category_id" class="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <label for="price" class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
                <span class="text-[14px]">Price</span>
                <div class="flex items-center w-full">
                  <Icon name="mdi:currency-usd" class="text-pink-500 text-[22px]" />
                  <Field
                    name="price"
                    type="number"
                    step="0.01"
                    required
                    class="block w-full px-3 py-7 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input"
                    :class="{ 'border-red-500': errors.price }"
                    placeholder="Enter item price"
                  />
                </div>
              </label>
              <ErrorMessage name="price" class="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <label for="description" class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
                <span class="text-[14px]">Description</span>
                <div class="flex items-center w-full">
                  <Icon name="mdi:text-description" class="text-pink-500 text-[22px]" />
                  <Field
                    name="description"
                    as="textarea"
                    class="block w-full px-3 py-7 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input"
                    :class="{ 'border-red-500': errors.description }"
                    placeholder="Enter item description"
                  />
                </div>
              </label>
              <ErrorMessage name="description" class="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <label for="image" class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col">
                <span class="text-[14px]">Item Image</span>
                <div class="flex items-center w-full">
                  <input
                    type="file"
                    @change="handleImageUpload"
                    accept="image/*"
                    class="hidden"
                    ref="fileInput"
                  />
                  <div 
                    class="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer"
                    @click="$refs.fileInput.click()"
                  >
                    <img v-if="imagePreview" :src="imagePreview" alt="Preview" class="max-h-full max-w-full object-contain" />
                    <div v-else class="text-gray-500 text-center">
                      <Icon name="mdi:image" class="text-4xl mb-2 mx-auto" />
                      <p>Click to upload image</p>
                    </div>
                  </div>
                </div>
              </label>
              <ErrorMessage name="image" class="text-red-500 text-xs mt-1" />
            </div>

            <div class="flex justify-end">
              <UButton type="submit" color="pink" class="px-6 py-3">
                {{ isEditing ? 'Update' : 'Add' }} Item
              </UButton>
            </div>
          </div>
        </Form>
      </UCard>
    </UModal>

    <UModal v-model="isDetailsModalOpen">
      <UCard v-if="selectedItem" class="w-full max-w-4xl">
        <template #header>
          <div class="px-4 py-1 flex justify-between items-center">
            <h3 class="text-[18px] font-[500] text-gray-800">Item Details</h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="closeDetailsModal" />
          </div>
        </template>

        <div class="py-1 px-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <!-- Item Info Cards -->
          <div class="grid grid-cols-2 md:grid-cols-2 gap-2">
            <div class="bg-[#fafafa] p-3 rounded-lg">
              <div class="flex items-center gap-2">
                <div class="bg-[#e1e1e100]">
                  <Icon name="mdi:food" size="14" class="text-[#2b3c5e]" />
                </div>
                <span class="text-[13px] text-gray-600">Item Name</span>
              </div>
              <p class="mt-1.5 text-[13px] font-bold text-[#2b3c5e]">{{ selectedItem.name }}</p>
            </div>

            <div class="bg-[#fafafa] p-3 rounded-lg">
              <div class="flex items-center gap-2">
                <div class="bg-[#e1e1e100]">
                  <Icon name="mdi:category" size="14" class="text-[#2b3c5e]" />
                </div>
                <span class="text-[13px] text-gray-600">Category</span>
              </div>
              <UBadge 
                :color="getCategoryColor(selectedItem.category.name)"
                class="mt-1.5"
                size="xs"
              >
                {{ selectedItem.category.name }}
              </UBadge>
            </div>

            <div class="bg-[#fafafa] p-3 rounded-lg">
              <div class="flex items-center gap-2">
                <div class="bg-[#e1e1e100]">
                  <Icon name="mdi:currency-gbp" size="14" class="text-[#2b3c5e]" />
                </div>
                <span class="text-[13px] text-gray-600">Price</span>
              </div>
              <p class="mt-1.5 text-[13px] font-medium text-gray-900">£{{ selectedItem.price }}</p>
            </div>

            <div class="bg-[#fafafa] p-3 rounded-lg">
              <div class="flex items-center gap-2">
                <div class="bg-[#e1e1e100]">
                  <Icon name="mdi:text-description" size="14" class="text-[#2b3c5e]" />
                </div>
                <span class="text-[13px] text-gray-600">Description</span>
              </div>
              <p class="mt-1.5 text-[13px] font-medium text-gray-900 truncate">{{ selectedItem.description }}</p>
            </div>
          </div>

          <!-- Item Image -->
          <div class="bg-[#fafafa] p-4 rounded-lg">
            <div class="flex items-center gap-2 mb-2">
              <Icon name="mdi:image" size="14" class="text-[#2b3c5e]" />
              <span class="text-[13px] text-gray-600">Item Image</span>
            </div>
            <img 
              :src="selectedItem.image || '/img/notfound.png'" 
              :alt="selectedItem.name" 
              class="w-full h-64 object-contain rounded-lg"
            >
          </div>

          <!-- Recipe Section (if available) -->
          <div v-if="selectedItem.recipe && selectedItem.recipe.length > 0" class="bg-[#fafafa] p-4 rounded-lg">
            <div class="flex items-center gap-2 mb-2">
              <Icon name="mdi:book-open" size="14" class="text-[#2b3c5e]" />
              <span class="text-[13px] text-gray-600">Recipe</span>
            </div>
            <ul class="list-disc pl-5">
              <li v-for="item in selectedItem.recipe" :key="item.id" class="text-[13px] text-gray-900">
                {{ item.name }}
              </li>
            </ul>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-between items-center pt-3">
            <div class="flex gap-2">
              <!-- <UButton
                color="gray"
                variant="soft"
                size="xs"
                @click="printItemDetails"
              >
                <Icon name="mdi:printer" size="16" class="mr-1" />
                Print
              </UButton> -->
            </div>
            <UButton
              color="gray"
              variant="solid"
              size="xs"
              @click="closeDetailsModal"
            >
              Close
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <UModal v-model="isDeleteModalOpen">
      <UCard class="w-full">
        <div class="text-center">
          <Icon name="mdi:alert-circle" class="text-red-500 text-5xl mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Confirm Deletion</h3>
          <p class="text-sm text-gray-500 mb-6">
            Are you sure you want to delete this item? This action cannot be undone.
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
import { useAuthStore } from "~/stores/auth";

definePageMeta({
  layout: 'admin',
});

const AuthStore = useAuthStore();
const pageTitle = useState("pageTitle");
pageTitle.value = "/ Items";

const columns = [
  { key: 'image', label: 'Image' },
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
  { key: 'price', label: 'Price' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Actions' },
];

const items = ref([]);
const categories = ref([]);
const searchQuery = ref('');
const filterCategory = ref('All');
const isLoading = ref(false);
const error = ref(null);

const isDetailsModalOpen = ref(false);
const isAddEditModalOpen = ref(false);
const selectedItem = ref(null);
const isEditing = ref(false);
const imagePreview = ref(null);
const file = ref(null);

const itemSchema = object({
  name: string().required('Item name is required'),
  category_id: string().required('Category is required'),
  price: number().required('Price is required').positive('Price must be positive'),
  description: string().required('Description is required'),
});

const fetchItems = () => {
  isLoading.value = true;
  error.value = null;
  useApi('products', 'GET')
    .then(response => {
      items.value = response;
      isLoading.value = false;
    })
    .catch(err => {
      error.value = 'Failed to fetch items';
      HandleReqErrors(err);
      isLoading.value = false;
    });
};

const fetchCategories = () => {
  useApi('categories', 'GET')
    .then(response => {
      categories.value = response;
    })
    .catch(err => {
      console.error('Failed to fetch categories:', err);
      HandleReqErrors(err);
    });
};

onMounted(() => {
  fetchItems();
  fetchCategories();
});

const filteredItems = computed(() => {
  return items.value.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = filterCategory.value === 'All' || item.category.name === filterCategory.value;
    return matchesSearch && matchesCategory;
  });
});

const getCategoryColor = (category) => {
  switch (category) {
    case 'Coffee': return 'black';
    case 'Drinks': return 'blue';
    case 'Cake': return 'yellow';
    case 'Molten Cake': return 'orange';
    default: return 'gray';
  }
};

const fetchProductById = (productId) => {
  isLoading.value = true;
  error.value = null;
  return useApi(`products/${productId}`, 'GET')
    .then(response => {
      isLoading.value = false;
      return response;
    })
    .catch(err => {
      error.value = 'Failed to fetch product details';
      HandleReqErrors(err);
      isLoading.value = false;
      return null;
    });
};

const openItemDetails = (item) => {
  selectedItem.value = item;
  isDetailsModalOpen.value = true;
};

const openEditModal = (item) => {
  isEditing.value = true;
  selectedItem.value = {
    id: item.id,
    name: item.name,
    category_id: item.category.id.toString(),
    price: item.price,
    description: item.description,
    image: item.image
  };
  imagePreview.value = item.image || null;
  isAddEditModalOpen.value = true;
};

const closeDetailsModal = () => {
  isDetailsModalOpen.value = false;
  selectedItem.value = null;
};

const openAddModal = () => {
  isEditing.value = false;
  selectedItem.value = { name: '', category_id: '', price: '', description: '', image: '' };
  imagePreview.value = null;
  isAddEditModalOpen.value = true;
};

const closeAddEditModal = () => {
  isAddEditModalOpen.value = false;
  selectedItem.value = null;
  imagePreview.value = null;
  isEditing.value = false;
  file.value = null;
};

const handleImageUpload = (event) => {
  file.value = event.target.files[0];
  console.log(file.value);
  if (file.value) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
      selectedItem.value.image = e.target.result;
    };
    reader.readAsDataURL(file.value);
  }
};

const submitItem = async (values) => {
  try {
    const formData = new FormData();
    const dataToSend = {
      name: values.name,
      category_id: values.category_id,
      price: values.price,
      description: values.description,
    };

    if (file.value) {
      formData.append('image', file.value);
    }

    const apiEndpoint = isEditing.value ? `products/${selectedItem.value.id}` : 'products';
    const method = isEditing.value ? 'POST' : 'POST';

    const response = await useApi(apiEndpoint, method, {
      type: 'json',
      data: dataToSend
    });

    if (response) {
      await fetchItems();
      closeAddEditModal();
      push.success(isEditing.value ? 'Item updated successfully' : 'Item added successfully');
    }
  } catch (error) {
    console.error('Failed to submit item:', error);
    HandleReqErrors(error);
  }
};

const isDeleteModalOpen = ref(false);
const itemToDelete = ref(null);

const deleteItem = (item) => {
  itemToDelete.value = item;
  isDeleteModalOpen.value = true;
};

const confirmDelete = () => {
  useApi(`products/${itemToDelete.value.id}`, 'DELETE')
    .then(() => {
      items.value = items.value.filter(i => i.id !== itemToDelete.value.id);
      push.success('Item deleted successfully');
      isDeleteModalOpen.value = false;
    })
    .catch(error => {
      HandleReqErrors(error);
    });
};

const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(filteredItems.value.map(item => ({
    Name: item.name,
    Category: item.category.name,
    Price: item.price,
    Description: item.description
  })));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Items");
  XLSX.writeFile(workbook, "cafe_items.xlsx");
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Name', 'Category', 'Price', 'Description']],
    body: filteredItems.value.map(item => [
      item.name,
      item.category.name,
      `$${item.price.toFixed(2)}`,
      item.description
    ])
  });
  doc.save("cafe_items.pdf");
};

const printItemDetails = () => {
  if (selectedItem.value) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(selectedItem.value.name, 105, 20, null, null, 'center');
    doc.setFontSize(12);
    doc.addImage(selectedItem.value.image, 'JPEG', 15, 30, 180, 100);
    doc.text(`Category: ${selectedItem.value.category.name}`, 20, 140);
    doc.text(`Price: $${selectedItem.value.price.toFixed(2)}`, 20, 150);
    doc.text(`Description: ${selectedItem.value.description}`, 20, 160, { maxWidth: 170 });
    doc.save(`${selectedItem.value.name}_details.pdf`);
  }
};
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

.custom-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23999' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
</style>