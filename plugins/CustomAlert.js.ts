// plugins/CustomAlert.js
import CustomAlert from '@/components/reusable/CustomAlert.vue';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('CustomAlert', CustomAlert);
});
