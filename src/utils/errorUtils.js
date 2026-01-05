export function getApiErrorMessage(error, fallback = 'Erro inesperado') {
  return error?.response?.data?.message || fallback;
}
