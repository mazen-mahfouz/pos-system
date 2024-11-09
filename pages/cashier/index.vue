<template>
  <div class="px-[10px]">
    <CashierCategories @categoryChanged="onCategoryChanged" />
    <CashierSearch @searchChanged="onSearchChanged" />
    
    <section class="h-[calc(100vh-238px)] lg:h-[calc(100vh-275px)] xl:h-[calc(100vh-310px)]  pb-[10px] overflow-auto grid content-start gap-[5px] mt-[10px] transition-all duration-300 ease-in-out">
      <!-- إضافة شاشة التحميل -->
      <div v-if="isLoading" class="col-span-full flex justify-center items-center">
        <div class="loader"></div>
      </div>
      
      <!-- استخدام TransitionGroup للانتقالات -->
      <TransitionGroup
        name="item"
        tag="div"
        class="grid gap-[10px]"
        :class="{'grid-cols-4 lg:grid-cols-6 xl:grid-cols-5 2xl:grid-cols-8': OrderStore.$state.openOrder, 'grid-cols-7 lg:grid-cols-6 xl:grid-cols-13 2xl:grid-cols-12': !OrderStore.$state.openOrder }"
      >
        <div
          v-for="item in items"
          :key="item.name"
          @click="handleProductClick(item)"
          :class="{'pointer-events-none opacity-50': isItemDisabled}"
          class="bg-white rounded-[12px] h-fit active border border-transparent transition-all duration-300 ease-out cursor-pointer shadow-sm p-[5px] pb-[12px] gap-[5px] flex flex-col items-start text-start justify-start hover:scale-102 hover:shadow-md"
        >
          <img :src="item.image || 'assets/img/item-img.png'" loading="eager" alt="" class="w-full h-[60px] lg:h-[70px] xl:h-[90px] mb-[8px] rounded-[12px]" />
          <h2 class="text-[9px] lg:text-[12px] xl:text-[14px] h-[25px] lg:h-[40px] xl:h-[40px] font-[500] text-[#555555] mb-[8px] px-[3px]">{{ item.name }}</h2>
          <div class="flex justify-between items-center w-full px-[5px]">
            <span :class="categoryColor(item.category)" class="text-[7px] lg:text-[10px] xl:text-[11px] px-1.5 py-0.5 rounded-full font-[400]">
              {{ item.category.name }}
            </span>
            <span class="text-[9px] lg:text-[12px] xl:text-[13px] font-[400] xl:font-[500] text-gray-600">£ {{ item.price }}</span>
          </div>
        </div>
      </TransitionGroup>
    </section>
  </div>
</template>

<script setup>
import HandleReqErrors from "~/helpers/HandleReqErrors.js";
import { useOrderStore } from '~/stores/orderStore';

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

const isItemDisabled = ref(false);

const handleProductClick = (item) => {
  if (isItemDisabled.value) return;
  
  isItemDisabled.value = true;
  OrderStore.addItemToOrder(item);
  
  if (!OrderStore.$state.openOrder) {
    openNewOrder();
  }
  
  setTimeout(() => {
    isItemDisabled.value = false;
  }, 1000); // 500ms cooldown
};

const fetchProducts = () => {
  isLoading.value = true;
  useApi('products', "GET")
    .then(response => {
      allItems.value = response;
      filterItems();
    })
    .catch(error => {
      HandleReqErrors(error);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const filterItems = () => {
  items.value = [];
  nextTick(() => {
    setTimeout(() => {
      items.value = allItems.value.filter(item => {
        const matchesCategory = selectedCategoryId.value === null || item.category_id === selectedCategoryId.value;
        const matchesSearch = searchQuery.value === '' || item.name.toLowerCase().includes(searchQuery.value.toLowerCase());
        return matchesCategory && matchesSearch;
      });
      isLoading.value = false;
    }, 300);
  });
};

onMounted(() => {
  fetchProducts();
});

</script>

<style scoped>
.active:hover {
  border: 1px solid #0636953d;
  box-shadow: 0 0px 10px #2d71f81a;
}

/* تحسين أنماط الانتقال */
.item-move,
.item-enter-active,
.item-leave-active {
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.item-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.item-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.9);
}

/* أنماط شاشة التحميل */
.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 100px 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* تأثير ظهور تدريجي للمنتجات */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.item-enter-active {
  animation: fadeInUp 0.5s ease-out both;
}
</style>