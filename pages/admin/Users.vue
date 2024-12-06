<template>
  <div class="mx-auto px-6">
    <h1 class="text-3xl font-bold mb-8 text-start text-gray-800">Manage Users</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- Search and Actions Bar -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center space-x-4">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass-20-solid"
            placeholder="Search users..."
            class="w-64"
          />
          <USelect
            v-model="filterRole"
            :options="['All', 'Admin', 'Cashier', 'Waiter']"
            placeholder="Filter by role"
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
            Add User
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

      <!-- Users Table -->
      <UTable
        v-else
        :columns="columns"
        :rows="filteredUsers"
        :sort="{ column: 'username', direction: 'asc' }"
      >
        <template #roles-data="{ row }">
          <div class="flex gap-1">
            <UBadge
              v-for="role in row.roles"
              :key="role.id"
              :color="getRoleColor(role.name)"
              class="mr-1"
            >
              {{ role.name }}
            </UBadge>
          </div>
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
          <!-- <UButton
            color="gray"
            variant="soft"
            @click="openUserDetails(row)"
          >
            Details
          </UButton> -->
          <UButton
            color="red"
            variant="soft"
            @click="deleteUser(row)"
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
              {{ isEditing ? 'Edit User' : 'Add New User' }}
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
          @submit="submitUser" 
          :validation-schema="userSchema" 
          :initial-values="selectedUser"
          v-slot="{ errors }"
        >
          <div class="space-y-6">
            <!-- First Name -->
            <div>
              <label class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
                <span class="text-[14px]">First Name</span>
                <div class="flex items-center w-full">
                  <Icon name="mdi:account" class="text-pink-500 text-[22px]" />
                  <Field
                    name="first_name"
                    type="text"
                    required
                    class="block w-full px-3 py-4 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input"
                    :class="{ 'border-red-500': errors.first_name }"
                    placeholder="Enter first name"
                  />
                </div>
              </label>
              <ErrorMessage name="first_name" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Last Name -->
            <div>
              <label class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
                <span class="text-[14px]">Last Name</span>
                <div class="flex items-center w-full">
                  <Icon name="mdi:account" class="text-pink-500 text-[22px]" />
                  <Field
                    name="last_name"
                    type="text"
                    required
                    class="block w-full px-3 py-4 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input"
                    :class="{ 'border-red-500': errors.last_name }"
                    placeholder="Enter last name"
                  />
                </div>
              </label>
              <ErrorMessage name="last_name" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Username -->
            <div>
              <label class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
                <span class="text-[14px]">Username</span>
                <div class="flex items-center w-full">
                  <Icon name="mdi:account-circle" class="text-pink-500 text-[22px]" />
                  <Field
                    name="username"
                    type="text"
                    required
                    class="block w-full px-3 py-4 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input"
                    :class="{ 'border-red-500': errors.username }"
                    placeholder="Enter username"
                  />
                </div>
              </label>
              <ErrorMessage name="username" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Email -->
            <div>
              <label class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
                <span class="text-[14px]">Email</span>
                <div class="flex items-center w-full">
                  <Icon name="mdi:email" class="text-pink-500 text-[22px]" />
                  <Field
                    name="email"
                    type="email"
                    required
                    class="block w-full px-3 py-4 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input"
                    :class="{ 'border-red-500': errors.email }"
                    placeholder="Enter email"
                  />
                </div>
              </label>
              <ErrorMessage name="email" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Login Code -->
            <div>
              <label class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
                <span class="text-[14px]">Login Code</span>
                <div class="flex items-center w-full">
                  <Icon name="mdi:key" class="text-pink-500 text-[22px]" />
                  <Field
                    name="login_code"
                    type="text"
                    required
                    class="block w-full px-3 py-4 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input"
                    :class="{ 'border-red-500': errors.login_code }"
                    placeholder="Enter login code"
                  />
                </div>
              </label>
              <ErrorMessage name="login_code" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Password Field -->
            <div>
              <label class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col !border-b !border-b-[#cdcdcd]">
                <span class="text-[14px]">Password</span>
                <div class="flex items-center w-full">
                  <Icon name="mdi:lock" class="text-pink-500 text-[22px]" />
                  <Field
                    name="password"
                    type="password"
                    required
                    class="block w-full px-3 py-4 rounded-md text-[14px] shadow-sm placeholder-gray-500 text-gray-900 custom-input"
                    :class="{ 'border-red-500': errors.password }"
                    placeholder="Enter password"
                  />
                </div>
              </label>
              <ErrorMessage name="password" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Role Selection -->
            <div>
              <label class="text-md font-medium gap-[5px] text-gray-700 flex items-start flex-col">
                <span class="text-[14px] mb-2">Role</span>
                <div class="custom-select-wrapper w-full">
                  <div class="flex items-center w-full relative">
                    <Icon name="mdi:shield-account" class="text-pink-500 text-[22px] absolute left-3 z-10" />
                    <Field
                      v-model="selectedRole"
                      name="role"
                      type="hidden"
                    />
                    <div 
                      class="custom-select-field"
                      @click="isRoleDropdownOpen = !isRoleDropdownOpen"
                    >
                      <div class="selected-value">
                        {{ selectedRole || 'Select a role' }}
                      </div>
                      
                      <!-- Custom Dropdown Menu -->
                      <div 
                        v-if="isRoleDropdownOpen" 
                        class="custom-dropdown-menu"
                      >
                        <div
                          v-for="role in roles"
                          :key="role.id"
                          class="custom-option"
                          :class="{ 'selected': selectedRole === role.name }"
                          @click.stop="selectRole(role.name)"
                        >
                          {{ role.name }}
                        </div>
                      </div>
                    </div>
                    <div class="custom-select-arrow" :class="{ 'open': isRoleDropdownOpen }">
                      <Icon name="mdi:chevron-down" class="text-pink-500 text-[20px]" />
                    </div>
                  </div>
                </div>
              </label>
              <ErrorMessage name="role" class="text-red-500 text-xs mt-1" />
            </div>

            <div class="flex justify-end">
              <UButton type="submit" color="pink" class="px-6 py-3">
                {{ isEditing ? 'Update' : 'Add' }} User
              </UButton>
            </div>
          </div>
        </Form>
      </UCard>
    </UModal>

    <!-- Details Modal -->
    <UModal v-model="isDetailsModalOpen">
      <!-- Similar to Items details modal but with user-specific fields -->
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="isDeleteModalOpen">
      <UCard class="w-full">
        <div class="text-center">
          <Icon name="mdi:alert-circle" class="text-red-500 text-5xl mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Confirm Deletion</h3>
          <p class="text-sm text-gray-500 mb-6">
            Are you sure you want to delete this user? This action cannot be undone.
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
import { object, string, array } from 'yup';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import HandleReqErrors from "~/helpers/HandleReqErrors.js";

definePageMeta({
  layout: 'admin',
});

const pageTitle = useState("pageTitle");
pageTitle.value = "/ Users";

const columns = [
  { key: 'username', label: 'Username' },
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'login_code', label: 'Login Code' },
  { key: 'roles', label: 'Roles' },
  { key: 'action', label: 'Actions' },
];

