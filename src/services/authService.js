import api from "./api";

const authService = {
  login(email, senha) {
    return api.post("/empresas/login", {
      email,
      senha,
    });
  },

  register(data) {
    return api.post("/empresas/cadastro", data);
  },

  logout() {
    return api.post("/empresas/logout");
  },

  refresh() {
    return api.post("/empresas/refresh");
  },

  check() {
    return api.get("/empresas/auth/check");
  },
};

export default authService;
