import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" }
});

export default {
  criar(dados) {
    const response = api.post('/itensProposta', dados);
    return response;
  },

  buscarPorId(id) {
    const response = api.get(`/itensProposta/${id}`);
    return response;
  }
};