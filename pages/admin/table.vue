<template>
  <div class="mx-auto px-6">
    <h1 class="text-3xl font-bold mb-8 text-start text-gray-800">Cafe Tables</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex justify-between items-center mb-6 flex-wrap gap-[20px]">
        <div class="flex items-center space-x-4">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass-20-solid"
            placeholder="Search tables..."
            class="w-64"
          />
          <USelect
            v-model="filterStatus"
            :options="['All', 'Available', 'Occupied']"
            placeholder="Filter by status"
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
            Add Table
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
        :rows="filteredTables"
        :sort="{ column: 'number', direction: 'asc' }"
      >
        <template #status-data="{ row }">
          <UBadge :color="row.is_free === 1 ? 'green' : 'red'">
            {{ row.is_free === 1 ? 'Available' : 'Occupied' }}
          </UBadge>
        </template>
        <template #action-data="{ row }">
          <UButton
            color="red"
            variant="soft"
            :disabled="row.is_free === 0"
            @click="openDeleteModal(row)"
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
            <h3 class="text-xl font-semibold text-gray-800">{{ isEditing ? 'Edit Table' : 'Add New Table' }}</h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="closeAddEditModal" />
          </div>
        </template>
        <Form @submit="submitTable" :validation-schema="tableSchema" v-slot="{ errors }">
          <div class="space-y-6">
            <div>
              <label for="number" class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
                <span class="text-[14px]">Table Number</span>
                <div class="flex items-center w-full">
                  <Icon name="mdi:table" class="text-pink-500 text-[22px]" />
                  <Field
                    name="number"
                    type="text"
                    required
                    class="block w-full px-3 py-7 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input"
                    :class="{ 'border-red-500': errors.number }"
                    placeholder="Enter table number"
                  />
                </div>
              </label>
              <ErrorMessage name="number" class="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <label for="capacity" class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
                <span class="text-[14px]">Capacity</span>
                <div class="flex items-center w-full">
                  <Icon name="mdi:account-group" class="text-pink-500 text-[22px]" />
                  <Field
                    name="capacity"
                    type="number"
                    required
                    class="block w-full px-3 py-7 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input"
                    :class="{ 'border-red-500': errors.capacity }"
                    placeholder="Enter table capacity"
                  />
                </div>
              </label>
              <ErrorMessage name="capacity" class="text-red-500 text-xs mt-1" />
            </div>


            <div class="flex justify-end">
              <UButton type="submit" color="pink" class="px-6 py-3">
                {{ isEditing ? 'Update' : 'Add' }} Table
              </UButton>
            </div>
          </div>
        </Form>
      </UCard>
    </UModal>

    <UModal v-model="isDeleteModalOpen">
      <UCard class="w-full">
        <div class="text-center">
          <Icon name="mdi:alert-circle" class="text-red-500 text-5xl mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Confirm Deletion</h3>
          <p class="text-sm text-gray-500 mb-6">
            Are you sure you want to delete this table? This action cannot be undone.
          </p>
          <div class="flex justify-center space-x-4">
            <UButton
              color="gray"
              variant="soft"
              @click="closeDeleteModal"
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
import { object, string, number, boolean } from 'yup';
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
pageTitle.value = "/ Tables";

const columns = [
  { key: 'number', label: 'Table Number' },
  { key: 'capacity', label: 'Capacity' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Actions' },
];

const tables = ref([]);
const searchQuery = ref('');
const filterStatus = ref('All');
const isLoading = ref(false);
const error = ref(null);

const isAddEditModalOpen = ref(false);
const isEditing = ref(false);

const tableSchema = object({
  number: string().required('Table number is required'),
  capacity: number().required('Capacity is required').positive().integer(),
});

const fetchTables = () => {
  isLoading.value = true;
  error.value = null;
  useApi('tables', 'GET')
    .then(response => {
      tables.value = response;
      isLoading.value = false;
    })
    .catch(err => {
      error.value = 'Failed to fetch tables';
      HandleReqErrors(err);
      isLoading.value = false;
    });
};

onMounted(() => {
  fetchTables();
});

const filteredTables = computed(() => {
  return tables.value.filter(table => {
    const matchesSearch = table.number.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesFilter = filterStatus.value === 'All' ||
                          (filterStatus.value === 'Available' && table.is_free === 1) ||
                          (filterStatus.value === 'Occupied' && table.is_free === 0);
    return matchesSearch && matchesFilter;
  });
});

const fetchTableById = (tableId) => {
  isLoading.value = true;
  error.value = null;
  return useApi(`tables/${tableId}`, 'GET')
    .then(response => {
      isLoading.value = false;
      return response;
    })
    .catch(err => {
      error.value = 'Failed to fetch table details';
      HandleReqErrors(err);
      isLoading.value = false;
      return null;
    });
};

const selectedTable = ref(null);

const openAddModal = () => {
  isEditing.value = false;
  selectedTable.value = { number: '', capacity: '', is_free: 1 };
  isAddEditModalOpen.value = true;
};

const closeAddEditModal = () => {
  isAddEditModalOpen.value = false;
  selectedTable.value = null;
};

const submitTable = (values) => {
  const apiEndpoint = isEditing.value ? `tables/${selectedTable.value.id}` : 'tables';
  const method = isEditing.value ? 'PUT' : 'POST';

  const dataToSubmit = {
    ...values,
    is_free: 1
  };

  useApi(apiEndpoint, method, { data: dataToSubmit })
    .then(response => {
      if (isEditing.value) {
        const index = tables.value.findIndex(t => t.id === selectedTable.value.id);
        if (index !== -1) {
          tables.value[index] = response;
        }
        push.success('Table updated successfully');
      } else {
        tables.value.push(response);
        push.success('Table added successfully');
      }
      closeAddEditModal();
      fetchTables();
    })
    .catch(error => {
      console.error('Failed to submit table:', error);
      HandleReqErrors(error);
    });
};

const isDeleteModalOpen = ref(false);
const tableToDelete = ref(null);

const openDeleteModal = (table) => {
  tableToDelete.value = table;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  tableToDelete.value = null;
};

const confirmDelete = () => {
  if (!tableToDelete.value) return;
  
  useApi(`tables/${tableToDelete.value.id}`, 'DELETE')
    .then(() => {
      tables.value = tables.value.filter(t => t.id !== tableToDelete.value.id);
      push.success('Table deleted successfully');
      closeDeleteModal();
    })
    .catch(error => {
      HandleReqErrors(error);
    });
};

const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(filteredTables.value.map(table => ({
    'Table Number': table.number,
    'Capacity': table.capacity,
    'Status': table.is_free ? 'Available' : 'Occupied'
  })));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tables");
  XLSX.writeFile(workbook, "cafe_tables.xlsx");
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Table Number', 'Capacity', 'Status']],
    body: filteredTables.value.map(table => [
      table.number,
      table.capacity,
      table.is_free ? 'Available' : 'Occupied'
    ])
  });
  doc.save("cafe_tables.pdf");
};

const printTableDetails = () => {
  if (selectedTable.value) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(selectedTable.value.number, 105, 20, null, null, 'center');
    doc.setFontSize(12);
    doc.text(`Capacity: ${selectedTable.value.capacity}`, 20, 40);
    doc.text(`Status: ${selectedTable.value.is_free ? 'Available' : 'Occupied'}`, 20, 50);
    doc.text(`Created At: ${new Date(selectedTable.value.created_at).toLocaleString()}`, 20, 60);
    doc.text(`Updated At: ${new Date(selectedTable.value.updated_at).toLocaleString()}`, 20, 70);
    doc.save(`${selectedTable.value.number}_details.pdf`);
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
