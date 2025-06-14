export type FaturaTipo = 'consulta' | 'plano';
export type FaturaEstado = 'pendente' | 'parcial' | 'paga' | 'cancelada';
export type ParcelaEstado = 'pendente' | 'parcial' | 'paga';

// Base invoice type
export interface FaturaBase {
  paciente_id: number;
  tipo: FaturaTipo;
  consulta_id?: number | null;
  plano_id?: number | null;
}

// Create invoice request
export interface FaturaCreate extends FaturaBase {
  // Server calculates totals and status
}

// Invoice item base
export interface FaturaItemBase {
  origem_tipo: string; // 'consulta_item' or 'plano_item'
  origem_id: number;
  quantidade: number;
  preco_unitario: number;
}

// Create invoice item request
export interface FaturaItemCreate extends FaturaItemBase {
  // No additional fields
}

// Payment installment base
export interface ParcelaBase {
  numero: number;
  valor_planejado: number;
  data_vencimento?: string | null; // ISO date string
}

// Create payment installment request
export interface ParcelaCreate extends ParcelaBase {
  // No additional fields
}

// Read payment installment response
export interface ParcelaRead extends ParcelaBase {
  id: number;
  valor_pago?: number | null;
  data_pagamento?: string | null; // ISO date string
  estado: ParcelaEstado;
}

// Read invoice item response
export interface FaturaItemRead extends FaturaItemBase {
  id: number;
  total: number;
}

// Read invoice response
export interface FaturaRead extends FaturaBase {
  id: number;
  data_emissao: string; // ISO date string
  total: number;
  estado: FaturaEstado;
  itens: FaturaItemRead[];
  parcelas: ParcelaRead[];
}