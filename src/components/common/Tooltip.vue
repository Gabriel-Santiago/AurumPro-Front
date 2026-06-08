<template>
  <div 
    class="tooltip-simples-container" 
    ref="containerRef"
    @mouseenter="showTooltip" 
    @mouseleave="hideTooltip" 
    @touchstart="toggleTooltip"
  >
    <span class="tooltip-icon" :class="currentTheme">?</span>
    
    <Teleport to="body">
      <transition name="fade">
        <div 
          v-if="isVisible" 
          ref="tooltipRef"
          class="tooltip-simples" 
          :class="[computedPosition, currentTheme]"
          :style="tooltipStyles"
        >
          <div class="tooltip-content">
            {{ content }}
          </div>
          <div class="tooltip-arrow" :class="[computedPosition, currentTheme]"></div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useThemeStore } from '../../stores/themeStore';

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  position: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'bottom', 'left', 'right'].includes(value)
  },
  maxWidth: {
    type: String,
    default: '200px'
  }
});

const themeStore = useThemeStore();
const currentTheme = computed(() => themeStore.theme);

const isVisible = ref(false);
const containerRef = ref(null);
const tooltipRef = ref(null);
const tooltipStyles = ref({});
const computedPosition = ref(props.position);

const showTooltip = () => {
  isVisible.value = true;
};

const hideTooltip = () => {
  isVisible.value = false;
};

const toggleTooltip = () => {
  isVisible.value = !isVisible.value;
};

const checkScreenSpace = (position, containerRect, tooltipWidth = 200, tooltipHeight = 80) => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const padding = 20;

  let hasSpace = true;
  let alternativePosition = position;

  switch (position) {
    case 'top':
      hasSpace = containerRect.top - tooltipHeight - 20 > padding;
      alternativePosition = 'bottom';
      break;
    case 'bottom':
      hasSpace = containerRect.bottom + tooltipHeight + 20 < screenHeight - padding;
      alternativePosition = 'top';
      break;
    case 'left':
      hasSpace = containerRect.left - tooltipWidth - 20 > padding;
      alternativePosition = 'right';
      break;
    case 'right':
      hasSpace = containerRect.right + tooltipWidth + 20 < screenWidth - padding;
      alternativePosition = 'left';
      break;
  }

  return {
    hasSpace,
    alternativePosition
  };
};

const updateTooltipPosition = () => {
  if (!isVisible.value || !containerRef.value) return;

  const containerRect = containerRef.value.getBoundingClientRect();
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;

  const spaceCheck = checkScreenSpace(props.position, containerRect);
  
  const finalPosition = spaceCheck.hasSpace ? props.position : spaceCheck.alternativePosition;
  computedPosition.value = finalPosition;

  let top = 0;
  let left = 0;
  let transform = '';

  switch (finalPosition) {
    case 'top':
      top = containerRect.top + scrollY - 10;
      left = containerRect.left + scrollX + (containerRect.width / 2);
      transform = 'translate(-50%, -100%)';
      break;
    case 'bottom':
      top = containerRect.bottom + scrollY + 10;
      left = containerRect.left + scrollX + (containerRect.width / 2);
      transform = 'translate(-50%, 0)';
      break;
    case 'left':
      top = containerRect.top + scrollY + (containerRect.height / 2);
      left = containerRect.left + scrollX - 10;
      transform = 'translate(-100%, -50%)';
      break;
    case 'right':
      top = containerRect.top + scrollY + (containerRect.height / 2);
      left = containerRect.right + scrollX + 10;
      transform = 'translate(0, -50%)';
      break;
  }

  tooltipStyles.value = {
    position: 'absolute',
    top: `${top}px`,
    left: `${left}px`,
    transform: transform,
    zIndex: '9999',
    maxWidth: props.maxWidth
  };

  if (tooltipRef.value) {
    nextTick(() => {
      adjustPositionToFitScreen();
    });
  }
};

