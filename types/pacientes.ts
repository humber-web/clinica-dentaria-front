import type { ClinicaMinimal } from './clinica';

// Tipo mínimo usado para referências simples (ex: seleção em dropdown)
export interface PacienteMinimal {
  id: number;
  nome: string;
}

// Tipo para listagem de pacientes
export interface PacienteListItem {
  id: number;
  nome: string;
  nif?: string;
  data_nascimento?: string; // ISO date string
  sexo?: string;
  telefone?: string;
  email?: string;
  nacionalidade?: string;
  tipo_documento?: string;
  numero_documento?: string;
  validade_documento?: string; // ISO date string
  pais_residencia?: string;
  morada?: string;
  clinica: ClinicaMinimal;
}

// DTO para criação de paciente
export interface PacienteCreate {
  clinica_id: number;
  nome: string;
  nif?: string;
  data_nascimento?: string; // ISO date string
  sexo?: string;
  telefone?: string;
  email?: string;
  nacionalidade?: string;
  tipo_documento?: string;
  numero_documento?: string;
  validade_documento?: string; // ISO date string
  pais_residencia?: string;
  morada?: string;
}

// DTO para atualização de paciente
export interface PacienteUpdate {
  nome?: string;
  nif?: string;
  data_nascimento?: string; // ISO date string
  sexo?: string;
  telefone?: string;
  email?: string;
  nacionalidade?: string;
  tipo_documento?: string;
  numero_documento?: string;
  validade_documento?: string; // ISO date string
  pais_residencia?: string;
  morada?: string;
}

// Tipo principal para uso nos componentes
export type Paciente = PacienteListItem;