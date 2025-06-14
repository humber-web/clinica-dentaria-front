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
                {{ parcela.numero }}ª parcela - {{ formatCurrency(parcela.valor) }}
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

import { useFaturacao } from '@/composables/useFaturacao';
import { formatCurrency, formatDate } from '@/types/mockFatura';
import type { ParcelaRead, PagamentoRequest } from '@/types/fatura';

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

// Estado do formulário
const selectedParcelaId = ref<string>('');
const valor = ref<number>(0);
const dataPagamento = ref<string>(new Date().toISOString().split('T')[0]);
const observacoes = ref<string>('');

// Computed
const parcelasPendentes = computed(() => {
  return props.parcelas.filter(p => p.estado === 'pendente');
});

const isFormValid = computed(() => {
  return valor.value > 0 && dataPagamento.value && selectedParcelaId.value;
});

// Watchers
watch(() => selectedParcelaId.value, (newValue) => {
  if (newValue && newValue !== 'custom') {
    const parcela = parcelasPendentes.value.find(p => p.id.toString() === newValue);
    if (parcela) {
      valor.value = parcela.valor;
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
  observacoes.value = '';
};

const handleSubmit = async () => {
  if (!props.faturaId || !isFormValid.value) return;

  const pagamento: PagamentoRequest = {
    fatura_id: props.faturaId,
    parcela_id: selectedParcelaId.value !== 'custom' ? parseInt(selectedParcelaId.value) : undefined,
    valor: valor.value,
    data_pagamento: dataPagamento.value,
    observacoes: observacoes.value || undefined
  };

  try {
    await pagarParcela(pagamento);
    emit('payment-success');
    resetForm();
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
  }
};
</script>