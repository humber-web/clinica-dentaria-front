import { ref } from "vue";
import type { PlanoTratamento } from "~/types/plano"; 

export function usePlanos() {
  const { get, post, put, delete: del } = useApiService();
  
  const planos = ref<PlanoTratamento[]>([]);
  const currentPlano = ref<PlanoTratamento | null>(null);
  const planoAtivo = ref<PlanoTratamento | null>(null);
  const loadingPlano = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetch active treatment plan for a patient
   */
  async function fetchPlanoAtivo(pacienteId: number): Promise<PlanoTratamento | null> {
    loadingPlano.value = true;
    error.value = null;

    try {
      const data = await get(`pacientes/planos/${pacienteId}/plano-ativo`);
      planoAtivo.value = data;
      return data;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("404")) {
        // Not found is an expected case - patient might not have an active plan
        console.info(`Paciente ${pacienteId} não possui plano ativo.`);
        planoAtivo.value = null;
        return null;
      }
      
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao buscar plano ativo para paciente ${pacienteId}:`, err);
      return null;
    } finally {
      loadingPlano.value = false;
    }
  }

  /**
   * Get all treatment plans for a patient
   */
  async function fetchPlanosPaciente(pacienteId: number): Promise<PlanoTratamento[]> {
    loadingPlano.value = true;
    error.value = null;

    try {
      const data = await get(`pacientes/planos/${pacienteId}/planos`);
      planos.value = data;
      return data;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao buscar planos para paciente ${pacienteId}:`, err);
      return [];
    } finally {
      loadingPlano.value = false;
    }
  }

  /**
   * Get a specific treatment plan by ID
   */
  async function getPlano(planoId: number): Promise<PlanoTratamento | null> {
    loadingPlano.value = true;
    error.value = null;

    try {
      const data = await get(`planos/${planoId}`);
      currentPlano.value = data;
      return data;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao buscar plano ${planoId}:`, err);
      return null;
    } finally {
      loadingPlano.value = false;
    }
  }

  return {
    planos,
    currentPlano,
    planoAtivo,
    loadingPlano,
    error,
    fetchPlanoAtivo,
    fetchPlanosPaciente,
    getPlano,
    // Add other functions as needed (create, update, delete)
  };
}