const permissions = [
  'start shift', 'end shift', 'create category', 'create product',
  'create user', 'create material', 'create table', 'edit table',
  'edit category', 'edit product', 'edit user', 'edit material',
  'delete table', 'delete category', 'delete product', 'delete user',
  'delete material', 'place order', 'reprint bill', 'edit order',
  'cancel order', 'split order', 'merge order', 'make discount',
  'remove discount', 'create discount', 'edit discount', 'delete discount',
  'old reciept', 'reprint reciept', 'shift details', 'order item discount'
];

// State management
const users = ref([]);
const searchQuery = ref('');
const filterRole = ref('All');
const isLoading = ref(false);
const error = ref(null);
const isDetailsModalOpen = ref(false);
const isAddEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const selectedUser = ref(null);
const userToDelete = ref(null);
const isEditing = ref(false);
const roles = ref([]);
const isRoleDropdownOpen = ref(false);
const selectedRole = ref('');

// Validation schema
const userSchema = object().shape({
  first_name: string().required('First name is required'),
  last_name: string().required('Last name is required'),
  username: string().required('Username is required'),
  email: string().email('Invalid email').required('Email is required'),
  login_code: string().required('Login code is required'),
  password: string().when('$isEditing', {
    is: true,
    then: () => string().optional(), // Optional in edit mode
    otherwise: () => string().required('Password is required')
  }),
  role: string().required('Role is required'),
});

