<template>
  <div>
    <h1>Realtime Updates</h1>
    <div v-for="message in messages" :key="message.id" class="message">
      {{ message.content }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// قائمة الرسائل
const messages = ref([]);

onMounted(() => {
  const { $echo } = useNuxtApp();
  
  // Log connection status
  $echo.connector.pusher.connection.bind('connected', () => {
    console.log('Successfully connected to WebSocket');
  });

  $echo.connector.pusher.connection.bind('error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  // Subscribe to channel
  const channel = $echo.channel('orders-channel');
  
  // Listen for events
  channel.listen('.order-updated', (data) => {
    console.log('Received event:', data);
  });
});
</script>

<style>
.message {
  padding: 10px;
  margin: 5px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
}
</style>
