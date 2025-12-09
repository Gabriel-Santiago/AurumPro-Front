import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" }
});

export default {
  // 1. Buscar dados da proposta
  async buscarDados(id) {
    try {
      const response = await api.get(`/documento/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      throw error;
    }
  },

  // 2. Download do documento
  async downloadDados(id) {
    try {
      const response = await api.get(`/documento/download/${id}`, {
        responseType: 'blob'
      });
      
      // Extrai nome do arquivo do header
      const contentDisposition = response.headers['content-disposition'];
      let filename = `Proposta_${id}_${new Date().toISOString().slice(0,10)}.docx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      // Cria link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      throw error;
    }
  },

  // 3. Visualizar conteúdo (texto)
  async visualizarDados(id) {
    try {
      const response = await api.get(`/documento/visual/${id}`);
      return response.data.conteudo; // ✅ AGORA funciona
    } catch (error) {
      console.error('Erro ao visualizar dados:', error);
      throw error;
    }
  }
};