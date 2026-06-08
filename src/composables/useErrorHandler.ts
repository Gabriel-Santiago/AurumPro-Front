import { getApiErrorMessage } from "../utils/errorUtils";

export function useErrorHandler() {
  function getErrorMessage(
    error: unknown,
    fallback = "Ocorreu um erro inesperado.",
  ): string {
    return getApiErrorMessage(error, fallback);
  }

  function logError(error: unknown, context = "Erro"): void {
    console.error(`[${context}]`, error);
  }

  function handleError(error: unknown, fallback?: string): string {
    logError(error);
    return getErrorMessage(error, fallback);
  }

  return {
    getErrorMessage,
    logError,
    handleError,
  };
}
