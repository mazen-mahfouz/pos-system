<template>
  <div v-if="visible" class="alert-overlay">
    <div class="alert-box" :class="{ 'alert-enter': visible, 'alert-exit': !visible }">
      <div class="alert-icon">
        <Icon v-if="icon" :name="icon" class="text-3xl" />
      </div>
      <div class="alert-content">
        <h2 v-if="title">{{ title }}</h2>
        <p>{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  title: { type: String, default: '' },
  message: { type: String, required: true },
  icon: { type: String, default: '' },
  duration: { type: Number, default: 3000 },
});

const visible = ref(true);

onMounted(() => {
  setTimeout(() => {
    visible.value = false;
  }, props.duration);
});

onBeforeUnmount(() => {
  visible.value = false;
});
</script>

<style scoped>
.alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Alert box styling */
.alert-box {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 300px;
  max-width: 80%;
  transform: scale(0.9);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* Alert enter animation */
.alert-enter {
  transform: scale(1);
  opacity: 1;
}

/* Alert exit animation */
.alert-exit {
  transform: scale(0.9);
  opacity: 0;
}

/* Icon styling */
.alert-icon {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #4caf50;
}

/* Title styling */
.alert-content h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

/* Message styling */
.alert-content p {
  margin: 10px 0 0;
  font-size: 1rem;
  color: #555;
}
</style>
