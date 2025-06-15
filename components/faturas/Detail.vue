<template>
  <div class="space-y-6">
    <DialogHeader>
      <DialogTitle>Detalhes da Fatura {{ localFatura.id }}</DialogTitle>
    </DialogHeader>

    <!-- Informações gerais -->
    <Card>
      <CardHeader>
        <CardTitle>Informações Gerais</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label>Data de Emissão</Label>
            <p class="font-medium">
              {{ formatDate(localFatura.data_emissao) }}
            </p>
          </div>
          <div v-if="localFatura.tipo === 'plano'">
            <Label>Data de Vencimento</Label>
            <p class="font-medium">
              {{ formatDate(lastParcelaDate) }}
            </p>
          </div>
          <div>
            <Label>Tipo</Label>
            <Badge :variant="getTipoBadgeVariant(localFatura.tipo)">
              {{ getTipoLabel(localFatura.tipo) }}
            </Badge>
          </div>
          <div>
            <Label>Estado</Label>
            <Badge :variant="getEstadoBadgeVariant(localFatura.estado)">
              {{ getEstadoLabel(localFatura.estado) }}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Itens da fatura -->
    <Card>
      <CardHeader>
        <CardTitle>Itens da Fatura</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead class="text-center">Quantidade</TableHead>
              <TableHead class="text-right">Valor Unitário</TableHead>
              <TableHead class="text-right">Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="item in localFatura.itens" :key="item.id">
              <TableCell>{{ item.descricao }}</TableCell>
              <TableCell class="text-center">{{ item.quantidade }}</TableCell>
              <TableCell class="text-right">
                {{ formatCurrency(item.preco_unitario) }}
              </TableCell>
              <TableCell class="text-right">
                {{ formatCurrency(item.total) }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Parcelas (só para fatura de plano) -->
    <Card v-if="localFatura.tipo === 'plano'">
      <CardHeader>
        <CardTitle>Parcelas</CardTitle>
      </CardHeader>
      <CardContent>
        <!-- já existem parcelas? só exibe tabela -->
        <div v-if="localFatura.parcelas.length > 0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parcela</TableHead>
                <TableHead class="text-right">Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="parcela in localFatura.parcelas"
                :key="parcela.id"
              >
                <TableCell> {{ parcela.numero }}ª parcela </TableCell>
                <TableCell class="text-right">
                  {{ formatCurrency(parcela.valor_planejado) }}
                </TableCell>
                <TableCell>
                  {{ formatDate(parcela.data_vencimento) }}
                </TableCell>
                <TableCell>
                  {{
                    parcela.data_pagamento
                      ? formatDate(parcela.data_pagamento)
                      : "-"
                  }}
                </TableCell>
                <TableCell>
                  <Badge
                    :variant="getParcelaEstadoBadgeVariant(parcela.estado)"
                  >
                    {{ getParcelaEstadoLabel(parcela.estado) }}
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <!-- não há parcelas → inputs para gerar -->
        <div v-else class="space-y-4">
          <FormField name="numeroParcelas">
            <FormLabel>Número de Parcelas</FormLabel>
            <FormControl>
              <Input type="number" v-model.number="numeroParcelas" min="1" />
            </FormControl>
          </FormField>

          <div
            v-for="(dt, idx) in datasVencimento"
            :key="idx"
            class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
          >
            <FormField :name="`parcela-${idx + 1}`">
              <FormLabel>Parcela {{ idx + 1 }}</FormLabel>
              <FormControl>
                <Input type="date" v-model="datasVencimento[idx]" />
              </FormControl>
            </FormField>
          </div>

          <Button
            class="w-full"
            :disabled="!canGenerateParcelas"
            @click="onGenerateParcelas"
          >
            Gerar Parcelas
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Resumo financeiro -->
    <Card>
      <CardHeader>
        <CardTitle>Resumo Financeiro</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center p-4 bg-muted/50 rounded-lg">
            <p class="text-2xl font-bold">
              {{ formatCurrency(localFatura.total) }}
            </p>
            <p class="text-sm text-muted-foreground">Valor Total</p>
          </div>
          <div
            class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"
          >
            <p class="text-2xl font-bold text-green-600">
              {{ formatCurrency(getValorPago(localFatura)) }}
            </p>
            <p class="text-sm text-muted-foreground">Valor Pago</p>
          </div>
          <div
            class="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
          >
            <p class="text-2xl font-bold text-orange-600">
              {{ formatCurrency(getValorPendente(localFatura)) }}
            </p>
            <p class="text-sm text-muted-foreground">Valor Pendente</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {
  formatCurrency,
  formatDate,
  getValorPago,
  getValorPendente,
  useFaturacao,
} from "@/composables/useFaturacao";
import type { FaturaRead } from "@/types/fatura";
import { useToast } from "@/components/ui/toast/use-toast";

// Props
const props = defineProps<{ fatura: FaturaRead }>();
const emit = defineEmits<{
  (e: "refresh"): void;
}>();
const { toast } = useToast();

const getTipoLabel = (t: string) =>
  ({ consulta: "Consulta", tratamento: "Tratamento", orcamento: "Orçamento" }[
    t
  ] || t);
const getTipoBadgeVariant = (t: string) =>
  ({ consulta: "secondary", tratamento: "default", orcamento: "outline" }[
    t
  ] as any);
const getEstadoLabel = (e: string) =>
  ({
    pendente: "Pendente",
    pago: "Pago",
    parcial: "Parcial",
    vencido: "Vencido",
  }[e] || e);
const getEstadoBadgeVariant = (e: string) =>
  ({
    pendente: "secondary",
    pago: "default",
    parcial: "outline",
    vencido: "destructive",
  }[e] as any);
const getParcelaEstadoLabel = (e: string) =>
  ({ pendente: "Pendente", pago: "Pago", vencido: "Vencido" }[e] || e);
const getParcelaEstadoBadgeVariant = (e: string) =>
  ({ pendente: "secondary", pago: "default", vencido: "destructive" }[
    e
  ] as any);

// Local state
const localFatura = ref<FaturaRead>(props.fatura);

const lastParcelaDate = computed(() => {
  if (!localFatura.value?.parcelas?.length) return "";

  const lastParcela = [...localFatura.value.parcelas].sort(
    (a, b) => b.numero - a.numero
  )[0];

  return lastParcela?.data_vencimento || "";
});

// new parcel‐generation state
const numeroParcelas = ref(1);
const datasVencimento = ref<string[]>([
  props.fatura.data_emissao?.slice(0, 10) || "",
]);

// Update local fatura when prop changes
watch(
  () => props.fatura,
  (newFatura) => {
    localFatura.value = newFatura;
  },
  { immediate: true }
);

// whenever user changes number, reset dates array
watch(
  numeroParcelas,
  (n) => {
    // fill with the invoice date as a sensible default
    const defaultDate = props.fatura.data_emissao?.slice(0, 10) || "";
    datasVencimento.value = Array(n).fill(defaultDate);
  },
  { immediate: true }
);

// validity: must have at least one, and each date non empty
const canGenerateParcelas = computed(
  () =>
    numeroParcelas.value > 0 &&
    datasVencimento.value.length === numeroParcelas.value &&
    datasVencimento.value.every((d) => !!d.trim())
);

// composable call
const { generateParcelas, getFatura } = useFaturacao();

// on click → generate + reload fatura
async function onGenerateParcelas() {
  if (!canGenerateParcelas.value) return;

  try {
    const success = await generateParcelas(
      props.fatura.id,
      numeroParcelas.value,
      datasVencimento.value
    );

    if (success) {
      // Show success toast
      toast({
        title: "Parcelas geradas com sucesso",
        description: `Foram criadas ${numeroParcelas.value} parcelas para esta fatura.`,
      });

      // Fetch updated fatura data and update local state
      const updatedFatura = await getFatura(props.fatura.id);
      if (updatedFatura) {
        localFatura.value = updatedFatura;
      }

      // Emit event to parent to refresh fatura data
      emit("refresh");
    } else {
      // Show error toast
      toast({
        title: "Erro ao gerar parcelas",
        description: "Não foi possível gerar as parcelas. Tente novamente.",
        variant: "destructive",
      });
    }
  } catch (error) {
    // Show error toast with error message
    toast({
      title: "Erro ao gerar parcelas",
      description:
        error instanceof Error ? error.message : "Ocorreu um erro inesperado",
      variant: "destructive",
    });
  }
}
</script>