// Computed properties
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    const matchesRole = filterRole.value === 'All' || 
      user.roles.some(role => role.name === filterRole.value);
    
    return matchesSearch && matchesRole;
  });
});

// API calls
const fetchUsers = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await useApi('users', 'GET');
    users.value = response;
  } catch (err) {
    error.value = 'Failed to fetch users';
    HandleReqErrors(err);
  } finally {
    isLoading.value = false;
  }
};

const fetchRoles = async () => {
  try {
    const response = await useApi('users/create', 'GET');
    roles.value = response.roles;
  } catch (err) {
    HandleReqErrors(err);
  }
};

onMounted(() => {
  fetchUsers();
  fetchRoles();
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-select-wrapper')) {
      isRoleDropdownOpen.value = false;
    }
  });
});

// Modal handlers
const openAddModal = () => {
  isEditing.value = false;
  selectedRole.value = '';
  selectedUser.value = {
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    login_code: '',
    password: '',
  };
  isAddEditModalOpen.value = true;
};

const openEditModal = (user) => {
  isEditing.value = true;
  selectedRole.value = user.roles[0]?.name || '';
  selectedUser.value = {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    email: user.email,
    login_code: user.login_code,
    password: '', // Add empty password field
  };
  isAddEditModalOpen.value = true;
};

const closeAddEditModal = () => {
  isAddEditModalOpen.value = false;
  selectedUser.value = null;
  isEditing.value = false;
};

const openUserDetails = (user) => {
  selectedUser.value = user;
  isDetailsModalOpen.value = true;
};

const closeDetailsModal = () => {
  isDetailsModalOpen.value = false;
  selectedUser.value = null;
};

// Form submission
const submitUser = async (values) => {
  try {
    const endpoint = isEditing.value ? `users/${selectedUser.value.id}` : 'users';
    const method = isEditing.value ? 'POST' : 'POST';

    const userData = {
      first_name: values.first_name,
      last_name: values.last_name,
      username: values.username,
      email: values.email,
      login_code: values.login_code,
      role: selectedRole.value,
      ...(values.password ? { password: values.password } : {}), // Only include password if provided
    };

    const response = await useApi(endpoint, method, {
      type: 'json',
      data: userData
    });

    if (response) {
      await fetchUsers();
      closeAddEditModal();
      push.success(isEditing.value ? 'User updated successfully' : 'User added successfully');
    }
  } catch (error) {
    console.error('Failed to submit user:', error);
    HandleReqErrors(error);
  }
};

// Delete handlers
const deleteUser = (user) => {
  userToDelete.value = user;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  try {
    await useApi(`users/${userToDelete.value.id}`, 'DELETE');
    users.value = users.value.filter(u => u.id !== userToDelete.value.id);
    push.success('User deleted successfully');
    isDeleteModalOpen.value = false;
  } catch (error) {
    HandleReqErrors(error);
  }
};

// Role color mapping
const getRoleColor = (role) => {
  const colors = {
    'Admin': 'red',
    'Cashier': 'blue',
    'Waiter': 'green',
    'default': 'gray'
  };
  return colors[role] || colors.default;
};

