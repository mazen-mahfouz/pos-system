<template>
  <!-- Skeleton Loader -->
  <div v-if="isLoading" class="px-[5px]">
    <Swiper :slides-per-view="'auto'" :space-between="7">
      <SwiperSlide v-for="n in 10" :key="n" class="swiper-slide-auto bg-white rounded-[12px] p-[5px] ml-[10px] ">
        <ContentLoader 
          viewBox="0 0 140 140"
          :speed="2"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
          class="w-full h-full"
        >
          <rect x="10" y="10" rx="50" ry="50" width="40" height="40" />
          <rect x="10" y="60" rx="4" ry="4" width="80" height="12" />
          <rect x="10" y="80" rx="3" ry="3" width="60" height="8" />
        </ContentLoader>
      </SwiperSlide>
    </Swiper>
  </div>

  <!-- Actual Content -->
  <Swiper
    v-else
    :slides-per-view="'auto'"
    :space-between="7"
  >
    <!-- All category -->
    <SwiperSlide class="swiper-slide-auto">
      <div
        :class="['category-box', { active: activeCategoryId === null }]"
        @click="setActiveCategory(null)"
        class="p-[12px_8px] md:p-[18px_10px] lg:p-[35px_18px]"
      >
        <div class="icon bg-[#f7f7f7] rounded-full flex items-center justify-center p-[4px] md:p-[5px] lg:p-[6px] w-fit">
          <UIcon name="mdi:view-grid" class="text-[#878787] text-[12px] md:text-[14px] lg:text-[16px] font-[100]" />
        </div>
        <h1 class="font-[400] text-[black] text-[11px] md:text-[11px] lg:text-[14px] ml-[5px] mt-[10px]">All</h1>
        <span class="text-[9px] md:text-[9px] lg:text-[12px] mt-[5px] ml-[5px] text-[#888]">{{ categories.all_products_count }} Items</span>
      </div>
    </SwiperSlide>
    
    <!-- Category list -->
    <SwiperSlide v-for="category in categories.categories" :key="category.id" class="swiper-slide-auto">
      <div
        class="p-[12px_8px] md:p-[18px_10px] lg:p-[35px_18px]"
        :class="['category-box', { active: category.id === activeCategoryId }]"
        @click="setActiveCategory(category.id)"
      >
        <div class="icon bg-[#f7f7f7] rounded-full flex items-center justify-center p-[4px] md:p-[5px] lg:p-[6px] w-fit">
          <UIcon :name="category.icon || 'mdi:food'" class="text-[#878787] text-[10px] md:text-[14px] lg:text-[16px] font-[100]" />
        </div>
        <h1 class="font-[400] text-[black] text-[11px] md:text-[11px] lg:text-[14px] ml-[5px] mt-[10px]">{{ category.name }}</h1>
        <span class="text-[8px] md:text-[9px] lg:text-[12px] mt-[5px] ml-[5px] text-[#888]">{{ category.products_count }} Items</span>
      </div>
    </SwiperSlide>
  </Swiper>
</template>

<script setup>
import HandleReqErrors from "~/helpers/HandleReqErrors.js";
import { ContentLoader } from 'vue-content-loader'

const emit = defineEmits(['categoryChanged']);

const categories = ref({});
const activeCategoryId = ref(null);
const isLoading = ref(true);

const setActiveCategory = (id) => {
  activeCategoryId.value = id;
  emit('categoryChanged', id);
};

onMounted(() => {
  fetchCategories();
});

const fetchCategories = async () => {
  try {
    isLoading.value = true;
    const response = await useApi(`categories`, "GET");
    
    // استخدام requestAnimationFrame للتحسين
    requestAnimationFrame(() => {
      categories.value = response;
      // Set the initial active category to null (All)
      setActiveCategory(null);
      isLoading.value = false;
    });
  } catch (error) {
    HandleReqErrors(error);
    isLoading.value = false;
  }
};
</script>

<style scoped>
.category-box {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 0px 15px #d0d0d011;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #fff;
  will-change: transform, box-shadow;
}

/* .category-box:hover {
  transform: translateY(-2px);
} */

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
  width: 90px;
  @media (min-width: 768px) { /* md */
    width: 110px;
  }
  @media (min-width: 1024px) { /* lg */
    width: 140px;
  }
  @media (min-width: 1280px) { /* xl */
    width: 150px;
  }
}

.category-box .icon {
  background-color: #f7f7f7;
  border-radius: 50%;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: background-color;
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