<!-- pages/doctor/orcamentos.vue -->
<template>
  <!-- <main class="p-6 space-y-6">
    <header class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Orçamentos do Médico</h1>
      <Button @click="criarOrcamento" :disabled="loading">
        <PlusIcon class="w-4 h-4 mr-2" /> Novo Orçamento
      </Button>
    </header>

    <div v-if="loading" class="text-center p-12">
      <Spinner />  
      <p class="mt-4 text-gray-500">A carregar orçamentos...</p>
    </div>

    <Alert v-else-if="error" variant="destructive">
      <AlertTitle>Erro</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <OrcamentosOrcamentoTable
      v-else
      :orcamentos="meusOrcamentos"
      :pacientes="pacientes"
      :entidades="entidades"
      @edit="editarOrcamento"
      @approve="updateStatus($event, 'aprovado')"
      @reject="updateStatus($event, 'rejeitado')"
    /> 
</main>
--></template>

<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useState } from "#app";
import { useRouter } from "vue-router";
import { useOrcamentos } from "~/composables/useOrcamentos";
import { usePacientes } from "~/composables/usePacientes";
import { useEntidades } from "~/composables/useEntidades";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PlusIcon } from "lucide-vue-next";

const router = useRouter();
const user = useState("user");
const clinic = useState("selectedClinic");

const {
  orcamentos,
  loading,
  error,
  fetchOrcamentos,
  createOrcamento,
  updateOrcamentoStatus,
} = useOrcamentos();

const { pacientes, fetchPacientes } = usePacientes();
const { entidades, fetchEntidades } = useEntidades();

// só os orçamentos desta clínica e deste médico
const meusOrcamentos = computed(() =>
  orcamentos.value.filter(
    (o) => o.clinica_id === clinic.value?.id && o.medico_id === user.value?.id
  )
);

onMounted(async () => {
  // carrega tudo sem necessidade de selects
  await Promise.all([
    fetchOrcamentos(),
    fetchPacientes(clinic.value?.id),
    fetchEntidades(),
  ]);
});

// ações
async function criarOrcamento() {
  const id = await createOrcamento(user.value!.id, clinic.value!.id);
  if (id) router.push(`/doctor/orcamentos/${id}/edit`);
}

function editarOrcamento(orc: any) {
  router.push(`/doctor/orcamentos/${orc.id}/edit`);
}

async function updateStatus(
  id: number,
  estado: "aprovado" | "rejeitado" | "rascunho"
) {
  await updateOrcamentoStatus(id, estado);
}
</script>
