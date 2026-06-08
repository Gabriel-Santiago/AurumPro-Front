import api from "./api";

const financasService = {
  getDashboard() {
    return api.get("/financas/dashboard");
  },

  atualizarStatusProposta(dados) {
    return api.patch("/financas", dados);
  },
};

export default financasService;