const adjustPositionToFitScreen = () => {
  if (!tooltipRef.value) return;

  const tooltipRect = tooltipRef.value.getBoundingClientRect();
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const padding = 10;

  const styles = { ...tooltipStyles.value };

  if (tooltipRect.right > screenWidth - padding) {
    const overflow = tooltipRect.right - (screenWidth - padding);
    styles.left = `calc(${styles.left} - ${overflow}px)`;
  } else if (tooltipRect.left < padding) {
    const overflow = padding - tooltipRect.left;
    styles.left = `calc(${styles.left} + ${overflow}px)`;
  }

  if (tooltipRect.bottom > screenHeight - padding) {
    const overflow = tooltipRect.bottom - (screenHeight - padding);
    
    if (computedPosition.value === 'top') {
      computedPosition.value = 'bottom';
      const containerRect = containerRef.value.getBoundingClientRect();
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      styles.top = `${containerRect.bottom + scrollY + 10}px`;
      styles.transform = 'translate(-50%, 0)';
    } else {
      styles.top = `calc(${styles.top} - ${overflow}px)`;
    }
  } else if (tooltipRect.top < padding) {
    const overflow = padding - tooltipRect.top;
    
    if (computedPosition.value === 'bottom') {
      computedPosition.value = 'top';
      const containerRect = containerRef.value.getBoundingClientRect();
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      styles.top = `${containerRect.top + scrollY - 10}px`;
      styles.transform = 'translate(-50%, -100%)';
    } else {
      styles.top = `calc(${styles.top} + ${overflow}px)`;
    }
  }

  tooltipStyles.value = styles;
};

watch(isVisible, (newValue) => {
  if (newValue) {
    nextTick(() => {
      updateTooltipPosition();
    });
  }
});

onMounted(() => {
  window.addEventListener('scroll', updateTooltipPosition);
  window.addEventListener('resize', updateTooltipPosition);
});

onUnmounted(() => {
  window.removeEventListener('scroll', updateTooltipPosition);
  window.removeEventListener('resize', updateTooltipPosition);
});
</script>

<style scoped>
.tooltip-simples-container {
  display: inline-flex;
  position: relative;
  margin-left: 4px;
  cursor: help;
  user-select: none;
}

.tooltip-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  transition: all 0.2s ease;
}

/* Tema claro */
.tooltip-icon.light {
  background: #666;
  color: white;
}

.tooltip-icon.light:hover {
  background: #777;
  transform: scale(1.1);
}

.tooltip-icon.dark {
  background: #daa520;
  color: #1a1a1a;
}

.tooltip-icon.dark:hover {
  background: #e6b800;
  transform: scale(1.1);
}

.tooltip-simples {
  position: fixed;
  z-index: 9999;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 15px;
  line-height: 1.4;
  white-space: normal;
  word-wrap: break-word;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.tooltip-content {
  max-width: 100%;
  overflow-wrap: break-word;
  word-break: break-word;
}

.tooltip-simples.light {
  background: white;
  color: #333;
  border: 1px solid #e0e0e0;
}

.tooltip-simples.dark {
  background: #2a2a2a;
  color: #f0f0f0;
  border: 1px solid #444;
}

.tooltip-simples.top {
  margin-top: -8px;
}

.tooltip-simples.bottom {
  margin-top: 8px;
}

.tooltip-simples.left {
  margin-left: -8px;
}

.tooltip-simples.right {
  margin-left: 8px;
}

.tooltip-arrow {
  position: absolute;
  width: 10px;
  height: 10px;
  background: inherit;
  border: inherit;
}

.tooltip-simples.top .tooltip-arrow {
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  border-top: none;
  border-left: none;
}

.tooltip-simples.bottom .tooltip-arrow {
  top: -5px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  border-bottom: none;
  border-right: none;
}

.tooltip-simples.left .tooltip-arrow {
  right: -5px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  border-left: none;
  border-bottom: none;
}

.tooltip-simples.right .tooltip-arrow {
  left: -5px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  border-right: none;
  border-top: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translate(-50%, -20px) scale(0.95);
}

.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px) scale(0.95);
}

.tooltip-simples.top .fade-enter-from,
.tooltip-simples.top .fade-leave-to {
  transform: translate(-50%, -100%) scale(0.95);
}

.tooltip-simples.bottom .fade-enter-from,
.tooltip-simples.bottom .fade-leave-to {
  transform: translate(-50%, 0) scale(0.95);
}

.tooltip-simples.left .fade-enter-from,
.tooltip-simples.left .fade-leave-to {
  transform: translate(-100%, -50%) scale(0.95);
}

.tooltip-simples.right .fade-enter-from,
.tooltip-simples.right .fade-leave-to {
  transform: translate(0, -50%) scale(0.95);
}

@media (max-width: 768px) {
  .tooltip-icon {
    width: 18px;
    height: 18px;
    font-size: 12px;
  }
  
  .tooltip-simples {
    font-size: 12px;
    padding: 8px 10px;
    max-width: 180px !important;
  }
  
  .tooltip-simples.top {
    margin-top: 8px;
    transform: translate(-50%, 0) !important;
  }
  
  .tooltip-simples.top .tooltip-arrow {
    display: none;
  }
}

@media (max-width: 480px) {
  .tooltip-simples {
    max-width: 160px !important;
    font-size: 11px;
    padding: 6px 8px;
  }
}
</style>