import { onMounted, onUnmounted } from "vue";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(containerRef, options = {}) {
  const { onEscape } = options;
  let previousFocus = null;

  function handleKeydown(event) {
    if (event.key === "Escape" && onEscape) {
      event.preventDefault();
      onEscape();
      return;
    }

    if (event.key !== "Tab") return;

    const container = containerRef.value;
    if (!container) return;

    const focusable = [...container.querySelectorAll(FOCUSABLE)];
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  onMounted(() => {
    previousFocus = document.activeElement;
    document.addEventListener("keydown", handleKeydown);

    const container = containerRef.value;
    if (!container) return;

    const focusable = container.querySelectorAll(FOCUSABLE);
    (focusable[0] || container).focus();
  });

  onUnmounted(() => {
    document.removeEventListener("keydown", handleKeydown);
    previousFocus?.focus?.();
  });
}
