<template>
  <Swiper
    :slides-per-view="'auto'"
    :space-between="7"
  >
    <!-- All category -->
    <SwiperSlide class="swiper-slide-auto">
      <div
        :class="['category-box', { active: activeCategoryId === null }]"
        @click="setActiveCategory(null)"
      >
        <div class="icon bg-[#f7f7f7] rounded-full flex items-center justify-center p-[4px] w-fit">
          <UIcon name="mdi:view-grid" class="text-[#878787] text-[14px] font-[100]" />
        </div>
        <h1 class="font-[400] text-[black] text-[12px] ml-[5px] mt-[10px]">All</h1>
        <span class="text-[9px] mt-[5px] ml-[5px] text-[#888]">{{ categories.all_products_count }} Items</span>
      </div>
    </SwiperSlide>
    
    <!-- Category list inside Swiper -->
    <SwiperSlide v-for="category in categories.categories" :key="category.id" class="swiper-slide-auto">
      <div
        :class="['category-box', { active: category.id === activeCategoryId }]"
        @click="setActiveCategory(category.id)"
      >
        <div class="icon bg-[#f7f7f7] rounded-full flex items-center justify-center p-[4px] w-fit">
          <UIcon :name="category.icon || 'mdi:food'" class="text-[#878787] text-[14px] font-[100]" />
        </div>
        <h1 class="font-[400] text-[black] text-[12px] ml-[5px] mt-[10px]">{{ category.name }}</h1>
        <span class="text-[9px] mt-[5px] ml-[5px] text-[#888]">{{ category.products_count }} Items</span>
      </div>
    </SwiperSlide>
  </Swiper>
</template>

<script setup>
import HandleReqErrors from "~/helpers/HandleReqErrors.js";

const emit = defineEmits(['categoryChanged']);

const categories = ref({});
const activeCategoryId = ref(null);

const setActiveCategory = (id) => {
  activeCategoryId.value = id;
  emit('categoryChanged', id);
};

onMounted(() => {
  fetchCategories();
});

const fetchCategories = () => {
  useApi(`categories`, "GET")
    .then(response => {
      categories.value = response;
      // Set the initial active category to null (All)
      setActiveCategory(null);
    })
    .catch(error => {
      HandleReqErrors(error);
    });
};
</script>

<style scoped>
.category-box {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px 12px;
  box-shadow: 0 0px 15px #d0d0d011;
  cursor: pointer;
  transition: 0.5s ease;
  border: 1px solid #fff;
}

.category-box.active {
  border: 1px solid #2d71f8b8;
  box-shadow: 0 0px 10px #2d71f83a;
}

.category-box.active .icon {
  background-color: #2d71f8;
}

.category-box.active .icon span {
  color: #fff;
}

/* Remove custom width for SwiperSlide when slides-per-view is auto to make it responsive */
.swiper-slide-auto {
  width: 110px; 
}

.category-box .icon {
  background-color: #f7f7f7;
  border-radius: 50%;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Scrollbar Styling */
.category-list-container::-webkit-scrollbar {
  height: 0px;
}

.category-list-container::-webkit-scrollbar-thumb {
  background-color: #007bffd4;
  border-radius: 10px;
}

.category-list-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}
</style>