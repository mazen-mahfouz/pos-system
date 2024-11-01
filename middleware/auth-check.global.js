import { useAuthStore } from '~/stores/auth';
import { useCookie, navigateTo } from '#app';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const AuthStore = useAuthStore();

  const tokenCookie = useCookie('PosUserToken').value;
  const userCookie = useCookie('PosUserData').value;

  // if (tokenCookie && userCookie) {

  //   AuthStore.token = tokenCookie;
  //   AuthStore.user = userCookie;

  //   if (to.path === '/auth/login') {
  //     return navigateTo('/');
  //   }

  // } else {
  //   if (to.path !== '/auth/login') {
  //     return navigateTo('/auth/login');
  //   }
  // }
});
