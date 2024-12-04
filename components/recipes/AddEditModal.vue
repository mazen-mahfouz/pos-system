<template>
  <UModal 
    :model-value="modelValue" 
    :prevent-close="true"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <UCard class="w-full max-w-4xl">
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-semibold text-gray-800 flex items-center">
            <Icon name="mdi:book-open-page-variant" class="text-pink-500 mr-2" />
            {{ isEditing ? 'Edit Recipe' : 'Add New Recipe' }}
          </h3>
          <UButton 
            color="gray" 
            variant="ghost" 
            icon="i-heroicons-x-mark" 
            @click="$emit('update:modelValue', false)" 
          />
        </div>
      </template>

      <Form 
        @submit="submitForm"
        :validation-schema="recipeSchema"
        :initial-values="initialValues"
        v-slot="{ errors, isSubmitting }"
      >
        <div class="space-y-6">
          <!-- Basic Info Section -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-medium text-gray-700 mb-4 flex items-center">
              <Icon name="mdi:information" class="text-pink-500 mr-2" />
              Basic Information
            </h4>
            
            <!-- Recipe Name -->
            <div class="mb-4">
              <label class="text-sm font-medium text-gray-700 block mb-2">
                Recipe Name
              </label>
              <Field
                name="name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                :class="{ 'border-red-500': errors.name }"
                placeholder="Enter recipe name"
              />
              <ErrorMessage name="name" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Instructions -->
            <div class="mb-4">
              <label class="text-sm font-medium text-gray-700 block mb-2">
                Instructions
              </label>
              <Field
                as="textarea"
                name="instructions"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                :class="{ 'border-red-500': errors.instructions }"
                placeholder="Enter cooking instructions"
              />
              <ErrorMessage name="instructions" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Product Selection -->
            <div class="mb-4">
              <label class="text-sm font-medium text-gray-700 block mb-2">
                Associated Product
              </label>
              <Field
                name="product_id"
                v-slot="{ field }"
              >
                <select
                  v-bind="field"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                  :class="{ 'border-red-500': errors.product_id }"
                >
                  <option value="">Select a product</option>
                  <option 
                    v-for="product in availableProducts" 
                    :key="product.id"
                    :value="product.id"
                  >
                    {{ product.name }} - ${{ product.price }}
                  </option>
                </select>
              </Field>
              <ErrorMessage name="product_id" class="text-red-500 text-xs mt-1" />
            </div>
          </div>

          <!-- Materials Section -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex justify-between items-center mb-4">
              <h4 class="font-medium text-gray-700 flex items-center">
                <Icon name="mdi:package-variant" class="text-pink-500 mr-2" />
                Recipe Materials
              </h4>
            </div>

            <FieldArray
              name="materials"
              v-slot="{ push, fields, remove }"
            >
              <div class="space-y-4">
                <div 
                  v-for="(field, index) in fields"
                  :key="field.key"
                  class="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 items-end"
                >
                  <!-- Material Selection -->
                  <div class="flex-1">
                    <label class="text-sm font-medium text-gray-700 block mb-1">
                      Material
                    </label>
                    <Field
                      :name="`materials.${index}.material_id`"
                      v-slot="{ field: materialField }"
                    >
                      <select
                        v-bind="materialField"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                      >
                        <option value="">Select material</option>
                        <option 
                          v-for="material in availableMaterials" 
                          :key="material.id"
                          :value="material.id"
                        >
                          {{ material.name }} ({{ material.unit }})
                        </option>
                      </select>
                    </Field>
                    <ErrorMessage :name="`materials.${index}.material_id`" class="text-red-500 text-xs mt-1" />
                  </div>

                  <!-- Quantity Input -->
                  <div class="w-32">
                    <label class="text-sm font-medium text-gray-700 block mb-1">
                      Quantity
                    </label>
                    <Field
                      :name="`materials.${index}.material_quantity`"
                      type="number"
                      step="0.01"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                    />
                    <ErrorMessage :name="`materials.${index}.material_quantity`" class="text-red-500 text-xs mt-1" />
                  </div>

                  <!-- Remove Button -->
                  <UButton
                    color="red"
                    variant="soft"
                    icon="i-heroicons-trash"
                    class="self-end mb-1"
                    @click="() => remove(index)"
                  />
                </div>

                <!-- Add Material Button -->
                <UButton
                  color="pink"
                  variant="soft"
                  size="sm"
                  icon="i-heroicons-plus"
                  @click="() => push({ material_id: '', material_quantity: '' })"
                >
                  Add Material
                </UButton>
              </div>
            </FieldArray>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end">
            <UButton
              type="submit"
              color="pink"
              :loading="isSubmitting"
              :disabled="isSubmitting"
            >
              {{ isEditing ? 'Update Recipe' : 'Create Recipe' }}
            </UButton>
          </div>
        </div>
      </Form>
    </UCard>
  </UModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Form, Field, ErrorMessage, FieldArray } from 'vee-validate';
import { object, string, number, array } from 'yup';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  recipe: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'submit']);

// Available data
const availableMaterials = ref([]);
const availableProducts = ref([]);

// Validation schema
const recipeSchema = object().shape({
  name: string().required('Recipe name is required'),
  instructions: string().required('Instructions are required'),
  product_id: number().required('Product selection is required'),
  materials: array().of(
    object().shape({
      material_id: number().required('Material selection is required'),
      material_quantity: number()
        .required('Quantity is required')
        .positive('Quantity must be positive')
    })
  ).min(1, 'At least one material is required')
});

// Initial values
const initialValues = computed(() => {
  if (props.isEditing && props.recipe) {
    return {
      name: props.recipe.name,
      instructions: props.recipe.instructions,
      product_id: props.recipe.product_id,
      materials: props.recipe.materials.map(material => ({
        material_id: material.id,
        material_quantity: parseFloat(material.pivot.material_quantity)
      }))
    };
  }
  return {
    name: '',
    instructions: '',
    product_id: '',
    materials: []
  };
});

// Fetch available materials and products
onMounted(async () => {
  try {
    const response = await useApi('recipes/create', 'GET');
    availableMaterials.value = response.materials;
    availableProducts.value = response.products;
  } catch (error) {
    HandleReqErrors(error);
  }
});

// Form handlers
const submitForm = async (values) => {
  try {
    // تنسيق البيانات بشكل صحيح قبل الإرسال
    const formattedValues = {
      name: values.name,
      instructions: values.instructions,
      product_id: Number(values.product_id),
      materials: values.materials.map(material => {
        // تأكد من أن كل مادة لها معرف وكمية بالتنسيق الصحيح
        return {
          material_id: Number(material.material_id),
          material_quantity: Number(material.material_quantity)
        };
      })
    };

    
    emit('submit', formattedValues);
  } catch (error) {
    HandleReqErrors(error);
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 