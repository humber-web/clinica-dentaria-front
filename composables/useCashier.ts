import { ref, computed } from 'vue';
import { useToast } from '@/components/ui/toast';
import type { 
  CashierSession, 
  CashierPayment, 
  PendingInvoice, 
  PendingParcel,
  CashierSummary 
} from '@/types/caixa';

export const useCashier = () => {
  const { toast } = useToast();

  // Estado reativo
  const session = ref<CashierSession | null>(null);
  const pendingInvoices = ref<PendingInvoice[]>([]);
  const pendingParcels = ref<PendingParcel[]>([]);
  const payments = ref<CashierPayment[]>([]);
  const loading = ref(false);

  // Dados mock
  const mockPendingInvoices: PendingInvoice[] = [
    {
      id: 1,
      numero: 'FAT-2024-001',
      data_emissao: '2024-01-15',
      cliente_nome: 'Ana Silva',
      valor_total: 150.00,
      valor_pendente: 150.00,
      tipo: 'consulta'
    },
    {
      id: 2,
      numero: 'FAT-2024-002',
      data_emissao: '2024-01-16',
      cliente_nome: 'João Santos',
      valor_total: 200.00,
      valor_pendente: 100.00,
      tipo: 'consulta'
    },
    {
      id: 3,
      numero: 'FAT-2024-003',
      data_emissao: '2024-01-17',
      cliente_nome: 'Maria Costa',
      valor_total: 300.00,
      valor_pendente: 300.00,
      tipo: 'tratamento'
    }
  ];

  const mockPendingParcels: PendingParcel[] = [
    {
      id: 1,
      fatura_numero: 'FAT-2024-010',
      parcela_numero: 1,
      data_vencimento: '2024-01-20',
      valor: 400.00,
      valor_pendente: 400.00,
      cliente_nome: 'Pedro Oliveira'
    },
    {
      id: 2,
      fatura_numero: 'FAT-2024-011',
      parcela_numero: 2,
      data_vencimento: '2024-01-18',
      valor: 250.00,
      valor_pendente: 250.00,
      cliente_nome: 'Carla Mendes'
    },
    {
      id: 3,
      fatura_numero: 'FAT-2024-012',
      parcela_numero: 1,
      data_vencimento: '2024-01-22',
      valor: 180.00,
      valor_pendente: 180.00,
      cliente_nome: 'Ricardo Lima'
    }
  ];

  // Buscar sessão aberta
  const fetchOpenSession = async (): Promise<CashierSession | null> => {
    loading.value = true;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock: retorna sessão aberta se existir
      const mockSession: CashierSession | null = {
        id: 1,
        data_abertura: new Date().toISOString(),
        valor_inicial: 100.00,
        usuario_id: 1,
        usuario_nome: 'Dr. João Silva',
        status: 'aberta'
      };
      
      session.value = mockSession;
      return mockSession;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao verificar sessão de caixa",
        variant: "destructive",
      });
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Abrir nova sessão
  const openSession = async (valorInicial: number): Promise<CashierSession> => {
    loading.value = true;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSession: CashierSession = {
        id: Date.now(),
        data_abertura: new Date().toISOString(),
        valor_inicial: valorInicial,
        usuario_id: 1,
        usuario_nome: 'Dr. João Silva',
        status: 'aberta'
      };
      
      session.value = newSession;
      payments.value = []; // Reset payments
      
      toast({
        title: "Caixa Aberto",
        description: `Sessão iniciada com valor inicial de €${valorInicial.toFixed(2)}`,
      });
      
      return newSession;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao abrir sessão de caixa",
        variant: "destructive",
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Buscar pendências
  const fetchPending = async (sessionId: number): Promise<void> => {
    loading.value = true;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      pendingInvoices.value = [...mockPendingInvoices];
      pendingParcels.value = [...mockPendingParcels];
      
      toast({
        title: "Pendências Carregadas",
        description: `${pendingInvoices.value.length} faturas e ${pendingParcels.value.length} parcelas pendentes`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar pendências",
        variant: "destructive",
      });
    } finally {
      loading.value = false;
    }
  };

  // Registrar pagamento
  const pay = async (sessionId: number, paymentData: {
    targetType: 'fatura' | 'parcela';
    targetId: number;
    valorPago: number;
    metodo: 'dinheiro' | 'cartao' | 'transferencia';
    observacoes?: string;
  }): Promise<void> => {
    loading.value = true;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPayment: CashierPayment = {
        id: Date.now(),
        session_id: sessionId,
        target_type: paymentData.targetType,
        target_id: paymentData.targetId,
        valor_pago: paymentData.valorPago,
        metodo_pagamento: paymentData.metodo,
        data_pagamento: new Date().toISOString(),
        observacoes: paymentData.observacoes,
        created_at: new Date().toISOString()
      };
      
      payments.value.push(newPayment);
      
      // Atualizar pendências
      if (paymentData.targetType === 'fatura') {
        const invoiceIndex = pendingInvoices.value.findIndex(inv => inv.id === paymentData.targetId);
        if (invoiceIndex !== -1) {
          pendingInvoices.value[invoiceIndex].valor_pendente -= paymentData.valorPago;
          if (pendingInvoices.value[invoiceIndex].valor_pendente <= 0) {
            pendingInvoices.value.splice(invoiceIndex, 1);
          }
        }
      } else {
        const parcelIndex = pendingParcels.value.findIndex(parc => parc.id === paymentData.targetId);
        if (parcelIndex !== -1) {
          pendingParcels.value[parcelIndex].valor_pendente -= paymentData.valorPago;
          if (pendingParcels.value[parcelIndex].valor_pendente <= 0) {
            pendingParcels.value.splice(parcelIndex, 1);
          }
        }
      }
      
      toast({
        title: "Pagamento Registrado",
        description: `Pagamento de €${paymentData.valorPago.toFixed(2)} registrado com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao registrar pagamento",
        variant: "destructive",
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Fechar sessão
  const closeSession = async (sessionId: number, valorFinal: number): Promise<void> => {
    loading.value = true;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (session.value) {
        session.value.data_fechamento = new Date().toISOString();
        session.value.valor_final = valorFinal;
        session.value.status = 'fechada';
      }
      
      toast({
        title: "Caixa Fechado",
        description: `Sessão encerrada com valor final de €${valorFinal.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fechar sessão de caixa",
        variant: "destructive",
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Computed para resumo
  const summary = computed((): CashierSummary => {
    const valorInicial = session.value?.valor_inicial || 0;
    
    const totalDinheiro = payments.value
      .filter(p => p.metodo_pagamento === 'dinheiro')
      .reduce((sum, p) => sum + p.valor_pago, 0);
    
    const totalCartao = payments.value
      .filter(p => p.metodo_pagamento === 'cartao')
      .reduce((sum, p) => sum + p.valor_pago, 0);
    
    const totalTransferencia = payments.value
      .filter(p => p.metodo_pagamento === 'transferencia')
      .reduce((sum, p) => sum + p.valor_pago, 0);
    
    const totalRecebido = totalDinheiro + totalCartao + totalTransferencia;
    const saldoEsperado = valorInicial + totalDinheiro;
    
    return {
      valorInicial,
      totalDinheiro,
      totalCartao,
      totalTransferencia,
      totalRecebido,
      saldoEsperado
    };
  });

  return {
    session,
    pendingInvoices,
    pendingParcels,
    payments,
    loading,
    summary,
    fetchOpenSession,
    openSession,
    fetchPending,
    pay,
    closeSession
  };
};