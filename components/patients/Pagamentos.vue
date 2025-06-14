<template>
  <div class="space-y-6">
    <!-- Header com estatísticas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-4">
          <div class="text-center">
            <p class="text-2xl font-bold">{{ estatisticas.quantidade }}</p>
            <p class="text-sm text-muted-foreground">Total de Faturas</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="text-center">
            <p class="text-2xl font-bold text-green-600">{{ formatCurrency(estatisticas.pago) }}</p>
            <p class="text-sm text-muted-foreground">Valor Pago</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="text-center">
            <p class="text-2xl font-bold text-orange-600">{{ formatCurrency(estatisticas.pendente) }}</p>
            <p class="text-sm text-muted-foreground">Valor Pendente</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="text-center">
            <p class="text-2xl font-bold">{{ formatCurrency(estatisticas.total) }}</p>
            <p class="text-sm text-muted-foreground">Valor Total</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Error state -->
    <Card v-else-if="error" class="border-red-200">
      <CardContent class="p-6 text-center">
        <p class="text-red-600">{{ error }}</p>
        <Button @click="loadFaturas" class="mt-4">Tentar Novamente</Button>
      </CardContent>
    </Card>

    <!-- Lista de faturas -->
    <FaturasList 
      v-else
      :faturas="faturas"
      @view-details="handleViewDetails"
      @pay="handlePay"
    />


    
    <!-- Modal de detalhes -->
    <Dialog :open="showDetails" @update:open="showDetails = $event">
      <DialogContent class="max-w-4xl max-h-[80vh] overflow-y-auto">
        <FaturasDetail 
          v-if="selectedFatura"
          :fatura="selectedFatura"
        />
        
        <DialogFooter>
          <Button @click="showDetails = false" variant="outline">Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Modal de pagamento -->
    <FaturasPaymentModal
      :open="showPayment"
      :fatura-id="selectedFaturaId"
      :parcelas="selectedParcelas"
      @close="showPayment = false"
      @payment-success="handlePaymentSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { useFaturacao,formatCurrency } from '@/composables/useFaturacao';
import type { FaturaRead } from '@/types/fatura';

const props = defineProps<{
  pacienteId: number;
}>();

// Estado local
const showDetails = ref(false);
const showPayment = ref(false);
const selectedFaturaId = ref<number | null>(null);
const selectedFatura = ref<FaturaRead | null>(null);
import type { ParcelaRead } from '@/types/fatura';
const selectedParcelas = ref<ParcelaRead[]>([]); // Initialize with an empty array

// Composable
const { faturas, loading, error, estatisticas, fetchFaturasPaciente, getFatura } = useFaturacao();

// Computed para parcelas da fatura selecionada
// const selectedParcelas = computed(() => {
//   if (!selectedFaturaId.value) return [];
//   const fatura = getFatura(selectedFaturaId.value);
//   return fatura?.parcelas || [];
// });

// Carregar faturas
const loadFaturas = async () => {
  await fetchFaturasPaciente(props.pacienteId);
};

// Handlers
const handleViewDetails = async (faturaId: number) => {
  selectedFatura.value = (await getFatura(faturaId)) || null;
  showDetails.value = true;
};

const handlePay = async (faturaId: number) => {
  selectedFaturaId.value = faturaId;
  const fatura = await getFatura(faturaId);
  selectedParcelas.value = fatura?.parcelas || [];
  showPayment.value = true;
};

const handlePaymentSuccess = () => {
  showPayment.value = false;
  selectedFaturaId.value = null;
};

// Lifecycle
onMounted(() => {
  loadFaturas();
});
</script>