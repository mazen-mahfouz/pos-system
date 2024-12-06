<template>
  <div class="mx-auto px-6">
    <h1 class="text-3xl font-bold mb-8 text-start text-gray-800">Coupons</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex justify-between items-center flex-wrap gap-[20px] mb-6">
        <div class="flex items-center space-x-4">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass-20-solid"
            placeholder="Search coupons..."
            class="w-64"
          />
          <USelect
            v-model="filterStatus"
            :options="['All', 'Active', 'Inactive']"
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
            Add Coupon
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
        :rows="paginatedCoupons"
        :sort="{ column: 'code', direction: 'asc' }"
      >
        <template #status-data="{ row }">
          <UBadge :color="row.isActive ? 'green' : 'red'">
            {{ row.isActive ? 'Active' : 'Inactive' }}
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
          <div class="inline-flex items-center">
            <USwitcher
              v-model="row.isActive"
              @update:modelValue="toggleCouponStatus(row)"
            />
          </div>
        </template>
      </UTable>

      <div class="mt-4 flex justify-center">
        <UPagination
          v-model="currentPage"
          :total="filteredCoupons.length"
          :per-page="perPage"
        />
      </div>
    </div>

    <UModal v-model="isAddEditModalOpen">
      <UCard class="w-full max-w-2xl">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-semibold text-gray-800">{{ isEditing ? 'Edit Coupon' : 'Add New Coupon' }}</h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="closeAddEditModal" />
          </div>
        </template>
        <Form @submit="submitCoupon" :validation-schema="couponSchema" v-slot="{ errors }">
          <div class="space-y-6">
            <div>
              <label for="code" class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
                <span class="text-[14px]">Coupon Code</span>
                <div class="flex items-center w-full">
                  <Icon name="mdi:ticket-percent" class="text-pink-500 text-[22px]" />
                  <Field
                    name="code"
                    type="text"
                    required
                    class="block w-full px-3 py-4 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input"
                    :class="{ 'border-red-500': errors.code }"
                    placeholder="Enter coupon code"
                  />
                </div>
              </label>
              <ErrorMessage name="code" class="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <label for="discount" class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
                <span class="text-[14px]">Discount (%)</span>
                <div class="flex items-center w-full">
                  <Icon name="mdi:percent" class="text-pink-500 text-[22px]" />
                  <Field
                    name="discount"
                    type="number"
                    required
                    class="block w-full px-3 py-4 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input"
                    :class="{ 'border-red-500': errors.discount }"
                    placeholder="Enter discount percentage"
                  />
                </div>
              </label>
              <ErrorMessage name="discount" class="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <label for="expiryDate" class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
                <span class="text-[14px]">Expiry Date</span>
                <div class="flex items-center w-full">
                  <Icon name="mdi:calendar" class="text-pink-500 text-[22px]" />
                  <Field
                    name="expiryDate"
                    type="date"
                    required
                    class="block w-full px-3 py-4 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input"
                    :class="{ 'border-red-500': errors.expiryDate }"
                  />
                </div>
              </label>
              <ErrorMessage name="expiryDate" class="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <label for="isActive" class="flex items-center space-x-2">
                <Field
                  name="isActive"
                  type="checkbox"
                  v-slot="{ field }"
                >
                  <input
                    type="checkbox"
                    v-bind="field"
                    class="form-checkbox h-5 w-5 text-pink-500"
                  />
                </Field>
                <span class="text-gray-700">Active</span>
              </label>
            </div>

            <div class="flex justify-end">
              <UButton type="submit" color="pink" class="px-6 py-3">
                {{ isEditing ? 'Update' : 'Add' }} Coupon
              </UButton>
            </div>
          </div>
        </Form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
})

const pageTitle = useState("pageTitle");
pageTitle.value = "/ Coupons";

