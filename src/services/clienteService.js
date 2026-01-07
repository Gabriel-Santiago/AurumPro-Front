import api from "./api";

export default {
  buscarPorId(id) {
    return api.get(`/clientes/cliente/${id}`);
  }
}