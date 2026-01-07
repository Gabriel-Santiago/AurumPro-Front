import api from "./api";

export default {
  login(email, senha){
  return api.post("/empresas/login", { email, senha });
  },

  logout(){
  return api.post("/empresas/logout");
  },

  refresh(){
  return api.post("/empresas/refresh");
  },

  register(data){
  return api.post("/empresas/cadastro", data);
  }
};