<template>
  <Teleport to="body">
    <div
      ref="backdropRef"
      class="fixed inset-0 z-[2000] flex items-center justify-center p-4 transition-colors max-md:items-end max-md:p-0"
      :class="[
        isDark ? 'bg-black/60' : 'bg-black/35',
        variant === 'fullscreen' ? 'md:items-center md:p-4 max-md:items-stretch' : '',
        variant === 'sheet' ? 'max-md:items-end' : '',
        variant === 'dialog' ? 'max-md:items-end' : '',
      ]"
      @click.self="$emit('close')"
    >
      <div
        ref="modalRef"
        class="flex w-full flex-col overflow-hidden shadow-2xl transition-colors"
        :class="[
          modalSizeClass,
          modalVariantClass,
          isDark
            ? 'border border-border-dark bg-surface-card-dark text-aurum'
            : 'bg-surface-light text-text-body',
          modalClass,
        ]"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? titleId : undefined"
        tabindex="-1"
      >
        <div
          v-if="title || $slots.header"
          class="flex shrink-0 items-start justify-between gap-3 border-b px-5 py-4"
          :class="isDark ? 'border-border-dark-soft' : 'border-border-light'"
        >
          <div class="min-w-0 flex-1">
            <slot name="header">
              <h3 :id="titleId" class="m-0 text-lg font-semibold">{{ title }}</h3>
            </slot>
          </div>
          <button
            type="button"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-2xl leading-none transition-colors"
            :class="isDark
              ? 'text-aurum hover:bg-border-dark-soft'
              : 'text-text-muted hover:bg-surface-hover-light hover:text-text-body'"
            aria-label="Fechar modal"
            @click="$emit('close')"
          >
            ×
          </button>
        </div>

        <div
          class="flex-1 overflow-y-auto"
          :class="[
            noBodyPadding ? 'p-0' : 'px-5 py-4',
            !title && !$slots.header && !noBodyPadding ? 'pt-5' : '',
            bodyClass,
          ]"
        >
          <slot />
        </div>

        <div
          v-if="$slots.footer"
          class="shrink-0 border-t px-5 py-4"
          :class="isDark ? 'border-border-dark-soft' : 'border-border-light'"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, useId } from "vue";
import { useThemeStore } from "@/stores/themeStore";
import { useFocusTrap } from "@/composables/useFocusTrap";

const props = defineProps({
  title: { type: String, default: "" },
  variant: {
    type: String,
    default: "dialog",
    validator: (v) => ["dialog", "sheet", "fullscreen"].includes(v),
  },
  size: {
    type: String,
    default: "md",
    validator: (v) => ["md", "lg", "xl"].includes(v),
  },
  modalClass: { type: String, default: "" },
  bodyClass: { type: String, default: "" },
  noBodyPadding: { type: Boolean, default: false },
});

const emit = defineEmits(["close"]);

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDark);

const modalRef = ref(null);
const uid = useId();
const titleId = computed(() => `modal-title-${uid}`);

const modalVariantClass = computed(() => {
  const map = {
    dialog: "max-w-md rounded-xl max-md:max-h-[90vh] max-md:w-full max-md:max-w-full max-md:rounded-t-2xl max-md:rounded-b-none",
    sheet: "max-w-lg rounded-t-2xl max-md:max-h-[90vh] max-md:w-full max-md:max-w-full max-md:rounded-b-none",
    fullscreen: "max-md:h-screen max-md:max-h-screen max-md:w-full max-md:max-w-full max-md:rounded-none",
  };
  return map[props.variant];
});

const modalSizeClass = computed(() => {
  if (props.variant !== "fullscreen") return "max-h-[90vh]";
  const sizes = {
    md: "h-full max-h-[90vh] max-w-3xl rounded-xl",
    lg: "h-full max-h-[90vh] max-w-5xl rounded-xl",
    xl: "h-full max-h-[95vh] max-w-7xl rounded-xl",
  };
  return sizes[props.size];
});

useFocusTrap(modalRef, {
  onEscape: () => emit("close"),
});
</script>
