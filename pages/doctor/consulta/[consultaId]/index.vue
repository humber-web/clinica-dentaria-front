<template>
  <div class="p-4 md:p-6 space-y-6">
    <!-- Header da Consulta -->
    <ConsultasHeader :consulta="currentConsulta!" :is-loading="loading">
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
        <!-- Cabeçalho com botão de novo orçamento -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">Orçamentos do Paciente</h3>
          <Button
            variant="default"
            size="sm"
            @click="criarNovoOrcamento"
            :disabled="
              loading || orcamentosLoading || !currentConsulta?.paciente?.id
            "
          >
            <PlusCircle class="mr-2 h-4 w-4" /> Novo Orçamento
          </Button>
        </div>

        <!-- se estivermos carregando a consulta ou os orçamentos -->
        <div
          v-if="loading || orcamentosLoading"
          class="py-8 text-center text-muted-foreground"
        >
          <div
            class="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"
          ></div>
          Carregando orçamentos...
        </div>

        <!-- quando não houver orçamentos -->
        <Card v-else-if="!orcamentos.length" class="py-8 text-center">
          <CardContent>
            <div class="flex flex-col items-center justify-center space-y-3">
              <FileText class="h-10 w-10 text-muted-foreground" />
              <p class="text-muted-foreground">
                Nenhum orçamento encontrado para este paciente
              </p>
              <Button size="sm" @click="criarNovoOrcamento">
                <PlusCircle class="mr-2 h-4 w-4" /> Criar Orçamento
              </Button>
            </div>
          </CardContent>
        </Card>

        <OrcamentosOrcamentoTable
          v-else
          :orcamentos="orcamentos"
          :pacientes="currentConsulta?.paciente ? [currentConsulta.paciente as PacienteListItem] : []"
          :entidades="entidades"
          :loading="orcamentosLoading"
          @edit="abrirEditarOrcamento"
          @approve="aprovarOrcamento"
          @reject="rejeitarOrcamento"
        />
      </TabsContent>

       <TabsContent value="artigos">
        <ConsultasArtigosTab
          :itens="currentConsulta?.itens || []"
          :loading="loading"
          :disabled="currentConsulta?.estado === 'concluida'"
          :consulta-id="Number(route.params.consultaId)"
          :entidadeId="currentConsulta?.entidade_id"
          @add-item="adicionarArtigoConsulta"
          @update-item="atualizarArtigoConsulta"
          @delete-item="removerArtigoConsulta"
        />
      </TabsContent>
      <!-- Histórico de Consultas do Paciente -->
      <!-- <TabsContent value="historico">
        <ConsultasHistoricoTab
          :consultas="currentConsulta.paciente.consultas"
          @view="verConsulta"
        />
      </TabsContent> -->
    </Tabs>
    <ConsultasAddArtigoModal
      v-if="showAddArtigoModal"
      :show="showAddArtigoModal"
      :edit-item="itemEmEdicao"
      :entidadeId="currentConsulta?.entidade_id"
      :disabled="currentConsulta?.estado === 'concluida'"
      @close="fecharModalArtigo"
      @save="adicionarArtigoConsulta"
      @update="atualizarArtigoConsulta"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useConsultas } from "~/composables/useConsultas";
import { useOrcamentos } from "~/composables/useOrcamentos";
import { useEntidades } from "~/composables/useEntidades";
import type { Orcamento } from "~/types/orcamento";
import type { PacienteListItem } from "~/types/pacientes";
import type { ConsultaItemRead, ConsultaItemCreate, ConsultaItemUpdate } from "~/types/consulta";
import { useToast } from "~/components/ui/toast";
import { PlusCircle, FileText, Edit, Check,ClipboardList } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const { toast } = useToast();

const { 
  getConsulta, 
  currentConsulta, 
  loading,
  addConsultaItem,
  updateConsultaItem,
  deleteConsultaItem
} = useConsultas();

const {
  orcamentos,
  loading: orcamentosLoading,
  fetchOrcamentosByPaciente,
  updateOrcamentoStatus,
  createOrcamento,
} = useOrcamentos();


const { entidades, fetchEntidades } = useEntidades();
const activeTab = ref<"orcamentos" | "artigos" | "historico">("orcamentos");
const creatingOrcamento = ref(false);
const showAddArtigoModal = ref(false);
const itemEmEdicao = ref<ConsultaItemRead | undefined>(undefined);

onMounted(async () => {
  const id = Number(route.params.consultaId);
  await getConsulta(id);
  await fetchEntidades();
});

watch([activeTab, currentConsulta], ([tab, consulta]) => {
  console.log(`Tab changed to: ${tab}`, consulta);
  if (tab === "orcamentos" && consulta && consulta.paciente?.id) {
    fetchOrcamentosByPaciente(consulta.paciente.id);
  }
});

async function adicionarArtigoConsulta(item: ConsultaItemCreate) {
  try {
    const consultaId = Number(route.params.consultaId);
    const result = await addConsultaItem(consultaId, item);
    
    if (result) {
      // Recarregar a consulta para atualizar a lista de itens
      await getConsulta(consultaId);
      
      // Fechar o modal se estiver aberto diretamente
      showAddArtigoModal.value = false;
      
      toast({
        title: "Sucesso",
        description: "Procedimento adicionado com sucesso",
      });
    }
  } catch (error) {
    console.error("Erro ao adicionar procedimento:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao adicionar o procedimento",
      variant: "destructive",
    });
  }
}

