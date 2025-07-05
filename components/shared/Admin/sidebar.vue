<template>
    <div class="overflow-auto h-[85vh] flex justify-between flex-col transition-width duration-200 ease-in" 
         :class="{ 'w-0': !openSidebar, 'w-[240px]': openSidebar }">
        <div class="flex flex-col gap-[8px] w-[220px] p-[10px]">
            <!-- Regular Links -->
            <nuxt-link v-for="link in regularLinks" :key="link.path" :to="link.path" 
                class="sidebar-link group flex items-center gap-3 p-[12px_15px] hover:bg-[#f0f7ff] text-start rounded-lg transition-all duration-300">
                <Icon :name="link.icon" class="text-[#64748b] group-hover:text-[#2d71f8] text-[16px]" />
                <span class="text-[#334155] group-hover:text-[#2d71f8] font-medium text-[14px]">{{link.name}}</span>
            </nuxt-link>
            
            <!-- Materials Dropdown -->
            <div class="relative">
                <button @click="toggleMaterials" 
                    class="sidebar-link group w-full flex items-center justify-between p-[12px_15px] hover:bg-[#f0f7ff] text-start rounded-lg transition-all duration-300"
                    :class="{ 'bg-[#f0f7ff]': showMaterials }">
                    <div class="flex items-center gap-3">
                        <Icon name="mdi:package-variant" class="text-[#64748b] group-hover:text-[#2d71f8] text-[16px]"
                           :class="{ 'text-[#2d71f8]': showMaterials }" />
                        <span class="text-[#334155] group-hover:text-[#2d71f8] font-medium text-[14px]"
                              :class="{ 'text-[#2d71f8]': showMaterials }">Materials</span>
                    </div>
                    <Icon name="mdi:chevron-down" 
                        class="text-[12px] text-[#64748b] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                        :class="{ 'rotate-180': showMaterials, 'text-[#2d71f8]': showMaterials }" />
                </button>
                
                <Transition
                    enter-active-class="transition duration-300 ease-out"
                    enter-from-class="transform -translate-y-2 opacity-0"
                    enter-to-class="transform translate-y-0 opacity-100"
                    leave-active-class="transition duration-200 ease-in"
                    leave-from-class="transform translate-y-0 opacity-100"
                    leave-to-class="transform -translate-y-2 opacity-0"
                >
                    <div v-if="showMaterials" 
                        class="absolute w-[100%] mt-1 py-2 bg-white z-20 border-t border-t-[#e2e8f0]
                            backdrop-blur-sm backdrop-saturate-150">
                        <div class="">
                            <TransitionGroup
                                enter-active-class="transition-all duration-300 ease-out"
                                enter-from-class="opacity-0 -translate-x-2"
                                enter-to-class="opacity-100 translate-x-0"
                                leave-active-class="transition-all duration-200 ease-in"
                                leave-from-class="opacity-100 translate-x-0"
                                leave-to-class="opacity-0 -translate-x-2"
                                move-class="transition-transform duration-300"
                            >
                                <nuxt-link v-for="(material, index) in materialsLinks" 
                                    :key="material.path" 
                                    :to="material.path"
                                    :style="{ animationDelay: `${index * 50}ms` }"
                                    class="group flex items-center rounded-lg mt-[3px] gap-3 px-4 py-3 hover:bg-[#f0f7ff] transition-colors duration-200 animate-fadeIn">
                                    <Icon :name="material.icon" 
                                        class="text-[#64748b] group-hover:text-[#2d71f8] text-[14px]
                                            transition-transform duration-300 ease-out group-hover:scale-110" />
                                    <span class="text-[13px] text-[#334155] group-hover:text-[#2d71f8] font-medium whitespace-nowrap">
                                        {{ material.name }}
                                    </span>
                                </nuxt-link>
                            </TransitionGroup>
                        </div>
                    </div>
                </Transition>
            </div>

            <!-- Reports Dropdown -->
            <div class="relative">
                <button @click="toggleReports" 
                    class="sidebar-link group w-full flex items-center justify-between p-[12px_15px] hover:bg-[#f0f7ff] text-start rounded-lg transition-all duration-300"
                    :class="{ 'bg-[#f0f7ff]': showReports }">
                    <div class="flex items-center gap-3">
                        <Icon name="mdi:chart-box" class="text-[#64748b] group-hover:text-[#2d71f8] text-[16px]"
                           :class="{ 'text-[#2d71f8]': showReports }" />
                        <span class="text-[#334155] group-hover:text-[#2d71f8] font-medium text-[14px]"
                              :class="{ 'text-[#2d71f8]': showReports }">Reports</span>
                    </div>
                    <Icon name="mdi:chevron-down" 
                        class="text-[12px] text-[#64748b] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                        :class="{ 'rotate-180': showReports, 'text-[#2d71f8]': showReports }" />
                </button>
                
                <Transition
                    enter-active-class="transition duration-300 ease-out"
                    enter-from-class="transform -translate-y-2 opacity-0"
                    enter-to-class="transform translate-y-0 opacity-100"
                    leave-active-class="transition duration-200 ease-in"
                    leave-from-class="transform translate-y-0 opacity-100"
                    leave-to-class="transform -translate-y-2 opacity-0"
                >
                    <div v-if="showReports" 
                        class="absolute w-[100%] mt-1 py-2 bg-white z-20 border-t border-t-[#e2e8f0]
                            backdrop-blur-sm backdrop-saturate-150">
                        <div class="">
                            <TransitionGroup
                                enter-active-class="transition-all duration-300 ease-out"
                                enter-from-class="opacity-0 -translate-x-2"
                                enter-to-class="opacity-100 translate-x-0"
                                leave-active-class="transition-all duration-200 ease-in"
                                leave-from-class="opacity-100 translate-x-0"
                                leave-to-class="opacity-0 -translate-x-2"
                                move-class="transition-transform duration-300"
                            >
                                <nuxt-link v-for="(report, index) in reportLinks" 
                                    :key="report.path" 
                                    :to="report.path"
                                    :style="{ animationDelay: `${index * 50}ms` }"
                                    :class="[
                                        'group flex items-center rounded-lg  mt-[3px] gap-3 px-4 py-3  hover:bg-[#f0f7ff] transition-colors duration-200 animate-fadeIn',
                                        { 'opacity-50 pointer-events-none bg-[#fff6f6] cursor-not-allowed': report.disabled }
                                    ]">
                                    <Icon :name="report.icon" 
                                        class="text-[#64748b] group-hover:text-[#2d71f8] text-[14px]
                                            transition-transform duration-300 ease-out group-hover:scale-110" />
                                    <span class="text-[13px] text-[#334155] group-hover:text-[#2d71f8] font-medium whitespace-nowrap">
                                        {{ report.name }}
                                    </span>
                                </nuxt-link>
                            </TransitionGroup>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>
    </div>
