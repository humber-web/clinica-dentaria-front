<template>
  <div class="p-4 md:p-6 space-y-6">
    <!-- Header da Consulta -->
    <ConsultasHeader :consulta="currentConsulta" :is-loading="loading">
      <template #actions>
        <Button @click="editarConsulta">
          <Edit class="mr-2 h-4 w-4" /> Editar
        </Button>
        <Button @click="finalizarConsulta">
          <Check class="mr-2 h-4 w-4" /> Concluir
        </Button>
      </template>
    </ConsultasHeader>

    <!-- As Tabs principais -->
    <Tabs v-model:active="activeTab">
      <TabsList>
        <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
        <TabsTrigger value="artigos">Artigos</TabsTrigger>
        <TabsTrigger value="historico">Histórico</TabsTrigger>
      </TabsList>

      <TabsContent value="orcamentos">
        <!-- se estivermos carregando a consulta ou os orçamentos -->
        <div
          v-if="loading || orcamentosLoading"
          class="py-8 text-center text-muted-foreground"
        >
          Carregando…
        </div>

        <!-- quando tivermos os orçamentos -->
        <OrcamentosOrcamentoTable
          v-else
          :orcamentos="orcamentos"
          :pacientes="currentConsulta?.paciente ? [currentConsulta.paciente as PacienteListItem] : []"
          :entidades="entidades"
          :loading="orcamentosLoading"
          @edit="abrirEditarOrcamento"
          @approve="null"
          @reject="null"
        />
      </TabsContent>

      <!-- Procedimentos / Artigos -->
      <!-- <TabsContent value="artigos">
        <ConsultaArtigosTab
          :itens="currentConsulta.itens"
          @add-item="abrirAdicionarItem"
        />
      </TabsContent> -->

      <!-- Histórico de Consultas do Paciente -->
      <!-- <TabsContent value="historico">
        <ConsultasHistoricoTab
          :consultas="currentConsulta.paciente.consultas"
          @view="verConsulta"
        />
      </TabsContent> -->
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useConsultas } from "~/composables/useConsultas";
import { useOrcamentos } from "~/composables/useOrcamentos";
import { useEntidades } from "~/composables/useEntidades";
import ConsultasHeader from "~/components/consultas/Header.vue";
import type { Orcamento } from "~/types/orcamento";
import { Edit, Check } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const { getConsulta, currentConsulta, loading } = useConsultas();
const {
  orcamentos,
  loading: orcamentosLoading,
  fetchOrcamentosByPaciente,
  updateOrcamentoStatus,
} = useOrcamentos();
const { entidades, fetchEntidades } = useEntidades();

const activeTab = ref<"orcamentos" | "artigos" | "historico">("orcamentos");

onMounted(async () => {
  const id = Number(route.params.id);
  getConsulta(id);
  await fetchEntidades();
});

watch([activeTab, currentConsulta], ([tab, consulta]) => {
  console.log(`Tab changed to: ${tab}`, consulta);
  if (tab === "orcamentos" && consulta && consulta.paciente?.id) {
    fetchOrcamentosByPaciente(consulta.paciente.id);
  }
});

function editarConsulta() {
  // lógica de editar
}

async function finalizarConsulta() {
  // lógica de concluir consulta
}

function abrirEditarOrcamento(orcamento) {
  const consultaId = currentConsulta.value!.id;
  router.push(`/doctor/consulta/${consultaId}/orcamentos/${orcamento.id}/edit`);
}

async function atualizarStatusOrcamento(
  orcamento: { id: number },
  novoEstado: "aprovado" | "rejeitado"
) {
  await updateOrcamentoStatus(orcamento.id, novoEstado);
  // recarregar dados da consulta para atualizar UI
  getConsulta(currentConsulta.value!.id);
}

function abrirAdicionarItem() {
  // abre modal ou rota para novo item
}

function verConsulta(id: number) {
  router.push({ name: "consulta-id", params: { id } });
}
</script>
