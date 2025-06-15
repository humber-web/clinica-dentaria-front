<template>
  <Dialog :open="open" @update:open="$emit('close')">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Registrar Pagamento</DialogTitle>
        <DialogDescription>
          Selecione a parcela e informe os dados do pagamento
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Seleção de parcela -->
        <div class="space-y-2">
          <Label for="parcela">Parcela</Label>
          <Select v-model="selectedParcelaId">
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma parcela" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Valor personalizado</SelectItem>
              <SelectItem 
                v-for="parcela in parcelasPendentes" 
                :key="parcela.id" 
                :value="parcela.id.toString()"
              >
                {{ parcela.numero }}ª parcela - {{ formatCurrency(parcela.valor_planejado) }}
                (Venc: {{ formatDate(parcela.data_vencimento) }})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Valor -->
        <div class="space-y-2">
          <Label for="valor">Valor do Pagamento</Label>
          <Input
            id="valor"
            v-model.number="valor"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            required
          />
        </div>

        <!-- Método de Pagamento -->
        <div class="space-y-2">
          <Label for="metodoPagamento">Método de Pagamento</Label>
          <Select v-model="metodoPagamento" required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um método de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="cartao">Cartão</SelectItem>
              <SelectItem value="transferencia">Transferência</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Data do pagamento -->
        <div class="space-y-2">
          <Label for="data">Data do Pagamento</Label>
          <Input
            id="data"
            v-model="dataPagamento"
            type="date"
            required
          />
        </div>

        <!-- Observações -->
        <div class="space-y-2">
          <Label for="observacoes">Observações (opcional)</Label>
          <Textarea
            id="observacoes"
            v-model="observacoes"
            placeholder="Observações sobre o pagamento..."
            rows="3"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="$emit('close')">
            Cancelar
          </Button>
          <Button type="submit" :disabled="loading || !isFormValid">
            <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

import { useFaturacao,formatCurrency,formatDate,getValorPago,getValorPendente } from '@/composables/useFaturacao';
import type { ParcelaRead, PagamentoRequest, MetodoPagamento } from '@/types/fatura';
import { useToast } from '@/components/ui/toast/use-toast';

const props = defineProps<{
  open: boolean;
  faturaId: number | null;
  parcelas: ParcelaRead[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'payment-success'): void;
}>();

// Composable
const { pagarParcela, loading } = useFaturacao();
const { toast } = useToast();


// Estado do formulário
const selectedParcelaId = ref<string>('');
const valor = ref<number>(0);
const dataPagamento = ref<string>(new Date().toISOString().split('T')[0]);
const metodoPagamento = ref<MetodoPagamento | ''>('');
const observacoes = ref<string>('');

// Computed
const parcelasPendentes = computed(() => {
  return props.parcelas.filter(p => p.estado === 'pendente');
});

const isFormValid = computed(() => {
  return valor.value > 0 && 
         dataPagamento.value && 
         selectedParcelaId.value && 
         metodoPagamento.value;
});

// Watchers
watch(() => selectedParcelaId.value, (newValue) => {
  if (newValue && newValue !== 'custom') {
    const parcela = parcelasPendentes.value.find(p => p.id.toString() === newValue);
    if (parcela) {
      valor.value = parcela.valor_planejado || parcela.valor_planejado || 0;
    }
  } else if (newValue === 'custom') {
    valor.value = 0;
  }
});

// Reset form when modal opens/closes
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetForm();
  }
});

// Métodos
const resetForm = () => {
  selectedParcelaId.value = '';
  valor.value = 0;
  dataPagamento.value = new Date().toISOString().split('T')[0];
  metodoPagamento.value = '';
  observacoes.value = '';
};

const handleSubmit = async () => {
  if (!props.faturaId || !isFormValid.value) return;

  const pagamento: PagamentoRequest = {
    fatura_id: props.faturaId,
    parcela_id: selectedParcelaId.value !== 'custom' ? parseInt(selectedParcelaId.value) : undefined,
    valor_pago: valor.value,
    data_pagamento: dataPagamento.value,
    metodo_pagamento: metodoPagamento.value as MetodoPagamento,
    observacoes: observacoes.value || undefined
  };

  try {
    const success = await pagarParcela(pagamento);
    
    if (success) {
      // Show success toast
      toast({
        title: "Pagamento registrado com sucesso",
        description: `Pagamento de ${formatCurrency(valor.value)} processado com sucesso.`,
      });
      
      // Notify parent to refresh data
      emit('payment-success');
      resetForm();
    } else {
      // Show error toast for API failure
      toast({
        title: "Erro ao processar pagamento",
        description: "Não foi possível registrar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    }
  } catch (error) {
    // Show error toast for exceptions
    toast({
      title: "Erro ao processar pagamento",
      description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
      variant: "destructive",
    });
    console.error('Erro ao processar pagamento:', error);
  }
};
</script>