</template>

<script setup>

const pageTitle = useState("pageTitle");
const openSidebar = useState("openSidebar");
openSidebar.value = true;

const showReports = ref(false);
const toggleReports = () => {
    showReports.value = !showReports.value;
};

const showMaterials = ref(false);
const toggleMaterials = () => {
    showMaterials.value = !showMaterials.value;
};

const regularLinks = [
    { name: 'Home', path: '/admin', icon: 'mdi:home' },
    { name: 'Items', path: '/admin/items', icon: 'mdi:package' },
    { name: 'Tables', path: '/admin/table', icon: 'mdi:table' },
    { name: 'Categories', path: '/admin/categories', icon: 'mdi:tag-multiple' },
    { name: 'Recipes', path: '/admin/recipes', icon: 'mdi:silverware-fork-knife' },
    { name: 'Orders History', path: '/admin/order-history', icon: 'mdi:history' },
    { name: 'Users', path: '/admin/users', icon: 'mdi:account-group' },
];

const materialsLinks = [
    { name: 'Materials List', path: '/admin/materials', icon: 'mdi:package-variant' },
    { name: 'Material Transactions', path: '/admin/materials/transactions', icon: 'mdi:history' },
    { name: 'Material Adjustment', path: '/admin/materials/adjustment', icon: 'mdi:scale' },
    { name: 'Material Receipt', path: '/admin/materials/receipt', icon: 'mdi:receipt' },
];

const reportLinks = [
    { name: 'Sales Report', path: '/admin/reports/sales', icon: 'mdi:chart-bar' },
    { name: 'Inventory Report', path: '/admin/reports/inventory', icon: 'mdi:warehouse', disabled: true },
    { name: 'User Activity', path: '/admin/reports/user-activity', icon: 'mdi:account-clock' },
    { name: 'Monthly Report', path: '/admin/reports/monthly', icon: 'mdi:calendar' },
    { name: 'Top Selling Products', path: '/admin/reports/top-selling', icon: 'mdi:crown' },
    { name: 'Customer Purchase History', path: '/admin/reports/customer-history', icon: 'mdi:cart', disabled: true },
    { name: 'Sales by Category', path: '/admin/reports/sales-by-category', icon: 'mdi:chart-pie' },
    { name: 'Refunds and Returns', path: '/admin/reports/refunds', icon: 'mdi:undo', disabled: true },
    { name: 'Monthly Sales Growth', path: '/admin/reports/sales-growth', icon: 'mdi:trending-up' },
    { name: 'User Engagement', path: '/admin/reports/user-engagement', icon: 'mdi:account-cog', disabled: true },
    { name: 'Inventory Turnover', path: '/admin/reports/inventory-turnover', icon: 'mdi:sync', disabled: true },
    { name: 'Payment Performance', path: '/admin/reports/payment-performance', icon: 'mdi:credit-card', disabled: true },
];

</script>

<style scoped>
.router-link-active {
    @apply bg-[#2d71f8] !important;
    
    span, i {
        @apply text-white !important;
    }
}

.router-link-active:hover {
    @apply bg-[#2563eb] !important;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-slideDown {
    animation: slideDown 0.2s ease-out forwards;
}

/* Custom Scrollbar for Reports Dropdown */
*::-webkit-scrollbar {
    width: 2px;
}

*::-webkit-scrollbar-track {
    background: #dedede;
    border-radius: 10px;
}

*::-webkit-scrollbar-thumb {
    background: #efefef;
    border-radius: 10px;
}

*::-webkit-scrollbar-thumb:hover {
    background: #ececec;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateX(-8px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
    animation-fill-mode: both;
}


.sidebar-link, .dropdown-item {
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
    will-change: transform, opacity;
}
</style>