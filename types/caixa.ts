export interface CashierSession {
  id: number;
  data_abertura: string;
  data_fechamento?: string;
  valor_inicial: number;
  valor_final?: number;
  usuario_id: number;
  usuario_nome: string;
  status: 'aberta' | 'fechada';
}

export interface PaymentMethod {
  id: string;
  label: string;
  icon: string;
}

export interface CashierPayment {
  id: number;
  session_id: number;
  target_type: 'fatura' | 'parcela';
  target_id: number;
  valor_pago: number;
  metodo_pagamento: 'dinheiro' | 'cartao' | 'transferencia';
  data_pagamento: string;
  observacoes?: string;
  created_at: string;
}

export interface PendingInvoice {
  id: number;
  numero: string;
  data_emissao: string;
  cliente_nome: string;
  valor_total: number;
  valor_pendente: number;
  tipo: 'consulta' | 'tratamento';
}

export interface PendingParcel {
  id: number;
  fatura_numero: string;
  parcela_numero: number;
  data_vencimento: string;
  valor: number;
  valor_pendente: number;
  cliente_nome: string;
}

export interface CashierSummary {
  valorInicial: number;
  totalDinheiro: number;
  totalCartao: number;
  totalTransferencia: number;
  totalRecebido: number;
  saldoEsperado: number;
}