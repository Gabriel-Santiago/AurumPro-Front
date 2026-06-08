import { describe, it, expect, vi } from "vitest";
import { useErrorHandler } from "@/composables/useErrorHandler";

describe("useErrorHandler", () => {
  it("retorna mensagem de fallback quando erro não tem resposta", () => {
    const { getErrorMessage } = useErrorHandler();
    expect(getErrorMessage({}, "Erro customizado")).toBe("Erro customizado");
    expect(getErrorMessage(new Error("falha"), "Erro customizado")).toBe("falha");
  });

  it("registra erro no console", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { logError } = useErrorHandler();
    const err = new Error("teste");

    logError(err, "contexto-teste");

    expect(spy).toHaveBeenCalledWith("[contexto-teste]", err);
    spy.mockRestore();
  });
});
