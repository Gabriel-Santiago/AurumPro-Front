<template>
  <div class="notifications-container">
    <TransitionGroup name="toast">
      <div v-for="notification in notifications" 
           :key="notification.id"
           class="notification-toast"
           :class="`toast-${notification.type}`"
           @click="removeNotification(notification.id)">
        
        <div class="toast-icon">
          <span v-if="notification.type === 'success'">✅</span>
          <span v-if="notification.type === 'error'">❌</span>
          <span v-if="notification.type === 'warning'">⚠️</span>
        </div>
        
        <div class="toast-content">
          <h4 v-if="notification.title" class="toast-title">
            {{ notification.title }}
          </h4>
          <p class="toast-message">{{ notification.message }}</p>
        </div>
        
        <button class="toast-close" @click.stop="removeNotification(notification.id)">
          ×
        </button>
        
        <div v-if="notification.autoClose" class="toast-progress">
          <div class="progress-bar" :style="progressStyle(notification)"></div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const notifications = ref([]);

const notificationTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning'
};

const addNotification = (message, type = 'info', options = {}) => {
  const id = Date.now() + Math.random();
  const duration = options.duration || (type === 'error' ? 5000 : 3000);
  
  const notification = {
    id,
    message,
    type,
    title: options.title,
    duration,
    autoClose: options.autoClose !== false,
    createdAt: Date.now()
  };
  
  notifications.value.unshift(notification);
  
  if (notification.autoClose) {
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }
  
  return id;
};

const success = (message, options = {}) => {
  return addNotification(message, notificationTypes.SUCCESS, options);
};

const error = (message, options = {}) => {
  return addNotification(message, notificationTypes.ERROR, options);
};

const warning = (message, options = {}) => {
  return addNotification(message, notificationTypes.WARNING, options);
};

const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications.value.splice(index, 1);
  }
};

const clearAll = () => {
  notifications.value = [];
};

const progressStyle = (notification) => {
  if (!notification.autoClose) return {};
  
  const elapsed = Date.now() - notification.createdAt;
  const progress = Math.max(0, 100 - (elapsed / notification.duration) * 100);
  
  return {
    width: `${progress}%`
  };
};

defineExpose({
  success,
  error,
  warning,
  addNotification,
  removeNotification,
  clearAll
});

onMounted(() => {
  setInterval(() => {
    notifications.value = [...notifications.value];
  }, 100);
});
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
  pointer-events: none;
}

.notification-toast {
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: flex-start;
  gap: 14px;
  position: relative;
  overflow: hidden;
  animation: slideIn 0.3s ease;
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none !important; 
}

.notification-toast:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.toast-success {
  background: linear-gradient(135deg, #10b981, #059669) !important; 
  color: white !important;
  border: none !important;
}

.toast-error {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important; 
  color: white !important;
  border: none !important;
}

.toast-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706) !important;
  color: #1f2937 !important;
  border: none !important;
}

.toast-success .toast-title,
.toast-success .toast-message,
.toast-error .toast-title,
.toast-error .toast-message {
  color: white !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.toast-warning .toast-title,
.toast-warning .toast-message {
  color: #1f2937 !important;
}

.toast-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-top: 2px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
}

.toast-success .toast-icon,
.toast-error .toast-icon {
  color: white !important;
}

.toast-warning .toast-icon {
  color: #92400e !important;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  margin: 0 0 6px 0;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.toast-message {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  opacity: 0.95;
}

.toast-close {
  background: transparent;
  border: none;
  font-size: 1.8rem;
  font-weight: 300;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  transition: all 0.2s ease;
  margin-top: -2px;
  margin-right: -2px;
  padding: 0;
  line-height: 1;
}

.toast-success .toast-close,
.toast-error .toast-close {
  color: rgba(255, 255, 255, 0.8) !important;
}

.toast-warning .toast-close {
  color: rgba(31, 41, 55, 0.8) !important;
}

.toast-success .toast-close:hover,
.toast-error .toast-close:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  transform: scale(1.1);
}

.toast-warning .toast-close:hover {
  background: rgba(31, 41, 55, 0.1) !important;
  color: #1f2937 !important;
  transform: scale(1.1);
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  transition: width 0.1s linear;
}

.toast-success .progress-bar,
.toast-error .progress-bar {
  background: rgba(255, 255, 255, 0.7) !important;
}

.toast-warning .progress-bar {
  background: rgba(31, 41, 55, 0.7) !important;
}

.toast-success::before,
.toast-error::before,
.toast-warning::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.15) 0%, 
    rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
  border-radius: 12px;
}

.toast-warning::before {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.25) 0%, 
    rgba(255, 255, 255, 0) 100%);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-move {
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .notifications-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .notification-toast {
    padding: 14px;
  }
  
  .toast-icon {
    font-size: 1.3rem;
  }
  
  .toast-title {
    font-size: 0.95rem;
  }
  
  .toast-message {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .notifications-container {
    top: 5px;
    right: 5px;
    left: 5px;
  }
  
  .notification-toast {
    padding: 12px;
    gap: 10px;
  }
  
  .toast-close {
    font-size: 1.5rem;
    width: 24px;
    height: 24px;
  }
}

:global(.toast-success) {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  color: white !important;
}

:global(.toast-error) {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  color: white !important;
}

:global(.toast-warning) {
  background: linear-gradient(135deg, #f59e0b, #d97706) !important;
  color: #1f2937 !important;
}
</style>