import api from "./api";

export default {
  getNome(){
    return api.get('/empresas/nome')
  }
}