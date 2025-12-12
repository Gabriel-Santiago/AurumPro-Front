import { createApp } from 'vue';
import NotificationToast from '../components/alert/Notification.vue';
import { notify } from '../services/notificationService';

const notificationPlugin = {
  install(app) {
    const notificationApp = createApp(NotificationToast);
    
    const container = document.createElement('div');
    container.id = 'notification-container';
    document.body.appendChild(container);
    
    const vm = notificationApp.mount(container);
    
    const notificationMethods = {
      success: (message, options) => vm.success(message, options),
      error: (message, options) => vm.error(message, options),
      warning: (message, options) => vm.warning(message, options),
      add: (message, type, options) => vm.addNotification(message, type, options),
      remove: (id) => vm.removeNotification(id),
      clear: () => vm.clearAll()
    };
    
    app.config.globalProperties.$notify = notificationMethods;
    
    app.provide('notify', notificationMethods);
    
    notify._setGlobalMethods(notificationMethods);
    
    app.mixin({
      created() {
        this.$notify = app.config.globalProperties.$notify;
      }
    });
  }
};

export default notificationPlugin;