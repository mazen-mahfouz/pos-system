<template>
  <div class="mx-auto px-6">
    <h1 class="text-3xl font-bold mb-8 text-start text-gray-800">Manage Recipes</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- Search and Actions Bar -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center space-x-4">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass-20-solid"
            placeholder="Search recipes..."
            class="w-64"
          />
        </div>
        <div class="flex items-center space-x-2">
          <UButton
            color="green"
            variant="soft"
            icon="i-heroicons-document-arrow-down"
            @click="exportToExcel"
          >ئ
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
            Add Recipe
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

      <!-- Recipes Table -->
      <UTable
        v-else
        :columns="columns"
        :rows="filteredRecipes"
        :sort="{ column: 'name', direction: 'asc' }"
      >
        <template #name-data="{ row }">
          <div class="flex items-center">
            <Icon name="mdi:book-open-page-variant" class="text-pink-500 mr-2" />
            <span>{{ row.name }}</span>
          </div>
        </template>
        <template #materials-data="{ row }">
          <div class="flex flex-wrap gap-1">
            <UBadge
              v-for="material in row.materials.slice(0, 3)"
              :key="material.id"
              color="blue"
              class="mr-1"
            >
              {{ material.name }}
            </UBadge>
            <UBadge
              v-if="row.materials.length > 3"
              color="gray"
              class="mr-1"
            >
              +{{ row.materials.length - 3 }} more
            </UBadge>
          </div>
        </template>
        <template #action-data="{ row }">
          <div class="flex space-x-2">
            <UButton
              color="gray"
              variant="soft"
              icon="i-heroicons-eye"
              @click="openDetailsModal(row)"
            />
            <UButton
              color="blue"
              variant="soft"
              icon="i-heroicons-pencil-square"
              @click="openEditModal(row)"
            />
            <UButton
              color="red"
              variant="soft"
              icon="i-heroicons-trash"
              @click="deleteRecipe(row)"
            />
          </div>
        </template>
      </UTable>
    </div>

    <!-- Details Modal -->
    <UModal v-model="isDetailsModalOpen">
      <UCard class="w-full max-w-3xl">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-semibold text-gray-800 flex items-center">
              <Icon name="mdi:book-open-page-variant" class="text-pink-500 mr-2 text-2xl" />
              {{ selectedRecipe?.name }}
            </h3>
            <UButton 
              color="gray" 
              variant="ghost" 
              icon="i-heroicons-x-mark" 
              @click="closeDetailsModal" 
            />
          </div>
        </template>

        <div class="space-y-6" v-if="selectedRecipe">
          <!-- Instructions -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-medium text-gray-700 mb-2 flex items-center">
              <Icon name="mdi:clipboard-text" class="text-pink-500 mr-2" />
              Instructions
            </h4>
            <p class="text-gray-600 whitespace-pre-line">{{ selectedRecipe.instructions }}</p>
          </div>

          <!-- Materials List -->
          <div>
            <h4 class="font-medium text-gray-700 mb-4 flex items-center">
              <Icon name="mdi:package-variant" class="text-pink-500 mr-2" />
              Required Materials
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                v-for="material in selectedRecipe.materials" 
                :key="material.id"
                class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h5 class="font-medium text-gray-800">{{ material.name }}</h5>
                    <p class="text-sm text-gray-500">{{ material.unit }}</p>
                  </div>
                  <UBadge color="pink">
                    {{ material.pivot.material_quantity }}
                  </UBadge>
                </div>
                <div class="mt-2 text-sm text-gray-600">
                  Purchase Price: ${{ material.purchase_price }}
                </div>
              </div>
            </div>
          </div>

          <!-- Recipe Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div class="bg-pink-50 p-4 rounded-lg">
              <div class="text-pink-500 text-sm font-medium">Total Materials</div>
              <div class="text-2xl font-bold text-gray-800">
                {{ selectedRecipe.materials.length }}
              </div>
            </div>
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="text-blue-500 text-sm font-medium">Created</div>
              <div class="text-sm font-medium text-gray-800">
                {{ new Date(selectedRecipe.created_at).toLocaleDateString() }}
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="isDeleteModalOpen">
      <UCard class="w-full">
        <div class="text-center">
          <Icon name="mdi:alert-circle" class="text-red-500 text-5xl mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Confirm Deletion</h3>
          <p class="text-sm text-gray-500 mb-6">
            Are you sure you want to delete this recipe? This action cannot be undone.
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

    <AddEditModal
      v-model="isAddEditModalOpen"
      :is-editing="isEditing"
      :recipe="selectedRecipe"
      @submit="handleRecipeSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import HandleReqErrors from "~/helpers/HandleReqErrors.js";
