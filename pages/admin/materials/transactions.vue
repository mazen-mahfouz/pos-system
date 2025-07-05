<template>
  <div class="mx-auto px-6">
    <h1 class="text-3xl font-bold mb-8 text-start text-gray-800">Material Transactions History</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- Date Range Filter -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center space-x-4">
          <UInput
            v-model="startDate"
            type="date"
            class="w-48"
          />
          <span class="text-gray-500">to</span>
          <UInput
            v-model="endDate"
            type="date"
            class="w-48"
          />
          <UButton
            color="blue"
            variant="soft"
            @click="fetchTransactions"
          >
            Apply Filter
          </UButton>
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
        </div>
      </div>

      <!-- Loading and Error States -->
      <div v-if="isLoading" class="text-center py-4">
        <USpinner />
      </div>

      <div v-else-if="error" class="text-red-500 text-center py-4">
        {{ error }}
      </div>

      <!-- Transactions Table -->
      <UTable
        v-else
        :columns="columns"
        :rows="transactions"
        :sort="{ column: 'created_at', direction: 'desc' }"
      >
        <template #material-data="{ row }">
          <div class="flex flex-col">
            <span class="font-medium">{{ row.material.name }}</span>
            <span class="text-sm text-gray-500">
              {{ row.material.stock_unit }} / {{ row.material.recipe_unit }}
            </span>
          </div>
        </template>
        <template #type-data="{ row }">
          <UBadge
            :color="getTypeColor(row.type)"
            variant="subtle"
            size="sm"
          >
            {{ row.type }}
          </UBadge>
        </template>
        <template #quantity-data="{ row }">
          <span :class="Number(row.quantity) < 0 ? 'text-red-500' : 'text-green-500'">
            {{ Number(row.quantity) < 0 ? '' : '+' }}{{ row.quantity }} {{ row.material.stock_unit }}
          </span>
        </template>
        <template #unit_cost-data="{ row }">
          ${{ row.unit_cost }}
        </template>
        <template #remaining_quantity-data="{ row }">
          {{ row.remaining_quantity }} {{ row.material.stock_unit }}
        </template>
        <template #created_at-data="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </UTable>

      <!-- Empty State -->
      <div v-if="!isLoading && !error && !transactions.length" class="text-center py-12">
        <Icon name="mdi:history" class="text-gray-400 text-4xl mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
        <p class="text-sm text-gray-500">
          Try adjusting your date range to see more transactions.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import HandleReqErrors from "~/helpers/HandleReqErrors.js";

definePageMeta({
  layout: 'admin',
});

const pageTitle = useState("pageTitle");
pageTitle.value = "/ Materials / Transactions";

const columns = [
  { key: 'material', label: 'Material' },
  { key: 'type', label: 'Type' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'unit_cost', label: 'Unit Cost' },
  { key: 'remaining_quantity', label: 'Remaining Quantity' },
  { key: 'created_at', label: 'Date' },
];

// State
const transactions = ref([]);
const isLoading = ref(false);
const error = ref(null);
const startDate = ref(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
const endDate = ref(new Date().toISOString().split('T')[0]);

// Methods
const getTypeColor = (type) => {
  const colors = {
    'receipt': 'green',
    'adjustment': 'blue',
    'remove': 'red',
    'add': 'emerald'
  };
  return colors[type] || 'gray';
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const fetchTransactions = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await useApi('inventory/history', 'POST', {
      type: 'object',
      data: {
        from: startDate.value,
        to: endDate.value
      }
    });
    transactions.value = response.transactions;
  } catch (err) {
    error.value = 'Failed to fetch transactions';
    HandleReqErrors(err);
  } finally {
    isLoading.value = false;
  }
};

const exportToExcel = () => {
  const exportData = transactions.value.map(t => ({
    'Material': t.material.name,
    'Type': t.type,
    'Quantity': `${t.quantity} ${t.material.stock_unit}`,
    'Unit Cost': `$${t.unit_cost}`,
    'Remaining Quantity': `${t.remaining_quantity} ${t.material.stock_unit}`,
    'Date': formatDate(t.created_at),
    'Stock Unit': t.material.stock_unit,
    'Recipe Unit': t.material.recipe_unit,
    'Conversion Rate': t.material.conversion_rate
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
  XLSX.writeFile(workbook, `material_transactions_${startDate.value}_to_${endDate.value}.xlsx`);
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Material', 'Type', 'Quantity', 'Unit Cost', 'Remaining', 'Date']],
    body: transactions.value.map(t => [
      t.material.name,
      t.type,
      `${t.quantity} ${t.material.stock_unit}`,
      `$${t.unit_cost}`,
      `${t.remaining_quantity} ${t.material.stock_unit}`,
      formatDate(t.created_at)
    ])
  });
  doc.save(`material_transactions_${startDate.value}_to_${endDate.value}.pdf`);
};

onMounted(() => {
  fetchTransactions();
});
</script> 