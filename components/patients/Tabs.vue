<!-- src/components/PatientsTabs.vue -->
<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  active: 'resumo' | 'ficha-clinica' | 'consultas' | 'planos' | 'orcamentos'
}>()

const emit = defineEmits<{
  (e: 'update:active', tab: typeof props.active): void
}>()

function select(tab: typeof props.active) {
  emit('update:active', tab)
}
</script>

<template>
  <div class="md:hidden">
    <select
      v-model="props.active"
      @change="select(($event.target as HTMLSelectElement).value as typeof props.active)"
      class="h-10 w-full rounded-md border px-3 py-2"
    >
      <option value="resumo">Resumo</option>
      <option value="ficha-clinica">Ficha Clínica</option>
      <option value="consultas">Consultas</option>
      <option value="planos">Planos</option>
    </select>
  </div>

  <div class="hidden md:block border-b">
    <div class="flex h-10 items-center space-x-4">
      <button
        @click="select('resumo')"
        :class="props.active==='resumo' ? 'border-primary text-foreground border-b-2' : 'text-muted-foreground'"
        class="px-3 py-1.5 text-sm"
      >
        Resumo
      </button>
      <button
        @click="select('ficha-clinica')"
        :class="props.active==='ficha-clinica' ? 'border-primary text-foreground border-b-2' : 'text-muted-foreground'"
        class="px-3 py-1.5 text-sm"
      >
        Ficha Clínica
      </button>
      <button
        @click="select('orcamentos')"
        :class="props.active==='orcamentos' ? 'border-primary text-foreground border-b-2' : 'text-muted-foreground'"
        class="px-3 py-1.5 text-sm"
      >
        Orçamentos
      </button>
      <button
        @click="select('consultas')"
        :class="props.active==='consultas' ? 'border-primary text-foreground border-b-2' : 'text-muted-foreground'"
        class="px-3 py-1.5 text-sm"
      >
        Consultas
      </button>
      <button
        @click="select('planos')"
        :class="props.active==='planos' ? 'border-primary text-foreground border-b-2' : 'text-muted-foreground'"
        class="px-3 py-1.5 text-sm"
      >
        Planos
      </button>
    </div>
  </div>
</template>
