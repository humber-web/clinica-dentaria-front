<template>
  <Dialog :open="open" @update:open="$emit('close')">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Fechar Caixa</DialogTitle>
        <DialogDescription>
          Informe o valor final em dinheiro para fechar a sessão
        </DialogDescription>
      </DialogHeader>

      <div v-if="session" class="space-y-4">
        <!-- Resumo da sessão -->
        <div class="bg-muted/50 p-4 rounded-lg space-y-2">
          <div class="flex justify-between">
            <span>Valor Inicial:</span>
            <span class="font-medium">{{ formatCurrency(session.valor_inicial) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Total Recebido (Dinheiro):</span>
            <span class="font-medium text-green-600">{{ formatCurrency(totalDinheiro) }}</span>
          </div>
          <div class="flex justify-between border-t pt-2">
            <span class="font-medium">Saldo Esperado:</span>
            <span class="font-bold">{{ formatCurrency(saldoEsperado) }}</span>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="valorFinal">Valor Final Contado (€)</Label>
            <Input
              id="valorFinal"
              v-model.number="valorFinal"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              required
              class="text-lg"
            />
          </div>

          <!-- Diferença -->
          <div v-if="valorFinal > 0" class="p-3 rounded-lg" :class="diferencaClass">
            <div class="flex justify-between items-center">
              <span class="font-medium">Diferença:</span>
              <span class="font-bold">{{ formatCurrency(diferenca) }}</span>
            </div>
            <p class="text-sm mt-1">
              {{ diferenca > 0 ? 'Sobra de caixa' : diferenca < 0 ? 'Falta de caixa' : 'Caixa confere' }}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="$emit('close')">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              :disabled="loading || valorFinal < 0"
              variant="destructive"
            >
              <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Fechar Caixa
            </Button>
          </DialogFooter>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { useCashier } from '@/composables/useCashier';
import type { CashierSession } from '@/types/caixa';

const props = defineProps<{
  open: boolean;
  session: CashierSession | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'session-closed'): void;
}>();

// Composable
const { closeSession, loading, summary } = useCashier();

// Estado do formulário
const valorFinal = ref<number>(0);

// Computed
const totalDinheiro = computed(() => summary.value.totalDinheiro);
const saldoEsperado = computed(() => summary.value.saldoEsperado);
const diferenca = computed(() => valorFinal.value - saldoEsperado.value);

const diferencaClass = computed(() => {
  if (diferenca.value > 0) return 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200';
  if (diferenca.value < 0) return 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200';
  return 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
});

// Reset form when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    valorFinal.value = saldoEsperado.value;
  }
});

// Métodos
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('cv-CV', {
    style: 'currency',
    currency: 'CVE',
  }).format(value);
};

const handleSubmit = async () => {
  if (!props.session) return;
  
  try {
    await closeSession(props.session.id, valorFinal.value);
    emit('session-closed');
  } catch (error) {
    console.error('Erro ao fechar sessão:', error);
  }
};
</script>