import { getCurrentInstance } from 'vue';

export const useNotification = () => {
  const instance = getCurrentInstance();
  
  if (!instance) {
    return fallbackNotify;
  }
  
  return instance.appContext.config.globalProperties.$notify || fallbackNotify;
};

export const notify = {
  success: (message, options = {}) => {
    const instance = getCurrentInstance();
    if (instance?.appContext.config.globalProperties.$notify) {
      instance.appContext.config.globalProperties.$notify.success(message, options);
    } 
    else if (window.$notify) {
      window.$notify.success(message, options);
    }
    else {
      showFallbackNotification(message, 'success');
    }
  },
  
  error: (message, options = {}) => {
    const instance = getCurrentInstance();
    if (instance?.appContext.config.globalProperties.$notify) {
      instance.appContext.config.globalProperties.$notify.error(message, options);
    } else if (window.$notify) {
      window.$notify.error(message, options);
    } else {
      showFallbackNotification(message, 'error');
    }
  },
  
  warning: (message, options = {}) => {
    const instance = getCurrentInstance();
    if (instance?.appContext.config.globalProperties.$notify) {
      instance.appContext.config.globalProperties.$notify.warning(message, options);
    } else if (window.$notify) {
      window.$notify.warning(message, options);
    } else {
      showFallbackNotification(message, 'warning');
    }
  },
  
  _setGlobalMethods: (methods) => {
    window.$notify = methods;
  }
};

const fallbackNotify = {
  success: (message) => {
    showFallbackNotification(message, 'success');
  },
  error: (message) => {
    showFallbackNotification(message, 'error');
  },
  warning: (message) => {
    showFallbackNotification(message, 'warning');
  }
};

function showFallbackNotification(message, type) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 9999;
    animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  if (type === 'success') {
    notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
  } else if (type === 'error') {
    notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
  } else if (type === 'warning') {
    notification.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    notification.style.color = '#1f2937';
  }
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  if (!document.getElementById('fallback-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'fallback-notification-styles';
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

if (typeof window !== 'undefined') {
  window.$notify = notify;
}

export default notify;