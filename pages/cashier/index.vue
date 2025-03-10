<template>
  <div class="px-[10px]">
    <CashierCategories @categoryChanged="onCategoryChanged" />
    <CashierSearch @searchChanged="onSearchChanged" />
    
    <section class="h-[calc(100vh-240px)] lg:h-[calc(100vh-295px)] xl:h-[calc(100vh-315px)]  pb-[10px] overflow-auto grid content-start gap-[5px] mt-[10px] transition-all duration-300 ease-in-out">
      <!-- Content Loader Skeleton -->
      <TransitionGroup
        v-if="isLoading"
        name="item"
        tag="div"
        class="grid gap-[10px]"
        :class="{'grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7': OrderStore.$state.openOrder, 'grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-9': !OrderStore.$state.openOrder }"
      >
        <div v-for="n in 20" :key="n" class="bg-white rounded-[12px] p-[5px]">
          <ContentLoader 
            viewBox="0 0 200 200"
            :speed="2"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
          >
            <rect x="0" y="0" rx="8" ry="8" width="200" height="120" />
            <rect x="0" y="130" rx="4" ry="4" width="170" height="15" />
            <rect x="0" y="155" rx="3" ry="3" width="80" height="10" />
            <rect x="140" y="155" rx="3" ry="3" width="60" height="10" />
          </ContentLoader>
        </div>
      </TransitionGroup>

      <!-- Actual Content -->
      <TransitionGroup
        v-else
        name="item"
        tag="div"
        class="grid gap-[10px]"
        :class="{'grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6': OrderStore.$state.openOrder, 'grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8': !OrderStore.$state.openOrder }"
      >
        <div
          v-for="item in items"
          :key="item.name"
          @click="handleProductClick(item)"
          class="bg-white rounded-[12px] h-fit active border border-transparent transition-all duration-200 ease-out cursor-pointer shadow-sm p-[5px] pb-[12px] gap-[5px] flex flex-col items-start text-start justify-start hover:scale-102 hover:shadow-md relative group"
          :class="{'pointer-events-none opacity-50': isItemDisabled}"
        >
          <!-- Info Button -->
          <button 
            @click.stop="toggleDetails(item)" 
            class="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-gray-50/80 hover:bg-gray-100 flex items-center justify-center transition-colors duration-200"
          >
            <UIcon name="i-heroicons-information-circle" class="text-gray-500" />
          </button>

          <!-- Main Content -->
          <NuxtImg
            :src="item.image || '/img/notfound.png'"
            loading="eager"
            alt=""
            class="w-full h-[60px] lg:h-[70px] xl:h-[90px] mb-[8px] rounded-[12px] !object-contain"
          />
          <h2 class="text-[9px] lg:text-[12px] xl:text-[14px] h-[25px] lg:h-[40px] xl:h-[40px] font-[500] text-[#555555] mb-[8px] px-[3px]">
            {{ item.name }}
          </h2>
          <div class="flex justify-between items-center w-full px-[5px]">
            <span 
              :class="categoryColor(item.category)" 
              class="text-[7px] lg:text-[10px] xl:text-[11px] px-1.5 py-0.5 rounded-full font-[400]"
            >
              {{ item.category.name }}
            </span>
            <span class="text-[9px] lg:text-[12px] xl:text-[13px] font-[400] xl:font-[500] text-gray-600">
              £{{ item.price }}
            </span>
          </div>

          <!-- Price Details Popup -->
          <div 
            v-show="item.showDetails"
            class="absolute left-0 right-0 top-0 bottom-0 z-20 bg-white rounded-[12px] shadow-lg border border-gray-100 transform-gpu"
            @click.stop
          >
            <div class="p-4 h-full flex flex-col">
              <!-- Header -->
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium text-gray-800 text-sm">Price Details</h3>
                <button 
                  @click="toggleDetails(item)"
                  class="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <!-- Price Details -->
              <div class="">
                <div class="flex items-center justify-between p-[2px] mb-[8px] rounded-lg">
                  <span class="text-gray-600 text-[10px]">Base Price</span>
                  <span class="font-medium text-gray-800 text-[11px]">£{{ item.price }}</span>
                </div>
                <div class="flex items-center justify-between p-[2px] mb-[8px] rounded-lg">
                  <span class="text-blue-600 text-[10px]">With VAT (14%)</span>
                  <span class="font-medium text-blue-600 text-[11px]">£{{ (item.price * 1.14).toFixed(2) }}</span>
                </div>
                <div class="flex items-center justify-between p-[2px] mb-[8px] rounded-lg ">
                  <span class="text-green-600 text-[10px]">Total + Service (10%)</span>
                  <span class="font-medium text-green-600 text-[11px]">£{{ ((item.price * 1.14) * 1.10).toFixed(2) }}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </TransitionGroup>
    </section>
  </div>