import { Form, Field, ErrorMessage } from 'vee-validate';
import { object, string, number, date, boolean } from 'yup';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const columns = [
  { key: 'code', label: 'Coupon Code' },
  { key: 'discount', label: 'Discount (%)' },
  { key: 'expiryDate', label: 'Expiry Date' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Actions' },
];

const coupons = ref([
  { id: 1, code: 'SUMMER10', discount: 10, expiryDate: '2023-08-31', isActive: true },
  { id: 2, code: 'FALL20', discount: 20, expiryDate: '2023-11-30', isActive: false },
  { id: 3, code: 'WINTER15', discount: 15, expiryDate: '2023-12-31', isActive: true },
  // ... (other coupon data)
]);
const searchQuery = ref('');
const filterStatus = ref('All');
const isLoading = ref(false);
const error = ref(null);

const isAddEditModalOpen = ref(false);
const selectedCoupon = ref(null);
const isEditing = ref(false);

const currentPage = ref(1);
const perPage = 10;

const couponSchema = object({
  code: string().required('Coupon code is required'),
  discount: number().required('Discount is required').positive().max(100),
  expiryDate: date().required('Expiry date is required').min(new Date(), 'Expiry date must be in the future'),
  isActive: boolean(),
});

// Fetch coupons from API
const fetchCoupons = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const { data } = await useFetch('/api/coupons');
    // coupons.value = data.value;
  } catch (err) {
    error.value = 'Failed to fetch coupons';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

// Call fetchCoupons when component is mounted
onMounted(fetchCoupons);

const filteredCoupons = computed(() => {
  return coupons.value.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesFilter = filterStatus.value === 'All' ||
                          (filterStatus.value === 'Active' && coupon.isActive) ||
                          (filterStatus.value === 'Inactive' && !coupon.isActive);
    return matchesSearch && matchesFilter;
  });
});

const paginatedCoupons = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  const end = start + perPage;
  return filteredCoupons.value.slice(start, end);
});

const openAddModal = () => {
  isEditing.value = false;
  selectedCoupon.value = { code: '', discount: '', expiryDate: '', isActive: true };
  isAddEditModalOpen.value = true;
};

const openEditModal = (coupon) => {
  isEditing.value = true;
  selectedCoupon.value = { ...coupon };
  isAddEditModalOpen.value = true;
};

const closeAddEditModal = () => {
  isAddEditModalOpen.value = false;
  selectedCoupon.value = null;
};

const submitCoupon = async (values) => {
  try {
    if (isEditing.value) {
      await updateCoupon(values);
    } else {
      await addCoupon(values);
    }
    closeAddEditModal();
    await fetchCoupons(); // Refresh the coupon list
  } catch (err) {
    console.error('Failed to submit coupon:', err);
    // Handle error (e.g., show error message to user)
  }
};

const addCoupon = async (couponData) => {
  const { data, error } = await useFetch('/api/coupons', {
    method: 'POST',
    body: couponData,
  });
  if (error.value) throw error.value;
  return data;
};

const updateCoupon = async (couponData) => {
  const { data, error } = await useFetch(`/api/coupons/${couponData.id}`, {
    method: 'PUT',
    body: couponData,
  });
  if (error.value) throw error.value;
  return data;
};

const toggleCouponStatus = async (coupon) => {
  try {
    await updateCoupon({ ...coupon, isActive: !coupon.isActive });
    await fetchCoupons(); // Refresh the coupon list
  } catch (err) {
    console.error('Failed to toggle coupon status:', err);
    // Handle error (e.g., show error message to user)
  }
};

const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(filteredCoupons.value);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Coupons");
  XLSX.writeFile(workbook, "coupons.xlsx");
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [columns.map(col => col.label)],
    body: filteredCoupons.value.map(coupon => [
      coupon.code,
      `${coupon.discount}%`,
      coupon.expiryDate,
      coupon.isActive ? 'Active' : 'Inactive',
    ])
  });
  doc.save("coupons.pdf");
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
</style>