import AddEditModal from "~/components/recipes/AddEditModal.vue";

definePageMeta({
  layout: 'admin',
});

const pageTitle = useState("pageTitle");
pageTitle.value = "/ Recipes";

const columns = [
  { key: 'name', label: 'Recipe Name' },
  { key: 'materials', label: 'Materials' },
  { key: 'action', label: 'Actions' },
];

// State management
const recipes = ref([]);
const searchQuery = ref('');
const isLoading = ref(false);
const error = ref(null);
const isDetailsModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const selectedRecipe = ref(null);
const recipeToDelete = ref(null);
const isAddEditModalOpen = ref(false);
const isEditing = ref(false);

// Computed properties
const filteredRecipes = computed(() => {
  return recipes.value.filter(recipe => {
    return recipe.name.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

// API calls
const fetchRecipes = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await useApi('recipes', 'GET');
    recipes.value = response;
  } catch (err) {
    error.value = 'Failed to fetch recipes';
    HandleReqErrors(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchRecipes();
});

// Modal handlers
const openDetailsModal = (recipe) => {
  selectedRecipe.value = recipe;
  isDetailsModalOpen.value = true;
};

const closeDetailsModal = () => {
  isDetailsModalOpen.value = false;
  selectedRecipe.value = null;
};

// Delete handlers
const deleteRecipe = (recipe) => {
  recipeToDelete.value = recipe;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  try {
    await useApi(`recipes/${recipeToDelete.value.id}`, 'DELETE');
    recipes.value = recipes.value.filter(r => r.id !== recipeToDelete.value.id);
    push.success('Recipe deleted successfully');
    isDeleteModalOpen.value = false;
  } catch (error) {
    HandleReqErrors(error);
  }
};

// Export functions
const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(filteredRecipes.value.map(recipe => ({
    Name: recipe.name,
    Instructions: recipe.instructions,
    'Materials Count': recipe.materials.length,
    Materials: recipe.materials.map(m => m.name).join(', '),
  })));
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Recipes");
  XLSX.writeFile(workbook, "recipes_list.xlsx");
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Name', 'Instructions', 'Materials Count']],
    body: filteredRecipes.value.map(recipe => [
      recipe.name,
      recipe.instructions,
      recipe.materials.length
    ])
  });
  doc.save("recipes_list.pdf");
};

const openAddModal = () => {
  isEditing.value = false;
  selectedRecipe.value = null;
  isAddEditModalOpen.value = true;
};

const openEditModal = (recipe) => {
  isEditing.value = true;
  selectedRecipe.value = recipe;
  isAddEditModalOpen.value = true;
};

const handleRecipeSubmit = async (values) => {
  try {
    const endpoint = isEditing.value ? `recipes/${selectedRecipe.value.id}` : 'recipes';
    const method = isEditing.value ? 'POST' : 'POST';
    
    // تأكد إضافي من تنسيق البيانات
    const requestData = {
      name: values.name,
      instructions: values.instructions,
      product_id: Number(values.product_id),
      materials: values.materials.map(mat => ({
        material_id: Number(mat.material_id),
        material_quantity: Number(mat.material_quantity)
      }))
    };

    // طباعة للتأكد من شكل البيانات قبل الإرسال للAPI
    console.log('Request Data:', requestData);

    await useApi(endpoint, method, {
      type: 'object',
      data: requestData
    });
    
    await fetchRecipes();
    isAddEditModalOpen.value = false;
    push.success(isEditing.value ? 'Recipe updated successfully' : 'Recipe created successfully');
  } catch (error) {
    HandleReqErrors(error);
  }
};
</script> 