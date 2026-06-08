import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { usePagination } from "@/composables/usePagination";

describe("usePagination", () => {
  it("pagina itens corretamente", () => {
    const items = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    const { paginatedItems, totalPages, page, rangeStart, rangeEnd } = usePagination(items, 5);

    expect(totalPages.value).toBe(3);
    expect(paginatedItems.value).toEqual([1, 2, 3, 4, 5]);
    expect(rangeStart.value).toBe(1);
    expect(rangeEnd.value).toBe(5);

    page.value = 3;
    expect(paginatedItems.value).toEqual([11, 12, 13]);
    expect(rangeEnd.value).toBe(13);
  });

  it("reseta para última página válida quando lista diminui", () => {
    const items = ref(Array.from({ length: 10 }, (_, i) => i + 1));
    const { page, totalPages } = usePagination(items, 5);

    page.value = 2;
    items.value = [1, 2];
    expect(totalPages.value).toBe(1);
    expect(page.value).toBe(1);
  });
});
