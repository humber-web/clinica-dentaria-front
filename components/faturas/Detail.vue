<template>
  <div class="space-y-6">
    <DialogHeader>
      <DialogTitle>Detalhes da Fatura {{ fatura.id }}</DialogTitle>
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
            <p class="font-medium">{{ formatDate(fatura.data_emissao) }}</p>
          </div>
          <div v-if="fatura.tipo === 'plano'">
            <Label>Data de Vencimento</Label>
            <p class="font-medium">{{ formatDate(fatura.parcelas[0]?.data_vencimento || '') }}</p>
          </div>
          <div>
            <Label>Tipo</Label>
            <Badge :variant="getTipoBadgeVariant(fatura.tipo)">
              {{ getTipoLabel(fatura.tipo) }}
            </Badge>
          </div>
          <div>
            <Label>Estado</Label>
            <Badge :variant="getEstadoBadgeVariant(fatura.estado)">
              {{ getEstadoLabel(fatura.estado) }}
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
            <TableRow v-for="item in fatura.itens" :key="item.id">
              <TableCell>{{ item.descricao }}</TableCell>
              <TableCell class="text-center">{{ item.quantidade }}</TableCell>
              <TableCell class="text-right">{{ formatCurrency(item.preco_unitario) }}</TableCell>
              <TableCell class="text-right">{{ formatCurrency(item.total) }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Parcelas (só para fatura de plano) -->
    <Card v-if="fatura.tipo === 'plano'">
      <CardHeader>
        <CardTitle>Parcelas</CardTitle>
      </CardHeader>
      <CardContent>
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
            <TableRow v-for="parcela in fatura.parcelas" :key="parcela.id">
              <TableCell>{{ parcela.numero }}ª parcela</TableCell>
              <TableCell class="text-right">{{ formatCurrency(parcela.valor_planejado) }}</TableCell>
              <TableCell>{{ formatDate(parcela.data_vencimento) }}</TableCell>
              <TableCell>
                {{ parcela.data_pagamento ? formatDate(parcela.data_pagamento) : '-' }}
              </TableCell>
              <TableCell>
                <Badge :variant="getParcelaEstadoBadgeVariant(parcela.estado)">
                  {{ getParcelaEstadoLabel(parcela.estado) }}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
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
            <p class="text-2xl font-bold">{{ formatCurrency(fatura.total) }}</p>
            <p class="text-sm text-muted-foreground">Valor Total</p>
          </div>
          <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p class="text-2xl font-bold text-green-600">{{ formatCurrency(getValorPago(fatura)) }}</p>
            <p class="text-sm text-muted-foreground">Valor Pago</p>
          </div>
          <div class="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p class="text-2xl font-bold text-orange-600">{{ formatCurrency(getValorPendente(fatura)) }}</p>
            <p class="text-sm text-muted-foreground">Valor Pendente</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency, formatDate, getValorPago, getValorPendente } from '@/composables/useFaturacao';
import type { FaturaRead } from '@/types/fatura';

// Props
defineProps<{
  fatura: FaturaRead;
}>();

// Badge helpers (mantêm-se iguais)
const getTipoLabel = (tipo: string) => {
  const labels = { consulta: 'Consulta', tratamento: 'Tratamento', orcamento: 'Orçamento' };
  return labels[tipo as keyof typeof labels] || tipo;
};
const getTipoBadgeVariant = (tipo: string): "default" | "outline" | "secondary" | "destructive" | null | undefined => {
  const variants = { consulta: 'secondary', tratamento: 'default', orcamento: 'outline' } as const;
  return variants[tipo as keyof typeof variants] || 'secondary';
};
const getEstadoLabel = (estado: string) => {
  const labels = { pendente: 'Pendente', pago: 'Pago', parcial: 'Parcial', vencido: 'Vencido' };
  return labels[estado as keyof typeof labels] || estado;
};
const getEstadoBadgeVariant = (estado: string): "default" | "outline" | "secondary" | "destructive" | null | undefined => {
  const variants = { pendente: 'secondary', pago: 'default', parcial: 'outline', vencido: 'destructive' } as const;
  return variants[estado as keyof typeof variants] || 'secondary';
};
const getParcelaEstadoLabel = (estado: string) => {
  const labels = { pendente: 'Pendente', pago: 'Pago', vencido: 'Vencido' };
  return labels[estado as keyof typeof labels] || estado;
};
const getParcelaEstadoBadgeVariant = (estado: string): "default" | "outline" | "secondary" | "destructive" | null | undefined => {
  const variants = { pendente: 'secondary', pago: 'default', vencido: 'destructive' } as const;
  return variants[estado as keyof typeof variants] || 'secondary';
};
</script>
