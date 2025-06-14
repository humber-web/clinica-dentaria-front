import { ref, computed } from 'vue';
import type { 
  FaturaCreate, 
  FaturaRead, 
  ParcelaCreate,
  FaturaEstado
} from '~/types/fatura';


export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('cv-CV', {
    style: 'currency',
    currency: 'CVE',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-PT');
};

export const getValorPago = (fatura: FaturaRead): number => {
  if (fatura.tipo === 'consulta') {
    // se for consulta única, só está pago se o estado for 'paga'
    return fatura.estado === 'paga' ? fatura.total : 0;
  } else {
    // se for plano, soma todas as parcelas pagas
    return (fatura.parcelas ?? []).reduce((sum, p) => sum + (p.valor_pago ?? 0), 0);
  }
};

export const getValorPendente = (fatura: FaturaRead): number => {
  return fatura.total - getValorPago(fatura);
};

export function useFaturacao() {
  const { get, post, put, delete: del } = useApiService();
  
  const faturas = ref<FaturaRead[]>([]);
  const currentFatura = ref<FaturaRead | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Computed properties for filtering
  const faturasPendentes = computed(() => 
    faturas.value.filter(f => f.estado === 'pendente')
  );
  
  const faturasParciaisPagas = computed(() => 
    faturas.value.filter(f => f.estado === 'parcial' || f.estado === 'paga')
  );
  
  /**
   * Fetches all invoices for a patient
   */
  async function fetchFaturasPaciente(pacienteId: number): Promise<FaturaRead[]> {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await get(`faturas?paciente_id=${pacienteId}`);
      faturas.value = data;
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao buscar faturas para paciente ${pacienteId}:`, err);
      return [];
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Fetches a specific invoice by ID
   */
  async function getFatura(faturaId: number): Promise<FaturaRead | null> {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await get(`faturas/${faturaId}`);
      currentFatura.value = data;
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao buscar fatura ${faturaId}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Creates a new invoice
   */
  async function createFatura(fatura: FaturaCreate): Promise<FaturaRead | null> {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await post('faturas', fatura);
      // Update the faturas list if it's loaded
      if (faturas.value.length > 0) {
        faturas.value.push(data);
      }
      currentFatura.value = data;
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error('Erro ao criar fatura:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Creates a new invoice from a consultation
   */
  async function createFaturaFromConsulta(consultaId: number): Promise<FaturaRead | null> {
    loading.value = true;
    error.value = null;
    
    try {
      // Get the consultation to extract patient ID
      const consulta = await get(`consultas/${consultaId}`);
      
      if (!consulta || !consulta.paciente_id) {
        throw new Error('Consulta não encontrada ou sem paciente associado');
      }
      
      // Create invoice payload
      const faturaPayload: FaturaCreate = {
        paciente_id: consulta.paciente_id,
        tipo: 'consulta',
        consulta_id: consultaId,
        plano_id: null
      };
      
      // Use the standard createFatura method
      return await createFatura(faturaPayload);
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao criar fatura para consulta ${consultaId}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Creates a new invoice from a treatment plan
   */
  async function createFaturaFromPlano(planoId: number): Promise<FaturaRead | null> {
    loading.value = true;
    error.value = null;
    
    try {
      // Get the plan to extract patient ID
      const plano = await get(`planos/${planoId}`);
      
      if (!plano || !plano.paciente_id) {
        throw new Error('Plano não encontrado ou sem paciente associado');
      }
      
      // Create invoice payload
      const faturaPayload: FaturaCreate = {
        paciente_id: plano.paciente_id,
        tipo: 'plano',
        consulta_id: null,
        plano_id: planoId
      };
      
      // Use the standard createFatura method
      return await createFatura(faturaPayload);
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao criar fatura para plano ${planoId}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Adds a payment to an invoice
   */
  async function addPagamento(faturaId: number, parcela: ParcelaCreate): Promise<boolean> {
    loading.value = true;
    error.value = null;
    
    try {
      await post(`faturas/${faturaId}/pagamentos`, parcela);
      // Refresh the invoice to get updated payment status
      await getFatura(faturaId);
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao adicionar pagamento à fatura ${faturaId}:`, err);
      return false;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Cancels an invoice
   */
  async function cancelarFatura(faturaId: number): Promise<boolean> {
    loading.value = true;
    error.value = null;
    
    try {
      await post(`faturas/${faturaId}/cancelar`, {});
      // Update local state
      if (currentFatura.value && currentFatura.value.id === faturaId) {
        currentFatura.value.estado = 'cancelada';
      }
      const index = faturas.value.findIndex(f => f.id === faturaId);
      if (index >= 0) {
        faturas.value[index].estado = 'cancelada';
      }
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao cancelar fatura ${faturaId}:`, err);
      return false;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Processes payment of an installment
   */
  async function pagarParcela(
    faturaId: number, 
    parcelaId: number, 
    valorPago: number
  ): Promise<boolean> {
    loading.value = true;
    error.value = null;
    
    try {
      await post(`faturas/parcelas/${parcelaId}/pagar`, { valor_pago: valorPago });
      // Refresh the invoice to get updated status
      await getFatura(faturaId);
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      console.error(`Erro ao pagar parcela ${parcelaId}:`, err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  


    const estatisticas = computed(() => {
    const total = faturas.value.reduce((sum, f) => sum + f.total, 0);
    const pago = faturas.value.reduce((sum, f) => {
      // If 'pago' exists, use it; otherwise, sum paid parcelas if available, else 0
      if ('pago' in f && typeof (f as any).pago === 'number') {
        return sum + (f as any).pago;
      } else if ('parcelas' in f && Array.isArray((f as any).parcelas)) {
        // Sum the valor_pago of each parcela if available
        return sum + ((f as any).parcelas.reduce((pSum: number, parcela: any) => pSum + (parcela.valor_pago ?? 0), 0));
      } else {
        return sum;
      }
    }, 0);
    const pendente = faturas.value.reduce((sum, f) => {
      let pago = 0;
      if ('pago' in f && typeof (f as any).pago === 'number') {
        pago = (f as any).pago;
      } else if ('parcelas' in f && Array.isArray((f as any).parcelas)) {
        pago = (f as any).parcelas.reduce((pSum: number, parcela: any) => pSum + (parcela.valor_pago ?? 0), 0);
      }
      return sum + (f.total - pago);
    }, 0);
    
    return {
      total,
      pago,
      pendente,
      quantidade: faturas.value.length
    };
  });
  
  return {
    faturas,
    currentFatura,
    loading,
    error,
    faturasPendentes,
    faturasParciaisPagas,
    fetchFaturasPaciente,
    getFatura,
    createFatura,
    createFaturaFromConsulta,
    createFaturaFromPlano,
    addPagamento,
    cancelarFatura,
    pagarParcela,
    estatisticas
  };
}