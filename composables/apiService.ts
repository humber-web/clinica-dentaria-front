import { useRuntimeConfig } from '#app';

export function useApiService() {
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBase;
  
  async function get(endpoint: string) {
    const token = useCookie('token').value;
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`GET ${endpoint} falhou:`, error);
      throw error;
    }
  }
  
  async function post(endpoint: string, data: any) {
    const token = useCookie('token').value;
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`POST ${endpoint} falhou:`, error);
      throw error;
    }
  }

  async function put(endpoint: string, data: any) {
    const token = useCookie('token').value;
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`PUT ${endpoint} falhou:`, error);
      throw error;
    }
  }
  
  async function del(endpoint: string) {
    const token = useCookie('token').value;
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      if (response.status === 204) {
        return null;
      }
      
      return response.json();
    } catch (error) {
      console.error(`DELETE ${endpoint} falhou:`, error);
      throw error;
    }
  }
  
  async function patch(endpoint: string, data: any) {
    const token = useCookie('token').value;
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`PATCH ${endpoint} falhou:`, error);
      throw error;
    }
  }
  
  return {
    get,
    post,
    put,
    delete: del, // Renomeado para 'del' como variável porque 'delete' é palavra reservada
    patch
  };
}