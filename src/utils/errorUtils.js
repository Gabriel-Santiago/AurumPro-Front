export function getApiErrorMessage(error, fallback = "Ocorreu um erro inesperado.") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.mensagem ||
    error?.response?.data?.erro ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

export function isUnauthorizedError(error) {
  return error?.response?.status === 401;
}

export function isForbiddenError(error) {
  return error?.response?.status === 403;
}

export function isValidationError(error) {
  return error?.response?.status === 400 || error?.response?.status === 422;
}
