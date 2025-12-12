import axios from "axios";
import { notify } from '../services/notificationService';

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" }
});

export default {
  async buscarDados(id) {
    try {
      const response = await api.get(`/documento/${id}`);
      return response.data;
    } catch (error) {
      notify.error('Erro ao buscar dados:', error);
    }
  },

  async downloadDados(id) {
    try {
      const response = await api.get(`/documento/download/${id}`, {
        responseType: 'blob'
      });
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = `Proposta_${id}_${new Date().toISOString().slice(0,10)}.docx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      notify.success('Documento será baixado!');
      
      return { success: true, filename };
    } catch (error) {
      notify.error('Erro ao baixar documento:', error);
    }
  },

  async visualizarDados(id) {
    try {
      const response = await api.get(`/documento/visual/${id}`);
      return response.data.conteudo;
    } catch (error) {
      notify.error('Erro ao visualizar dados:', error);
    }
  }
};