</template>

<script setup>
import HandleReqErrors from "~/helpers/HandleReqErrors.js";
import { useOrderStore } from '~/stores/orderStore';
import { ContentLoader } from 'vue-content-loader'
import { ref } from 'vue';

const OrderStore = useOrderStore();

definePageMeta({
  layout: 'cashier',
})

const pageTitle = useState("pageTitle");
pageTitle.value = "/ Cafe Dashboard";

const items = ref([]);
const allItems = ref([]); // Store all items
const selectedCategoryId = ref(null);
const searchQuery = ref('');
const isLoading = ref(true);

const openNewOrderModal = inject('openNewOrderModal');

const openNewOrder = () => {
  openNewOrderModal();
};

// تحديد الألوان بناءً على الفئة
const categoryColor = (category) => {
  switch (category) {
    case 'Sandwich':
      return 'bg-red-100 text-red-600';
    case 'Pastry':
      return 'bg-green-100 text-green-600';
    case 'Donut':
      return 'bg-orange-100 text-orange-600';
    case 'Cake':
      return 'bg-pink-100 text-pink-600';
    case 'Bread':
      return 'bg-blue-100 text-blue-600';
    case 'Tart':
      return 'bg-yellow-100 text-yellow-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

const onCategoryChanged = (categoryId) => {
  selectedCategoryId.value = categoryId;
  filterItems();
};

const onSearchChanged = (query) => {
  searchQuery.value = query;
  filterItems();
};

const isItemDisabled = computed(() => OrderStore.isProcessing);

const handleProductClick = async (item) => {
  if (isItemDisabled.value) return;
  
  if (!OrderStore.currentOrder.id) {
    OrderStore.setPendingItem(item);
    openNewOrder();
  } else {
    try {
      await OrderStore.addItemToOrder(item);
    } catch (error) {
      console.error('Error adding item:', error);
      push.error('Failed to add item');
    }
  }
};

// تحسين أداء الفلترة
const filterItems = () => {
  isLoading.value = true;
  
  // استخدام requestAnimationFrame للتحسين
  requestAnimationFrame(() => {
    items.value = allItems.value.filter(item => {
      const matchesCategory = selectedCategoryId.value === null || item.category_id === selectedCategoryId.value;
      const matchesSearch = searchQuery.value === '' || item.name.toLowerCase().includes(searchQuery.value.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    
    isLoading.value = false;
  });
};

// تحسين أداء جلب المنتجات
const fetchProducts = async () => {
  try {
    isLoading.value = true;
    const response = await useApi('products', "GET");
    allItems.value = response.map(item => ({
      ...item,
      showDetails: false
    }));
    await filterItems();
  } catch (error) {
    HandleReqErrors(error);
  }
};

onMounted(() => {
  fetchProducts();
});

// إضافة دالة جديدة للتبديل بين إظهار وإخفاء التفاصيل
const toggleDetails = (item) => {
  // Close all other items first
  items.value.forEach(i => {
    if (i !== item) i.showDetails = false;
  });
  // Toggle current item
  item.showDetails = !item.showDetails;
};

</script>

<style scoped>
.active:hover {
  border: 1px solid #0636953d;
  box-shadow: 0 0px 10px #2d71f81a;
}

/* Remove old animations */
.item-move,
.item-enter-active,
.item-leave-active {
  transition: none;
}

.item-enter-from,
.item-leave-to {
  opacity: 1;
  transform: none;
}

/* Optimize performance with transform-gpu */
.transform-gpu {
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>