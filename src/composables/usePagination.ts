import { computed, ref, watch, type Ref } from "vue";

export function usePagination<T>(items: Ref<T[]>, pageSize = 12) {
  const page = ref(1);

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(items.value.length / pageSize)),
  );

  const paginatedItems = computed(() => {
    const start = (page.value - 1) * pageSize;
    return items.value.slice(start, start + pageSize);
  });

  const totalItems = computed(() => items.value.length);

  const rangeStart = computed(() =>
    items.value.length ? (page.value - 1) * pageSize + 1 : 0,
  );

  const rangeEnd = computed(() =>
    Math.min(page.value * pageSize, items.value.length),
  );

  watch(
    totalPages,
    (total) => {
      if (page.value > total) {
        page.value = total;
      }
    },
    { flush: "sync" },
  );

  function nextPage() {
    if (page.value < totalPages.value) page.value += 1;
  }

  function prevPage() {
    if (page.value > 1) page.value -= 1;
  }

  function goToPage(target: number) {
    page.value = Math.min(Math.max(1, target), totalPages.value);
  }

  function resetPage() {
    page.value = 1;
  }

  return {
    page,
    totalPages,
    paginatedItems,
    totalItems,
    rangeStart,
    rangeEnd,
    nextPage,
    prevPage,
    goToPage,
    resetPage,
  };
}
