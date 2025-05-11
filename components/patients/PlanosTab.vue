<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { Calendar, Plus, Eye, Edit, ClipboardList } from 'lucide-vue-next'

interface Plano {
  id: string
  titulo: string
  dataCriacao: string
  estado: string
  progresso: number
  descricao?: string
}

const props = defineProps<{
  isLoading: boolean
  planos?: Plano[]
}>()

const emit = defineEmits<{
  (e: 'new'): void
  (e: 'view', plano: Plano): void
  (e: 'edit', plano: Plano): void
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
    estado === 'Concluído'
      ? 'bg-green-100 text-green-800'
      : estado === 'Em andamento'
      ? 'bg-blue-100 text-blue-800'
      : estado === 'Cancelado'
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
        <h3 class="text-lg font-semibold">Planos de Tratamento</h3>
        <Button @click="emit('new')">
          <Plus class="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      <!-- Lista de planos -->
      <div v-if="props.planos && props.planos.length" class="space-y-4">
        <div
          v-for="(p, i) in props.planos"
          :key="i"
          class="border rounded-lg p-4 space-y-3"
        >
          <div class="flex justify-between items-start">
            <div>
              <h4 class="font-medium">{{ p.titulo }}</h4>
              <div class="flex items-center text-sm text-muted-foreground">
                <Calendar class="h-3.5 w-3.5 mr-1" />
                <span>Criado em {{ formatarData(p.dataCriacao) }}</span>
              </div>
            </div>
            <span :class="badgeClasses(p.estado)">{{ p.estado }}</span>
          </div>

          <!-- Barra de progresso -->
          <div>
            <div class="flex justify-between mb-1 text-sm">
              <span>Progresso</span>
              <span>{{ p.progresso }}%</span>
            </div>
            <div class="w-full bg-muted rounded-full h-2.5">
              <div
                class="bg-primary h-2.5 rounded-full"
                :style="{ width: `${p.progresso}%` }"
              ></div>
            </div>
          </div>

          <!-- Ações -->
          <div class="flex justify-end gap-2">
            <Button size="sm" variant="outline" @click="emit('view', p)">
              <Eye class="mr-1 h-4 w-4" /> Ver
            </Button>
            <Button size="sm" variant="outline" @click="emit('edit', p)">
              <Edit class="mr-1 h-4 w-4" /> Editar
            </Button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-8 space-y-3">
        <ClipboardList class="h-12 w-12 mx-auto text-muted-foreground" />
        <h4 class="text-lg font-medium">Sem planos de tratamento</h4>
        <p class="text-sm text-muted-foreground">
          Este paciente ainda não tem planos de tratamento.
        </p>
        <Button @click="emit('new')">Criar Primeiro Plano</Button>
      </div>
    </div>
  </div>
</template>


