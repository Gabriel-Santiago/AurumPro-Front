import axios from "axios";

const API_URL = "http://localhost:8080/empresas";

export default {
  login(email, senha) {
    return axios.post(`${API_URL}/login`, {
      email,
      senha
    });
  },

  register(data) {
    return axios.post(API_URL, data);
  }
};
