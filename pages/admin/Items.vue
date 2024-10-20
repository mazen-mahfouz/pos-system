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
          <img :src="row.image" :alt="row.name" class="w-16 h-16 object-cover rounded-md">
        </template>
        <template #category-data="{ row }">
          <UBadge :color="getCategoryColor(row.category.name)">
            {{ row.category.name }}
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
            @click="deleteItem(row.id)"
          >
            Delete
          </UButton>
        </template>
      </UTable>
    </div>

    <UModal v-model="isAddEditModalOpen">
      <UCard class="w-full max-w-2xl">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-semibold text-gray-800">{{ isEditing ? 'Edit Item' : 'Add New Item' }}</h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="closeAddEditModal" />
          </div>
        </template>
        <Form @submit="submitItem" :validation-schema="itemSchema" v-slot="{ errors }">
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
      <UCard class="w-full max-w-2xl">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-semibold text-gray-800">Item Details</h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="closeDetailsModal" />
          </div>
        </template>
        <div v-if="selectedItem" class="space-y-4">
          <img :src="selectedItem.image" :alt="selectedItem.name" class="w-full h-64 object-cover rounded-lg mb-4">
          <p class="text-2xl font-bold text-gray-800">{{ selectedItem.name }}</p>
          <p class="text-lg"><strong>Category:</strong> <UBadge :color="getCategoryColor(selectedItem.category.name)">{{ selectedItem.category.name }}</UBadge></p>
          <p class="text-lg"><strong>Price:</strong> ${{ selectedItem.price.toFixed(2) }}</p>
          <p class="text-lg"><strong>Description:</strong> {{ selectedItem.description }}</p>
          <UButton color="pink" @click="printItemDetails">Print Details</UButton>
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
  fetchProductById(item.id)
    .then(fullItemDetails => {
      if (fullItemDetails) {
        selectedItem.value = fullItemDetails;
        isDetailsModalOpen.value = true;
      }
    });
};

const openEditModal = (item) => {
  fetchProductById(item.id)
    .then(fullItemDetails => {
      if (fullItemDetails) {
        isEditing.value = true;
        selectedItem.value = { ...fullItemDetails, category_id: fullItemDetails.category.id };
        imagePreview.value = fullItemDetails.image;
        isAddEditModalOpen.value = true;
      }
    });
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
};

const file = ref(null);
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

const submitItem = (values) => {
  console.log(values);
  const formData = new FormData();
  Object.keys(values).forEach(key => {
    if (key === 'image' && values[key] instanceof File) {
      formData.append(key, values[key]);
    } else {
      formData.append(key, values[key]);
    }
  });

  const apiEndpoint = isEditing.value ? `products/${selectedItem.value.id}` : 'products';
  const method = isEditing.value ? 'POST' : 'POST';

  useApi(apiEndpoint, method, {
    type: 'json',
    data: { ...values, image: file.value }
  })
    .then(response => {
      if (isEditing.value) {
        const index = items.value.findIndex(i => i.id === selectedItem.value.id);
        if (index !== -1) {
          items.value[index] = response;
        }
        push.success('Item updated successfully');
      } else {
        items.value.push(response);
        push.success('Item added successfully');
      }
      closeAddEditModal();
      fetchItems();
    })
    .catch(error => {
      console.error('Failed to submit item:', error);
      HandleReqErrors(error);
    });
};

const deleteItem = (itemId) => {
  useApi(`products/${itemId}`, 'DELETE')
    .then(() => {
      items.value = items.value.filter(i => i.id !== itemId);
      push.success('Item deleted successfully');
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