async function atualizarArtigoConsulta(itemId: number, item: ConsultaItemUpdate) {
  try {
    const result = await updateConsultaItem(itemId, item);
    
    if (result) {
      // Recarregar a consulta para atualizar a lista de itens
      const consultaId = Number(route.params.consultaId);
      await getConsulta(consultaId);
      
      // Fechar o modal se estiver aberto diretamente
      showAddArtigoModal.value = false;
      
      toast({
        title: "Sucesso",
        description: "Procedimento atualizado com sucesso",
      });
    }
  } catch (error) {
    console.error("Erro ao atualizar procedimento:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao atualizar o procedimento",
      variant: "destructive",
    });
  }
}

async function removerArtigoConsulta(itemId: number) {
  try {
    const result = await deleteConsultaItem(itemId);
    
    if (result) {
      // Recarregar a consulta para atualizar a lista de itens
      const consultaId = Number(route.params.consultaId);
      await getConsulta(consultaId);
      
      toast({
        title: "Sucesso",
        description: "Procedimento removido com sucesso",
      });
    }
  } catch (error) {
    console.error("Erro ao remover procedimento:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao remover o procedimento",
      variant: "destructive",
    });
  }
}

// Funções para modal direto (opcional, se precisar abrir o modal sem passar pelo componente ArtigosTab)
function abrirModalArtigo(item?: ConsultaItemRead) {
  itemEmEdicao.value = item;
  showAddArtigoModal.value = true;
}

function fecharModalArtigo() {
  showAddArtigoModal.value = false;
  itemEmEdicao.value = undefined;
}


function editarConsulta() {
  // lógica de editar
}

async function finalizarConsulta() {
  // lógica de concluir consulta
}


function abrirEditarOrcamento(orcamento: Orcamento) {
  const consultaId = Number(route.params.consultaId);
  router.push(`/doctor/consulta/${consultaId}/orcamento/${orcamento.id}`);
}

async function criarNovoOrcamento() {
  if (!currentConsulta.value?.paciente?.id) {
    toast({
      title: "Erro",
      description: "Não foi possível identificar o paciente da consulta",
      variant: "destructive",
    });
    return;
  }

  try {
    creatingOrcamento.value = true;

    const entidadeId =
      currentConsulta.value.entidade?.id ||
      (entidades.value.length > 0 ? entidades.value[0].id : null);

    if (!entidadeId) {
      toast({
        title: "Atenção",
        description:
          "Não foi possível identificar uma entidade. O orçamento será criado sem entidade associada.",
        variant: "default",
      });
    }

    const novoOrcamento = await createOrcamento(
      currentConsulta.value.paciente.id,
      entidadeId || 0
    );

    if (novoOrcamento) {
      fetchOrcamentosByPaciente(currentConsulta.value.paciente.id);

      const consultaId = Number(route.params.consultaId);
      router.push(`/doctor/consulta/${consultaId}/orcamento/${novoOrcamento}`);

      toast({
        title: "Sucesso",
        description: `Orçamento #${novoOrcamento} criado com sucesso`,
      });
    }
  } catch (error) {
    console.error("Erro ao criar orçamento:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao criar o orçamento",
      variant: "destructive",
    });
  } finally {
    creatingOrcamento.value = false;
  }
}

async function atualizarStatusOrcamento(
  orcamentoId: number,
  novoEstado: "aprovado" | "rejeitado"
) {
  try {
    // Mostrar feedback de carregamento
    toast({
      title: "Processando",
      description: `Atualizando status do orçamento...`,
    });
    
    // Chamar o composable para atualizar o status
    await updateOrcamentoStatus(orcamentoId, novoEstado);
    
    // Atualizar a lista de orçamentos
    if (currentConsulta.value?.paciente?.id) {
      await fetchOrcamentosByPaciente(currentConsulta.value.paciente.id);
    }
    
    // Mostrar feedback de sucesso
    toast({
      title: "Sucesso",
      description: `Orçamento ${novoEstado === 'aprovado' ? 'aprovado' : 'rejeitado'} com sucesso`,
    });
  } catch (error) {
    console.error(`Erro ao ${novoEstado === 'aprovado' ? 'aprovar' : 'rejeitar'} orçamento:`, error);
    
    // Mostrar feedback de erro
    toast({
      title: "Erro",
      description: `Ocorreu um erro ao ${novoEstado === 'aprovado' ? 'aprovar' : 'rejeitar'} o orçamento`,
      variant: "destructive",
    });
  }
}

function aprovarOrcamento(id: number) {
    atualizarStatusOrcamento(id, "aprovado");
}

function rejeitarOrcamento(id: number) {
    atualizarStatusOrcamento(id, "rejeitado");
}

function abrirAdicionarItem() {
  // abre modal ou rota para novo item
}

function verConsulta(id: number) {
  // Fix: Use the correct route name based on your structure
  router.push(`/doctor/consulta/${id}`);
}
</script>