// Export functions
const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(filteredUsers.value.map(user => ({
    Username: user.username,
    'First Name': user.first_name,
    'Last Name': user.last_name,
    Email: user.email,
    'Login Code': user.login_code,
    Roles: user.roles.map(r => r.name).join(', ')
  })));
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
  XLSX.writeFile(workbook, "users_list.xlsx");
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Username', 'First Name', 'Last Name', 'Email', 'Login Code', 'Roles']],
    body: filteredUsers.value.map(user => [
      user.username,
      user.first_name,
      user.last_name,
      user.email,
      user.login_code,
      user.roles.map(r => r.name).join(', ')
    ])
  });
  doc.save("users_list.pdf");
};

// Add this method
const selectRole = (role) => {
  selectedRole.value = role;
  isRoleDropdownOpen.value = false;
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

.custom-checkbox {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 35px;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
  color: #4B5563;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  left: 0;
  height: 22px;
  width: 22px;
  background-color: #fff;
  border: 2px solid #E5E7EB;
  border-radius: 6px;
  transition: all 0.2s ease-in-out;
}

.custom-checkbox:hover input ~ .checkmark {
  border-color: #EC4899;
}

.custom-checkbox input:checked ~ .checkmark {
  background-color: #EC4899;
  border-color: #EC4899;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 7px;
  top: 3px;
  width: 6px;
  height: 11px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.custom-checkbox input:checked ~ .checkmark:after {
  display: block;
}

.label-text {
  margin-left: 8px;
  font-size: 14px;
  color: #4B5563;
}

.custom-select-wrapper {
  position: relative;
  background: white;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.custom-select-field {
  appearance: none;
  width: 100%;
  padding: 5px 40px 5px 45px;
  font-size: 14px;
  border: 2px solid #f3f4f6;
  border-radius: 8px;
  background-color: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 20px;
}

.custom-select-field:focus {
  outline: none;
  border-color: #EC4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.custom-select-field:hover {
  border-color: #EC4899;
}

.custom-select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  transition: transform 0.2s ease;
}

.custom-select-field:focus + .custom-select-arrow {
  transform: translateY(-50%) rotate(180deg);
}

.custom-option {
  padding: 12px;
  font-size: 14px;
}

.custom-select-field option {
  background: white;
  color: #374151;
  padding: 5px;
  font-size: 14px;
}

.custom-select-field option:hover {
  background-color: #fdf2f8;
}

.custom-select-field option:checked {
  background-color: #EC4899;
  color: white;
}

/* Add these styles for better hover states */
.custom-select-wrapper:hover .custom-select-field {
  border-color: #EC4899;
}

.custom-select-wrapper:hover .custom-select-arrow {
  color: #EC4899;
}

/* Add a subtle animation for the arrow */
@keyframes bounce {
  0%, 100% { transform: translateY(-50%); }
  50% { transform: translateY(-30%); }
}

.custom-select-wrapper:hover .custom-select-arrow {
  animation: bounce 1s ease infinite;
}

/* Add focus styles */
.custom-select-field:focus {
  border-color: #EC4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

/* Add disabled state styles */
.custom-select-field:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Add placeholder style */
.custom-select-field option[value=""][disabled] {
  color: #9CA3AF;
}

.custom-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 2px solid #f3f4f6;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 50;
  max-height: 200px;
  overflow-y: auto;
}

.custom-option {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.custom-option:hover {
  background-color: #fdf2f8;
  color: #EC4899;
}

.custom-option.selected {
  background-color: #fdf2f8;
  color: #EC4899;
}

.selected-value {
  padding: 12px 40px 12px 45px;
  color: #374151;
}

.custom-select-arrow.open {
  transform: translateY(-50%) rotate(180deg);
}

/* Scrollbar styling */
.custom-dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.custom-dropdown-menu::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.custom-dropdown-menu::-webkit-scrollbar-thumb {
  background: #EC4899;
  border-radius: 3px;
}

.custom-dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: #db2777;
}
</style>