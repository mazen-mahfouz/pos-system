import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export default defineNuxtPlugin(() => {
  window.Pusher = Pusher;
  
  const echo = new Echo({
    broadcaster: 'pusher',
    key: '12345',
    wsHost: window.location.hostname,
    wsPort: 6001,
    forceTLS: false,
    encrypted: true,
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    cluster: 'mt1'
  });

  return {
    provide: {
      echo
    }
  };
});
