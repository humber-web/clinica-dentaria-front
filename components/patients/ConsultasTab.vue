<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

import {
  Calendar,
  Eye,
  Plus
} from 'lucide-vue-next'

interface Consulta {
  data: string
  hora: string
  doutor: string
  sala: string
  estado: string
  tipo?: string
  observacoes?: string
}

const props = defineProps<{
  isLoading: boolean
  consultas?: Consulta[]
}>()

const emit = defineEmits<{
  (e: 'schedule'): void
  (e: 'view', consulta: Consulta): void
}>()

function formatarData(data: string): string {
  const d = new Date(data)
  return d.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function badgeClasses(estado: string) {
  return [
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
    estado === 'Concluída'
      ? 'bg-green-100 text-green-800'
      : estado === 'Agendada'
      ? 'bg-blue-100 text-blue-800'
      : estado === 'Cancelada'
      ? 'bg-red-100 text-red-800'
      : 'bg-yellow-100 text-yellow-800'
  ].join(' ')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Loading -->
    <div v-if="props.isLoading" class="space-y-4">
      <Skeleton class="h-10 w-48" />
      <Skeleton class="h-64 rounded-2xl" />
    </div>

    <div v-else class="rounded-2xl shadow bg-card text-card-foreground p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold">Histórico de Consultas</h3>
        <Button @click="emit('schedule')">
          <Plus class="mr-2 h-4 w-4" />
          Agendar Consulta
        </Button>
      </div>

      <!-- Tabela de consultas -->
      <div v-if="props.consultas && props.consultas.length" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b text-muted-foreground">
              <th class="px-4 py-2 text-left">Data/Hora</th>
              <th class="px-4 py-2 text-left">Doutor</th>
              <th class="px-4 py-2 text-left">Sala</th>
              <th class="px-4 py-2 text-left">Estado</th>
              <th class="px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(c, i) in props.consultas"
              :key="i"
              class="border-b hover:bg-muted/50"
            >
              <td class="px-4 py-3">
                <div>{{ formatarData(c.data) }}</div>
                <div class="text-xs text-muted-foreground">{{ c.hora }}</div>
              </td>
              <td class="px-4 py-3">Dr. {{ c.doutor }}</td>
              <td class="px-4 py-3">{{ c.sala }}</td>
              <td class="px-4 py-3">
                <span :class="badgeClasses(c.estado)">{{ c.estado }}</span>
              </td>
              <td class="px-4 py-3">
                <Button
                  size="sm"
                  variant="outline"
                  @click="emit('view', c)"
                >
                  <Eye class="mr-1 h-4 w-4" />
                  Ver
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center py-8 space-y-3">
        <Calendar class="h-12 w-12 mx-auto text-muted-foreground" />
        <h4 class="text-lg font-medium">Sem consultas</h4>
        <p class="text-sm text-muted-foreground">
          Este paciente ainda não tem consultas registadas.
        </p>
        <Button @click="emit('schedule')">Agendar Primeira Consulta</Button>
      </div>
    </div>
  </div>
</template>


