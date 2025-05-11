<script setup lang="ts">
import { ref } from "vue";
import { Edit, ClipboardList, Plus } from "lucide-vue-next";

// Define Paciente type if not imported from elsewhere
type Consulta = {
  data: string;
  hora: string;
  doutor: string;
  sala: string;
  estado: string;
  tipo: string;
  observacoes: string;
};

type Plano = {
  id: string;
  titulo: string;
  dataCriacao: string;
  estado: string;
  progresso: number;
  descricao?: string;
};

type Anotacao = {
  autor: string;
  data: string;
  texto: string;
  anexos?: { nome: string; url: string }[];
};

type Paciente = {
  id: string;
  nome: string;
  idade: number;
  sexo: "M" | "F" | "Outro";
  nif: string;
  temFichaClinica: boolean;
  dataNascimento: string;
  telefone: string;
  endereco: string;
  email: string;
  consultas: Consulta[];
  planos: Plano[];
  anotacoes: Anotacao[];
};

const paciente = ref<Paciente>({
  id: "123",
  nome: "Maria Andrade",
  idade: 34,
  sexo: "F",
  nif: "123456789",
  temFichaClinica: true,
  dataNascimento: "1990-01-01",
  telefone: "912345678",
  endereco: "Rua das Flores, 123, São Filipe",
  email: "maria@example.com",

  // Histórico de consultas
  consultas: [
    {
      data: "2025-04-15",
      hora: "10:00",
      doutor: "João Silva",
      sala: "Sala 101",
      estado: "Concluída",
      tipo: "Consulta Regular",
      observacoes: "Paciente chegou no horário."
    },
    {
      data: "2025-03-20",
      hora: "15:30",
      doutor: "Maria Oliveira",
      sala: "Sala 102",
      estado: "Concluída",
      tipo: "Primeira Consulta",
      observacoes: "Avaliação inicial."
    },
    {
      data: "2025-05-10",
      hora: "14:30",
      doutor: "João Silva",
      sala: "Sala 101",
      estado: "Agendada",
      tipo: "Retorno",
      observacoes: "Verificar evolução do tratamento."
    }
  ],

  // Planos de tratamento
  planos: [
    {
      id: "1",
      titulo: "Tratamento Ortodôntico",
      dataCriacao: "2025-03-20",
      estado: "Em andamento",
      progresso: 35,
      descricao: "Plano de tratamento ortodôntico com duração estimada de 18 meses."
    },
    {
      id: "2",
      titulo: "Tratamento de Canal",
      dataCriacao: "2025-02-10",
      estado: "Concluído",
      progresso: 100,
      descricao: "Tratamento de canal no dente 26."
    }
  ],

  // Anotações da ficha clínica
  anotacoes: [
    {
      autor: "Dr. João Silva",
      data: "2025-04-15",
      texto:
        "Paciente apresentou melhora significativa após o tratamento. Recomendado continuar com os medicamentos prescritos por mais 7 dias.",
      anexos: [
        { nome: "raio-x.pdf", url: "#" },
        { nome: "prescricao.pdf", url: "#" }
      ]
    },
    {
      autor: "Dra. Maria Oliveira",
      data: "2025-03-20",
      texto:
        "Primeira consulta. Paciente relata dor na região molar direita há 3 dias. Iniciado tratamento com antibióticos e analgésicos."
    }
  ]
});


// loading state & mock patient
const isLoading = ref(false);


const activeTab = ref<"resumo" | "ficha-clinica" | "consultas" | "planos">(
  "resumo"
);

// action handlers (stubbed for now)
function openEditarPaciente() {
  console.log("Editar Paciente clicked");
}
function openFichaClinica() {
  console.log("Ficha Clínica clicked");
}
function openAgendarConsulta() {
  console.log("Agendar Consulta clicked");
}

function openAdicionarAnotacao() {
  console.log("Abrir add nota");
}

function openAnexarFicheiro() {
  console.log("Abrir attach ficheiro");
}

function viewConsulta(consulta: any) {
  console.log("Visualizar consulta:", consulta);
}

function viewPlano(plano: any) {
  console.log("Visualizar plano:", plano);
}

function editPlano(plano: any) {
  console.log("Editar plano:", plano);
}

function newPlano() {
  console.log("Novo plano de tratamento");
}
</script>

<template>
  <div class="p-4 md:p-6 space-y-6">
    <PatientsHeader :paciente="paciente" :isLoading="isLoading">
      <template #actions>
        <Button @click="openEditarPaciente">
          <Edit class="mr-2 h-4 w-4" /> Editar Paciente
        </Button>
        <Button @click="openFichaClinica">
          <ClipboardList class="mr-2 h-4 w-4" />
          {{ paciente.temFichaClinica ? "Editar Ficha" : "Nova Ficha Clínica" }}
        </Button>
        <Button @click="openAgendarConsulta">
          <Plus class="mr-2 h-4 w-4" /> Agendar Consulta
        </Button>
      </template>
    </PatientsHeader>

    <PatientsTabs v-model:active="activeTab" />

    <PatientsResumoTab
      v-if="activeTab === 'resumo'"
      :isLoading="isLoading"
      :paciente="{
        ...paciente,
        dataNascimento: paciente.dataNascimento ?? '',
      }"
    />

    <PatientsFichaTab
      v-if="activeTab === 'ficha-clinica'"
      :isLoading="isLoading"
      :paciente="paciente"
      @add-note="openAdicionarAnotacao"
      @attach-file="openAnexarFicheiro"
    />

    <PatientsConsultasTab
      v-if="activeTab === 'consultas'"
      :isLoading="isLoading"
      :consultas="paciente.consultas"
      @schedule="openAgendarConsulta"
      @view="viewConsulta"
    />

    <PatientsPlanosTab
      v-if="activeTab === 'planos'"
      :isLoading="isLoading"
      :planos="paciente.planos"
      @new="newPlano"
      @view="viewPlano"
      @edit="editPlano"
    />

    <!-- rest of your tabs & content goes here… -->
  </div>
</template>
